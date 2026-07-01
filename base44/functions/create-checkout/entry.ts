import { createClientFromRequest } from 'npm:@base44/sdk@0.8.35';

const TIER_PRICES = {
  basic:     { price: '14.99', name: 'FlipFlow Basic Plan' },
  wholesale: { price: '24.99', name: 'FlipFlow Wholesale Plan' },
  pro:       { price: '49.99', name: 'FlipFlow Pro Plan' },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tier } = await req.json();
    if (!TIER_PRICES[tier]) {
      return Response.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const tierInfo = TIER_PRICES[tier];
    const origin = req.headers.get('origin') || req.headers.get('Origin') || '';

    const WIX_API_KEY = Deno.env.get('WIX_PAYMENTS_API_KEY');
    const WIX_SITE_ID = Deno.env.get('WIX_PAYMENTS_SITE_ID');

    const checkoutRes = await fetch(
      'https://www.wixapis.com/payments/platform/v1/checkout-sessions/construct',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': WIX_API_KEY,
          'wix-site-id': WIX_SITE_ID,
        },
        body: JSON.stringify({
          cart: {
            items: [{
              name: tierInfo.name,
              quantity: 1,
              price: tierInfo.price,
              subscriptionInfo: {
                subscriptionSettings: { frequency: 'MONTH' },
                title: tierInfo.name,
                description: `Monthly subscription — ${tierInfo.name}`,
              },
            }],
            customerInfo: { email: user.email },
          },
          callbackUrls: {
            postFlowUrl: `${origin}/pricing`,
            thankYouPageUrl: `${origin}/thank-you?tier=${tier}`,
          },
        }),
      }
    );

    if (!checkoutRes.ok) {
      const errText = await checkoutRes.text();
      console.error('Wix checkout error:', errText);
      return Response.json({ error: 'Failed to create checkout session' }, { status: 500 });
    }

    const data = await checkoutRes.json();
    const checkoutSession = data.checkoutSession;

    // Save pending subscription so webhook can correlate later
    await base44.asServiceRole.entities.UserSubscription.create({
      user_email: user.email,
      checkout_id: checkoutSession.id,
      tier,
      status: 'pending',
      amount: parseFloat(tierInfo.price),
    });

    console.log(`Created pending subscription for ${user.email}, tier: ${tier}, checkout: ${checkoutSession.id}`);
    return Response.json({ redirectUrl: checkoutSession.redirectUrl });
  } catch (error) {
    console.error('create-checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});