import { createClientFromRequest } from 'npm:@base44/sdk@0.8.35';
import jwt from 'npm:jsonwebtoken@9.0.2';

Deno.serve(async (req) => {
  try {
    const body = await req.text();

    const WEBHOOK_PUBLIC_KEY = Deno.env.get('WIX_PAYMENTS_WEBHOOK_PUBLIC_KEY');
    if (!WEBHOOK_PUBLIC_KEY) {
      console.error('Missing WIX_PAYMENTS_WEBHOOK_PUBLIC_KEY');
      return new Response('Unauthorized', { status: 401 });
    }

    let rawPayload;
    try {
      rawPayload = jwt.verify(body, WEBHOOK_PUBLIC_KEY, { algorithms: ['RS256'] });
    } catch (err) {
      console.error('JWT verification failed:', err.message);
      return new Response('Unauthorized', { status: 401 });
    }

    // Double-nested JSON per Wix webhook spec
    const event = JSON.parse(rawPayload.data);
    const eventData = JSON.parse(event.data);

    const base44 = createClientFromRequest(req);

    if (event.eventType === 'wix.ecom.v1.order_approved') {
      const order = eventData.actionEvent.body.order;
      const checkoutId = order.checkoutId;

      console.log(`order_approved: checkoutId=${checkoutId}`);

      const subs = await base44.asServiceRole.entities.UserSubscription.filter({
        checkout_id: checkoutId,
        status: 'pending',
      });

      if (subs.length > 0) {
        const sub = subs[0];
        let subscriptionId = null;
        for (const lineItem of order.lineItems || []) {
          if (lineItem.subscriptionInfo) {
            subscriptionId = lineItem.subscriptionInfo.id;
            break;
          }
        }

        await base44.asServiceRole.entities.UserSubscription.update(sub.id, {
          status: 'active',
          subscription_id: subscriptionId,
        });
        console.log(`Activated subscription for ${sub.user_email}, tier: ${sub.tier}, subscription_id: ${subscriptionId}`);

        // Check for referral — if this user was referred, update status and notify referrer
        const referrals = await base44.asServiceRole.entities.Referral.filter({
          referred_email: sub.user_email,
          status: 'pending',
        });
        if (referrals.length > 0) {
          const ref = referrals[0];
          await base44.asServiceRole.entities.Referral.update(ref.id, { status: 'subscribed' });
          console.log(`Referral converted: ${sub.user_email} referred by ${ref.referrer_email}`);
          // Get referrer's name
          const referrerUsers = await base44.asServiceRole.entities.User.filter({ email: ref.referrer_email });
          const referrerName = referrerUsers[0]?.full_name?.split(' ')[0] || 'there';
          // Notify referrer of reward
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: ref.referrer_email,
            from_name: 'FlipFlow CRM',
            subject: '\uD83C\uDF89 You earned a free month — someone you referred just subscribed!',
            body: '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>'
              + '<body style="margin:0;padding:0;background:#f1f5f9;font-family:\'Helvetica Neue\',Arial,sans-serif;">'
              + '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">'
              + '<tr><td align="center">'
              + '<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">'
              + '<tr><td style="background:linear-gradient(135deg,#1e3a5f 0%,#2d5282 100%);padding:32px 40px;text-align:center;">'
              + '<table cellpadding="0" cellspacing="0" align="center"><tr>'
              + '<td style="background:rgba(255,255,255,0.15);border-radius:10px;padding:10px 14px;">'
              + '<span style="font-size:22px;font-weight:800;color:#f6ad55;">&#127968; FlipFlow</span>'
              + '</td></tr></table>'
              + '<p style="margin:12px 0 0;color:rgba(255,255,255,0.7);font-size:11px;letter-spacing:2px;text-transform:uppercase;">Wholesale CRM</p>'
              + '</td></tr>'
              + '<tr><td style="padding:40px;">'
              + '<h2 style="margin:0 0 16px;font-size:22px;color:#1e3a5f;">&#127881; You earned a free month, ' + referrerName + '!</h2>'
              + '<p style="margin:0 0 14px;font-size:14px;color:#475569;line-height:1.7;">Someone you referred just subscribed to FlipFlow. Your referral reward of <strong>1 free month</strong> is ready to be applied to your account.</p>'
              + '<p style="margin:0 0 14px;font-size:14px;color:#475569;line-height:1.7;">Reply to this email or contact us at <a href="mailto:support@flipflowcrm.com" style="color:#1e3a5f;">support@flipflowcrm.com</a> and we\'ll add the free month within 24 hours.</p>'
              + '<p style="margin:0 0 6px;font-size:13px;color:#64748b;">Keep spreading the word — there\'s no limit to how many referral rewards you can earn!</p>'
              + '</td></tr>'
              + '<tr><td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center;">'
              + '<p style="margin:0;font-size:13px;font-weight:600;color:#1e3a5f;">&#127968; FlipFlow Wholesale CRM</p>'
              + '</td></tr>'
              + '</table></td></tr></table></body></html>',
          });
        }
      } else {
        console.warn(`No pending subscription found for checkoutId: ${checkoutId}`);
      }

    } else if (
      event.eventType === 'wix.ecom.subscription_contracts.v1.subscription_contract_canceled' ||
      event.eventType === 'wix.ecom.subscription_contracts.v1.subscription_contract_expired'
    ) {
      const subscriptionContract = eventData.actionEvent.body.subscriptionContract;
      const subscriptionId = subscriptionContract.id;
      const newStatus = event.eventType.includes('canceled') ? 'canceled' : 'expired';

      console.log(`${newStatus}: subscriptionId=${subscriptionId}`);

      const subs = await base44.asServiceRole.entities.UserSubscription.filter({
        subscription_id: subscriptionId,
      });

      if (subs.length > 0) {
        await base44.asServiceRole.entities.UserSubscription.update(subs[0].id, { status: newStatus });
        console.log(`Marked subscription ${subscriptionId} as ${newStatus}`);
      }
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return new Response('Error', { status: 500 });
  }
});