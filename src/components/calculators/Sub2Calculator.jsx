import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Info } from 'lucide-react';

function currency(val) {
  if (!val && val !== 0) return '—';
  return '$' + Number(val).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function NumInput({ label, value, onChange, hint }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}{hint && <span className="ml-1 text-xs text-muted-foreground">({hint})</span>}</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
        <Input type="number" placeholder="0" value={value} onChange={e => onChange(e.target.value)} className="pl-7" />
      </div>
    </div>
  );
}

export default function Sub2Calculator() {
  const [purchasePrice, setPurchasePrice] = useState('');
  const [existingLoan, setExistingLoan] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [arv, setArv] = useState('');
  const [repairs, setRepairs] = useState('');
  const [holdingMonths, setHoldingMonths] = useState('6');
  const [exitPrice, setExitPrice] = useState('');

  const pp = parseFloat(purchasePrice) || 0;
  const loan = parseFloat(existingLoan) || 0;
  const pmt = parseFloat(monthlyPayment) || 0;
  const arvNum = parseFloat(arv) || 0;
  const rep = parseFloat(repairs) || 0;
  const months = parseFloat(holdingMonths) || 0;
  const exit = parseFloat(exitPrice) || 0;

  const equity = pp > 0 ? pp - loan : null;
  const totalPayments = pmt * months;
  const totalCost = pp + rep + totalPayments;
  const profit = exit > 0 && totalCost > 0 ? exit - totalCost : null;
  const roi = profit !== null && totalCost > 0 ? (profit / totalCost) * 100 : null;

  const profitColor = profit !== null ? (profit > 0 ? 'text-emerald-600' : 'text-destructive') : 'text-muted-foreground';

  return (
    <div className="flex flex-col-reverse md:grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Inputs</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <NumInput label="Purchase / Agreed Price" value={purchasePrice} onChange={setPurchasePrice} />
          <NumInput label="Existing Loan Balance" value={existingLoan} onChange={setExistingLoan} hint="taken subject-to" />
          <NumInput label="Monthly PITI Payment" value={monthlyPayment} onChange={setMonthlyPayment} hint="existing mortgage" />
          <NumInput label="ARV" value={arv} onChange={setArv} />
          <NumInput label="Repair Estimate" value={repairs} onChange={setRepairs} />
          <div className="space-y-1.5">
            <Label>Estimated Hold (months)</Label>
            <Input type="number" placeholder="6" value={holdingMonths} onChange={e => setHoldingMonths(e.target.value)} />
          </div>
          <NumInput label="Projected Exit / Sale Price" value={exitPrice} onChange={setExitPrice} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="pt-6 pb-6 text-center space-y-1">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Projected Profit</p>
            <p className={`text-4xl font-bold ${profitColor}`}>{profit !== null ? currency(profit) : '—'}</p>
            {roi !== null && <p className="text-sm text-muted-foreground">ROI: {roi.toFixed(1)}%</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5"><Info className="w-3.5 h-3.5 text-muted-foreground" /> Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Existing Equity Captured</span>
              <span className="font-medium">{equity !== null ? currency(equity) : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Loan Taken Subject-To</span>
              <span className="font-medium">{loan > 0 ? currency(loan) : '—'}</span>
            </div>
            <div className="flex justify-between text-destructive">
              <span>− Repairs</span>
              <span>{rep > 0 ? currency(rep) : '—'}</span>
            </div>
            <div className="flex justify-between text-destructive">
              <span>− Holding Payments ({months}mo)</span>
              <span>{totalPayments > 0 ? currency(totalPayments) : '—'}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between text-muted-foreground">
              <span>Total Cost Basis</span>
              <span>{totalCost > 0 ? currency(totalCost) : '—'}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Exit Price</span>
              <span>{exit > 0 ? currency(exit) : '—'}</span>
            </div>
            <div className={`flex justify-between font-bold border-t border-border pt-2 ${profitColor}`}>
              <span>= Profit</span>
              <span>{profit !== null ? currency(profit) : '—'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}