import React from 'react';
import { useOutletContext } from 'react-router-dom';
import UpgradeGate from '@/components/UpgradeGate';
import { Calculator as CalculatorIcon, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MAOCalculator from '@/components/calculators/MAOCalculator';
import Sub2Calculator from '@/components/calculators/Sub2Calculator';
import SellerFinanceCalculator from '@/components/calculators/SellerFinanceCalculator';
import HybridCalculator from '@/components/calculators/HybridCalculator';
import ContractsTab from '@/components/calculators/ContractsTab';

const TIER_RANK = { basic: 1, wholesale: 2, pro: 3, trial: 3 };

export default function Calculator() {
  const { effectiveTier } = useOutletContext() || {};

  // Basic tier: no calculator access
  if (effectiveTier === 'basic') {
    return <UpgradeGate requiredTier="wholesale" />;
  }

  const hasFullAccess = !effectiveTier || (TIER_RANK[effectiveTier] || 0) >= TIER_RANK['pro'];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <CalculatorIcon className="w-6 h-6" /> Deal Calculator
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Analyze your deals across different acquisition strategies</p>
      </div>

      <Tabs defaultValue="mao">
        <TabsList className={`grid w-full h-auto gap-1 p-1 ${hasFullAccess ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-1 sm:grid-cols-1 max-w-xs'}`}>
          <TabsTrigger value="mao" className="text-xs sm:text-sm py-2">MAO / Wholesale</TabsTrigger>
          {hasFullAccess && <TabsTrigger value="sub2" className="text-xs sm:text-sm py-2">Subject-To</TabsTrigger>}
          {hasFullAccess && <TabsTrigger value="sf" className="text-xs sm:text-sm py-2">Seller Finance</TabsTrigger>}
          {hasFullAccess && <TabsTrigger value="hybrid" className="text-xs sm:text-sm py-2">Hybrid</TabsTrigger>}
          {hasFullAccess && <TabsTrigger value="contracts" className="text-xs sm:text-sm py-2">Contracts</TabsTrigger>}
        </TabsList>

        <div className="mt-6">
          <TabsContent value="mao"><MAOCalculator /></TabsContent>
          {hasFullAccess && <TabsContent value="sub2"><Sub2Calculator /></TabsContent>}
          {hasFullAccess && <TabsContent value="sf"><SellerFinanceCalculator /></TabsContent>}
          {hasFullAccess && <TabsContent value="hybrid"><HybridCalculator /></TabsContent>}
          {hasFullAccess && <TabsContent value="contracts"><ContractsTab /></TabsContent>}
        </div>
      </Tabs>
    </div>
  );
}