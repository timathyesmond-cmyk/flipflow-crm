import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activeSubs = await base44.asServiceRole.entities.UserSubscription.filter(
      { user_email: user.email, status: 'active' },
      '-created_date',
      1
    );

    if (activeSubs.length === 0) {
      return Response.json({ error: 'No active subscription found' }, { status: 404 });
    }

    const sub = activeSubs[0];
    if (!sub.subscription_id) {
      return Response.json({ error: 'Subscription ID not yet available, please try again shortly' }, { status: 400 });
    }

    const WIX_API_KEY = Deno.env.get('WIX_PAYMENTS_API_KEY');
    const WIX_SITE_ID = Deno.env.get('WIX_PAYMENTS_SITE_ID');

    const response = await fetch(
      `https://www.wixapis.com/payments/base44/v1/subscriptions/${sub.subscription_id}/cancel`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': WIX_API_KEY,
          'wix-site-id': WIX_SITE_ID,
        },
        body: JSON.stringify({
          subscription_id: sub.subscription_id,
          immediate: false,
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Cancel subscription error:', errText);
      // Try immediate cancel as fallback
      const fallback = await fetch(
        `https://www.wixapis.com/payments/base44/v1/subscriptions/${sub.subscription_id}/cancel`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': WIX_API_KEY,
            'wix-site-id': WIX_SITE_ID,
          },
          body: JSON.stringify({ subscription_id: sub.subscription_id, immediate: true }),
        }
      );
      if (!fallback.ok) {
        return Response.json({ error: 'Failed to cancel subscription' }, { status: 500 });
      }
      // Immediate cancel confirmed — mark as canceled now
      await base44.asServiceRole.entities.UserSubscription.update(sub.id, { status: 'canceled' });
      console.log(`Immediately canceled subscription ${sub.subscription_id} for ${user.email}`);
      return Response.json({ success: true, immediate: true });
    }

    const cancelData = await response.json();
    const wixStatus = cancelData.subscription?.status;

    if (wixStatus === 'CANCELED') {
      // Immediate cancel — revoke access now
      await base44.asServiceRole.entities.UserSubscription.update(sub.id, { status: 'canceled' });
      console.log(`Immediately canceled subscription ${sub.subscription_id} for ${user.email}`);
    } else {
      // Soft cancel — Wix keeps the sub ACTIVE until billing cycle ends;
      // the subscription_contract_canceled webhook will flip it to canceled then.
      console.log(`Soft-canceled subscription ${sub.subscription_id} for ${user.email} — access remains until billing cycle ends`);
    }

    return Response.json({ success: true, immediate: wixStatus === 'CANCELED' });
  } catch (error) {
    console.error('cancel-subscription error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});