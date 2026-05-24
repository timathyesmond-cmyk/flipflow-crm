import React, { useState } from 'react';
import { Check, Zap, Star, Crown, LogOut, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';

const TIERS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 14.99,
    icon: Zap,
    color: 'blue',
    description: 'Essential tools to get started in wholesaling',
    features: [
      'Dashboard & overview',
      'Unlimited deal tracking',
      'Contact management (buyers & sellers)',
      'Interactive map view',
      'Activity timeline & notes',
      'Follow-up reminders',
    ],
    cta: 'Start Basic',
  },
  {
    id: 'wholesale',
    name: 'Wholesale',
    price: 24.99,
    icon: Star,
    color: 'amber',
    popular: true,
    description: 'Add deal analysis to supercharge your offers',
    features: [
      'Everything in Basic',
      'MAO / Wholesale Calculator',
      'Max allowable offer analysis',
      'Deal profit estimator',
      'Auto-save to deals',
    ],
    cta: 'Start Wholesale',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49.99,
    icon: Crown,
    color: 'purple',
    description: 'Full CRM power for serious investors',
    features: [
      'Everything in Wholesale',
      'Sub-To & Seller Finance calculators',
      'Hybrid deal calculator',
      'Contract generators (PDF)',
      'Email & SMS templates',
      'Suggestions board',
      'Settings & customization',
    ],
    cta: 'Start Pro',
  },
];

const COLOR_MAP = {
  blue:   { badge: 'bg-blue-100 text-blue-700',   ring: 'ring-blue-300',  btn: 'bg-blue-600 hover:bg-blue-700 text-white',   icon: 'text-blue-600',   grad: 'from-blue-50 to-white'   },
  amber:  { badge: 'bg-amber-100 text-amber-700',  ring: 'ring-amber-400', btn: 'bg-amber-500 hover:bg-amber-600 text-white',  icon: 'text-amber-500',  grad: 'from-amber-50 to-white'  },
  purple: { badge: 'bg-purple-100 text-purple-700',ring: 'ring-purple-300',btn: 'bg-purple-600 hover:bg-purple-700 text-white',icon: 'text-purple-600', grad: 'from-purple-50 to-white' },
};

export default function Pricing({ isPaywall = false, currentTier = null }) {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubscribe = async (tierId) => {
    setLoading(tierId);
    setError(null);
    try {
      const res = await base44.functions.invoke('create-checkout', { tier: tierId });
      if (res.data?.redirectUrl) {
        window.location.href = res.data.redirectUrl;
      } else {
        setError('Failed to start checkout. Please try again.');
      }
    } catch (e) {
      console.error(e);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start py-12 px-4">
      {/* Header */}
      <div className="text-center max-w-xl mb-10 space-y-3">
        {isPaywall && (
          <Badge className="bg-orange-100 text-orange-700 border-0 mb-2">Trial Ended</Badge>
        )}
        <h1 className="text-3xl font-bold tracking-tight">
          {isPaywall ? 'Choose a plan to continue' : 'FlipFlow Plans'}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isPaywall
            ? 'Your free trial has ended. Pick the plan that fits your workflow and keep crushing deals.'
            : 'Simple monthly pricing — cancel anytime.'}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-6">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {TIERS.map(tier => {
          const c = COLOR_MAP[tier.color];
          const Icon = tier.icon;
          const isCurrent = currentTier === tier.id;
          return (
            <div
              key={tier.id}
              className={`relative rounded-2xl border bg-gradient-to-b ${c.grad} p-6 flex flex-col gap-5 shadow-sm transition-all
                ${tier.popular ? `ring-2 ${c.ring} shadow-md` : ''}
                ${isCurrent ? 'opacity-75' : ''}
              `}
            >
              {tier.popular && (
                <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full ${c.badge} border`}>
                  Most Popular
                </span>
              )}
              {isCurrent && (
                <span className="absolute -top-3 right-4 text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
                  Current Plan
                </span>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${c.icon}`} />
                  <span className="font-bold text-lg">{tier.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{tier.description}</p>
              </div>

              <div>
                <span className="text-4xl font-extrabold">${tier.price}</span>
                <span className="text-muted-foreground text-sm"> / month</span>
              </div>

              <ul className="space-y-2 flex-1">
                {tier.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${c.btn} font-semibold`}
                disabled={!!loading || isCurrent}
                onClick={() => !isCurrent && handleSubscribe(tier.id)}
              >
                {loading === tier.id ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting…</>
                ) : isCurrent ? 'Current Plan' : tier.cta}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <p className="text-xs text-muted-foreground mt-8 text-center">
        Secure payment via Base44 Payments · Cancel anytime · No hidden fees
      </p>
      {isPaywall && (
        <button
          onClick={() => base44.auth.logout()}
          className="mt-4 text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
        >
          Sign out
        </button>
      )}
    </div>
  );
}