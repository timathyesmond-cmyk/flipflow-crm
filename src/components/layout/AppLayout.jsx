import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useTrial } from '@/hooks/useTrial';
import TrialExpiredPaywall from '@/components/TrialExpiredPaywall';
import TrialBanner from '@/components/TrialBanner';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { trialStatus, daysRemaining } = useTrial(user);

  if (trialStatus === 'expired') {
    return <TrialExpiredPaywall />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 h-14 flex items-center">
        <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-muted">
          <Menu className="w-5 h-5" />
        </button>
        <span className="ml-3 font-semibold text-sm">DealFlow</span>
      </div>

      {/* Main content */}
      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        {trialStatus === 'active' && daysRemaining !== null && daysRemaining <= 3 && (
          <TrialBanner daysRemaining={daysRemaining} />
        )}
        <Outlet />
      </main>
    </div>
  );
}