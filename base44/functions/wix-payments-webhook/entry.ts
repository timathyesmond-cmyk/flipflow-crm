import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
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