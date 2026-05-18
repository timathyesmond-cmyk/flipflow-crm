import React from 'react';
import { Calculator as CalculatorIcon, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MAOCalculator from '@/components/calculators/MAOCalculator';
import Sub2Calculator from '@/components/calculators/Sub2Calculator';
import SellerFinanceCalculator from '@/components/calculators/SellerFinanceCalculator';
import HybridCalculator from '@/components/calculators/HybridCalculator';
import PurchaseAgreementGenerator from '@/components/calculators/PurchaseAgreementGenerator';
import AssignmentContractGenerator from '@/components/calculators/AssignmentContractGenerator';

export default function Calculator() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <CalculatorIcon className="w-6 h-6" /> Deal Calculator
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Analyze your deals across different acquisition strategies</p>
      </div>

      <Tabs defaultValue="mao">
        <TabsList className="grid grid-cols-2 sm:grid-cols-6 w-full h-auto gap-1 p-1">
          <TabsTrigger value="mao" className="text-xs sm:text-sm py-2">MAO / Wholesale</TabsTrigger>
          <TabsTrigger value="sub2" className="text-xs sm:text-sm py-2">Subject-To</TabsTrigger>
          <TabsTrigger value="sf" className="text-xs sm:text-sm py-2">Seller Finance</TabsTrigger>
          <TabsTrigger value="hybrid" className="text-xs sm:text-sm py-2">Hybrid</TabsTrigger>
          <TabsTrigger value="agreement" className="text-xs sm:text-sm py-2">Purchase Agreement</TabsTrigger>
          <TabsTrigger value="assignment" className="text-xs sm:text-sm py-2">Assignment Contract</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="mao"><MAOCalculator /></TabsContent>
          <TabsContent value="sub2"><Sub2Calculator /></TabsContent>
          <TabsContent value="sf"><SellerFinanceCalculator /></TabsContent>
          <TabsContent value="hybrid"><HybridCalculator /></TabsContent>
          <TabsContent value="agreement"><PurchaseAgreementGenerator /></TabsContent>
          <TabsContent value="assignment"><AssignmentContractGenerator /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}