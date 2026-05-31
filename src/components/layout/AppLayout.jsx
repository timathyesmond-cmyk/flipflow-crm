import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import GlobalSearch from './GlobalSearch';
import { Menu } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useTrial } from '@/hooks/useTrial';
import TrialExpiredPaywall from '@/components/TrialExpiredPaywall';
import { useSubscription } from '@/hooks/useSubscription';
import UpgradeGate from '@/components/UpgradeGate';
import TrialBanner from '@/components/TrialBanner';

const TIER_RANK = { basic: 1, wholesale: 2, pro: 3, trial: 3 };
const ROUTE_REQUIRED_TIER = {
  '/calculator': 'wholesale',
  '/settings': 'pro',
  '/suggestions': 'pro',
};

function getRequiredTier(pathname) {
  for (const [route, tier] of Object.entries(ROUTE_REQUIRED_TIER)) {
    if (pathname.startsWith(route)) return tier;
  }
  return 'basic';
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  // Claim any pending referral code after user logs in
  useEffect(() => {
    if (!user?.email) return;
    const refCode = localStorage.getItem('flipflow_ref');
    if (!refCode) return;
    localStorage.removeItem('flipflow_ref');
    // Check we don't already have a referral record for this email
    // Decode base64 referral code to get referrer email
    let referrerEmail = null;
    try { referrerEmail = atob(refCode + '=='); } catch (e) { return; }
    if (!referrerEmail || referrerEmail === user.email) return;

    import('@/api/base44Client').then(({ base44 }) => {
      base44.entities.Referral.filter({ referred_email: user.email }).then(existing => {
        if (existing.length === 0) {
          base44.entities.Referral.create({
            referrer_email: referrerEmail,
            referred_email: user.email,
            referral_code: refCode,
            status: 'pending',
            reward_months: 1,
          });
        }
      });
    });
  }, [user?.email]);
  const location = useLocation();
  const { trialStatus, daysRemaining } = useTrial(user);
  const { tier: subTier, loading: subLoading } = useSubscription(user);

  // Show loading while checking subscription
  if (trialStatus === 'loading' || subLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Always allow pricing and thank-you pages
  const isPublicRoute = location.pathname === '/pricing' || location.pathname === '/thank-you';

  // Compute effective tier
  const effectiveTier = subTier || (trialStatus === 'active' ? 'trial' : null);

  if (!effectiveTier && !isPublicRoute) {
    return <TrialExpiredPaywall />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} effectiveTier={effectiveTier} />

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 h-14 flex items-center gap-3">
        <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-muted flex-shrink-0">
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-semibold text-sm flex-shrink-0">DealFlow</span>
        <GlobalSearch className="flex-1" />
      </div>

      {/* Main content */}
      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        {trialStatus === 'active' && daysRemaining !== null && daysRemaining <= 3 && (
          <TrialBanner daysRemaining={daysRemaining} />
        )}
        {(() => {
          if (isPublicRoute || !effectiveTier) return <Outlet context={{ effectiveTier }} />;
          const requiredTier = getRequiredTier(location.pathname);
          const canAccess = (TIER_RANK[effectiveTier] || 0) >= TIER_RANK[requiredTier];
          return canAccess
            ? <Outlet context={{ effectiveTier }} />
            : <UpgradeGate requiredTier={requiredTier} />;
        })()}
      </main>
    </div>
  );
}