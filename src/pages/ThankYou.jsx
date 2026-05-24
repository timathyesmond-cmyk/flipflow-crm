import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';

const TIER_NAMES = { basic: 'Basic', wholesale: 'Wholesale', pro: 'Pro' };

export default function ThankYou() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const tier = urlParams.get('tier') || '';

  const [status, setStatus] = useState('polling'); // 'polling' | 'active' | 'timeout'

  useEffect(() => {
    let attempts = 0;
    const MAX = 24; // ~2 minutes polling

    const poll = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) return;

        const subs = await base44.entities.UserSubscription.filter(
          { user_email: user.email, status: 'active' },
          '-created_date',
          1
        );

        if (subs.length > 0) {
          setStatus('active');
          setTimeout(() => navigate('/'), 2500);
          return;
        }
      } catch (e) {
        console.error('Polling error:', e);
      }

      attempts++;
      if (attempts >= MAX) {
        setStatus('timeout');
        return;
      }
      setTimeout(poll, 5000);
    };

    const timer = setTimeout(poll, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        {status === 'polling' && (
          <>
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Confirming your payment…</h1>
              <p className="text-muted-foreground text-sm">
                We're activating your{tier ? ` ${TIER_NAMES[tier] || tier}` : ''} plan. This usually takes a few seconds.
              </p>
            </div>
          </>
        )}

        {status === 'active' && (
          <>
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">You're all set! 🎉</h1>
              <p className="text-muted-foreground text-sm">
                Your {tier ? TIER_NAMES[tier] : ''} plan is now active. Redirecting you to the dashboard…
              </p>
            </div>
          </>
        )}

        {status === 'timeout' && (
          <>
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Taking longer than expected</h1>
              <p className="text-muted-foreground text-sm">
                Your payment was received but activation is delayed. It should complete within a few minutes.
              </p>
            </div>
            <Button onClick={() => navigate('/')} className="w-full">
              Go to Dashboard
            </Button>
          </>
        )}
      </div>
    </div>
  );
}