import React from 'react';
import { Lock, Zap, Star, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const TIER_INFO = {
  wholesale: {
    icon: Star,
    name: 'Wholesale',
    price: '$24.99/mo',
    color: 'amber',
    description: 'Unlock the MAO / Wholesale Calculator and deal analysis tools.',
  },
  pro: {
    icon: Crown,
    name: 'Pro',
    price: '$49.99/mo',
    color: 'purple',
    description: 'Get full access to all calculators, contract generators, templates, and settings.',
  },
};

const COLOR_MAP = {
  amber:  { bg: 'bg-amber-50',  icon: 'text-amber-500',  btn: 'bg-amber-500 hover:bg-amber-600 text-white',  border: 'border-amber-200'  },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', btn: 'bg-purple-600 hover:bg-purple-700 text-white', border: 'border-purple-200' },
};

export default function UpgradeGate({ requiredTier = 'pro' }) {
  const navigate = useNavigate();
  const info = TIER_INFO[requiredTier] || TIER_INFO.pro;
  const c = COLOR_MAP[info.color];
  const Icon = info.icon;

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className={`max-w-sm w-full rounded-2xl border ${c.border} ${c.bg} p-8 text-center space-y-5 shadow-sm`}>
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center">
            <Lock className="w-7 h-7 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-2">
            <Icon className={`w-4 h-4 ${c.icon}`} />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {info.name} Plan Required
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Upgrade to unlock this</h2>
          <p className="text-sm text-muted-foreground">{info.description}</p>
        </div>

        <div>
          <p className="text-3xl font-extrabold">{info.price}</p>
          <p className="text-xs text-muted-foreground">billed monthly · cancel anytime</p>
        </div>

        <Button
          className={`w-full font-semibold ${c.btn}`}
          onClick={() => navigate('/pricing')}
        >
          View Plans
        </Button>
      </div>
    </div>
  );
}