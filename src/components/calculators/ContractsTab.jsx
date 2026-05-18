import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PurchaseAgreementGenerator from './PurchaseAgreementGenerator';
import AssignmentContractGenerator from './AssignmentContractGenerator';
import JointVentureContractGenerator from './JointVentureContractGenerator';

export default function ContractsTab() {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="purchase">
        <TabsList className="w-full h-auto gap-1 p-1">
          <TabsTrigger value="purchase" className="text-xs sm:text-sm py-2 flex-1">Purchase Agreement</TabsTrigger>
          <TabsTrigger value="assignment" className="text-xs sm:text-sm py-2 flex-1">Assignment Contract</TabsTrigger>
          <TabsTrigger value="jv" className="text-xs sm:text-sm py-2 flex-1">Joint Venture</TabsTrigger>
        </TabsList>
        <div className="mt-6">
          <TabsContent value="purchase"><PurchaseAgreementGenerator /></TabsContent>
          <TabsContent value="assignment"><AssignmentContractGenerator /></TabsContent>
          <TabsContent value="jv"><JointVentureContractGenerator /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}