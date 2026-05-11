import React, { useState } from 'react';
import { Calculator as CalculatorIcon, DollarSign, TrendingUp, Wrench, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Sub2Calculator from '@/components/calculators/Sub2Calculator';
import SellerFinanceCalculator from '@/components/calculators/SellerFinanceCalculator';
import HybridCalculator from '@/components/calculators/HybridCalculator';

function currency(val) {
  if (!val && val !== 0) return '—';
  return '$' + Number(val).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function pct(val) {
  return (val * 100).toFixed(0) + '%';
}

function MAOCalculator() {
  const [arv, setArv] = useState('');
  const [repairs, setRepairs] = useState('');
  const [percentArv, setPercentArv] = useState(70);
  const [assignmentFee, setAssignmentFee] = useState('');

  const arvNum = parseFloat(arv) || 0;
  const repairsNum = parseFloat(repairs) || 0;
  const feeNum = parseFloat(assignmentFee) || 0;

  const mao = arvNum > 0 ? (arvNum * (percentArv / 100)) - repairsNum - feeNum : null;
  const maxOffer = arvNum > 0 ? arvNum * (percentArv / 100) : null;
  const equity = arvNum > 0 && mao !== null ? arvNum - mao - repairsNum : null;
  const maoColor = mao !== null ? (mao > 0 ? 'text-emerald-600' : 'text-destructive') : 'text-muted-foreground';

  return (
    <div className="flex flex-col-reverse md:grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Inputs</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />After Repair Value (ARV)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input type="number" placeholder="0" value={arv} onChange={e => setArv(e.target.value)} className="pl-7" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5 text-muted-foreground" />Repair Estimate</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input type="number" placeholder="0" value={repairs} onChange={e => setRepairs(e.target.value)} className="pl-7" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-muted-foreground" />Assignment Fee</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input type="number" placeholder="0" value={assignmentFee} onChange={e => setAssignmentFee(e.target.value)} className="pl-7" />
            </div>
          </div>
          <div className="space-y-3">
            <Label className="flex items-center justify-between">
              <span>ARV Multiplier</span>
              <span className="font-bold text-primary">{percentArv}%</span>
            </Label>
            <Slider min={50} max={90} step={1} value={[percentArv]} onValueChange={([v]) => setPercentArv(v)} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>50% (conservative)</span>
              <span>90% (aggressive)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="pt-6 pb-6 text-center space-y-1">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Maximum Allowable Offer</p>
            <p className={`text-4xl font-bold ${maoColor}`}>{mao !== null ? currency(mao) : '—'}</p>
            {mao !== null && mao <= 0 && <p className="text-xs text-destructive mt-1">Deal doesn't pencil at these numbers</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5"><Info className="w-3.5 h-3.5 text-muted-foreground" />Formula Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">ARV</span><span className="font-medium">{arvNum > 0 ? currency(arvNum) : '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">× {pct(percentArv / 100)}</span><span className="font-medium">{maxOffer !== null ? currency(maxOffer) : '—'}</span></div>
            <div className="flex justify-between text-destructive"><span>− Repairs</span><span>{repairsNum > 0 ? currency(repairsNum) : '—'}</span></div>
            <div className="flex justify-between text-destructive"><span>− Assignment Fee</span><span>{feeNum > 0 ? currency(feeNum) : '—'}</span></div>
            <div className={`border-t border-border pt-2 flex justify-between font-bold ${maoColor}`}><span>= MAO</span><span>{mao !== null ? currency(mao) : '—'}</span></div>
          </CardContent>
        </Card>
        {equity !== null && arvNum > 0 && (
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div><p className="text-xs text-muted-foreground">Total Equity</p><p className="text-xl font-bold">{currency(equity)}</p></div>
                <div className="text-right"><p className="text-xs text-muted-foreground">Repairs as % of ARV</p><p className="text-xl font-bold">{arvNum > 0 ? pct(repairsNum / arvNum) : '—'}</p></div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

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
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-auto gap-1 p-1">
          <TabsTrigger value="mao" className="text-xs sm:text-sm py-2">MAO / Wholesale</TabsTrigger>
          <TabsTrigger value="sub2" className="text-xs sm:text-sm py-2">Subject-To</TabsTrigger>
          <TabsTrigger value="sf" className="text-xs sm:text-sm py-2">Seller Finance</TabsTrigger>
          <TabsTrigger value="hybrid" className="text-xs sm:text-sm py-2">Hybrid</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="mao"><MAOCalculator /></TabsContent>
          <TabsContent value="sub2"><Sub2Calculator /></TabsContent>
          <TabsContent value="sf"><SellerFinanceCalculator /></TabsContent>
          <TabsContent value="hybrid"><HybridCalculator /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}