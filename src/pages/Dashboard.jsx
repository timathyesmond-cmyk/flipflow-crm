import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Plus, HandCoins, DollarSign, TrendingUp, Target, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import StatCard from '@/components/dashboard/StatCard';
import PipelineChart from '@/components/dashboard/PipelineChart';
import RecentDeals from '@/components/dashboard/RecentDeals';
import MonthlyProfitChart from '@/components/dashboard/MonthlyProfitChart';
import OnboardingTutorial from '@/components/OnboardingTutorial';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: () => base44.entities.Deal.list('-updated_date'),
  });

  const totalDeals = deals.length;
  const activeDeals = deals.filter(d => !['closed', 'dead'].includes(d.stage)).length;
  const closedDeals = deals.filter(d => d.stage === 'closed').length;
  const totalProfit = deals.filter(d => d.stage === 'closed').reduce((sum, d) => sum + (d.assignment_fee || 0), 0);
  const pipelineValue = deals.filter(d => !['closed', 'dead'].includes(d.stage)).reduce((sum, d) => sum + (d.assignment_fee || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {firstName}</h1>
          <p className="text-sm text-muted-foreground mt-1">Here's your deal pipeline at a glance.</p>
        </div>
        <Link to="/deals">
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> New Deal
          </Button>
        </Link>
      </div>

      {/* Onboarding */}
      <OnboardingTutorial />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Deals" value={totalDeals} icon={HandCoins} />
        <StatCard label="Active Deals" value={activeDeals} icon={Target} />
        <StatCard label="Deals Closed" value={closedDeals} icon={TrendingUp} />
        <StatCard label="Total Profit" value={`$${totalProfit.toLocaleString()}`} icon={DollarSign} />
      </div>

      {/* Charts + Recent */}
      <div className="grid lg:grid-cols-2 gap-4">
        <PipelineChart deals={deals} />
        <RecentDeals deals={deals} />
      </div>

      {/* Monthly Profit */}
      <MonthlyProfitChart deals={deals} />

      {/* Pipeline value */}
      {pipelineValue > 0 && (
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground">
          <p className="text-sm font-medium opacity-80">Pipeline Value (Potential Fees)</p>
          <p className="text-3xl font-bold mt-1">${pipelineValue.toLocaleString()}</p>
          <p className="text-xs opacity-60 mt-1">From {activeDeals} active deal{activeDeals !== 1 ? 's' : ''}</p>
        </div>
      )}
    </div>
  );
}