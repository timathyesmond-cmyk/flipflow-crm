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

function calcMonthlyPayment(principal, annualRate, termMonths) {
  if (!principal || !annualRate || !termMonths) return 0;
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / termMonths;
  return principal * (r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1);
}

export default function HybridCalculator() {
  // Sub-2 portion
  const [sub2Loan, setSub2Loan] = useState('');
  const [sub2Payment, setSub2Payment] = useState('');
  // Seller finance portion
  const [sfAmount, setSfAmount] = useState('');
  const [sfRate, setSfRate] = useState('6');
  const [sfTerm, setSfTerm] = useState('30');
  // Deal terms
  const [purchasePrice, setPurchasePrice] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [repairs, setRepairs] = useState('');
  const [arv, setArv] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [holdingMonths, setHoldingMonths] = useState('12');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [expenses, setExpenses] = useState('');

  const sub2LoanNum = parseFloat(sub2Loan) || 0;
  const sub2Pmt = parseFloat(sub2Payment) || 0;
  const sfAmountNum = parseFloat(sfAmount) || 0;
  const sfRateNum = parseFloat(sfRate) || 0;
  const sfTermMo = (parseFloat(sfTerm) || 0) * 12;
  const pp = parseFloat(purchasePrice) || 0;
  const dp = parseFloat(downPayment) || 0;
  const rep = parseFloat(repairs) || 0;
  const arvNum = parseFloat(arv) || 0;
  const exit = parseFloat(exitPrice) || 0;
  const months = parseFloat(holdingMonths) || 0;
  const rent = parseFloat(monthlyRent) || 0;
  const exp = parseFloat(expenses) || 0;

  const sfMonthly = calcMonthlyPayment(sfAmountNum, sfRateNum, sfTermMo);
  const totalMonthlyDebt = sub2Pmt + sfMonthly;
  const totalFinanced = sub2LoanNum + sfAmountNum;
  const cashOutOfPocket = dp + rep;
  const cashflow = rent > 0 ? rent - totalMonthlyDebt - exp : null;
  const holdingCost = totalMonthlyDebt * months;
  const totalCost = cashOutOfPocket + holdingCost;
  const profit = exit > 0 ? exit - totalCost - totalFinanced : null;

  const profitColor = profit !== null ? (profit > 0 ? 'text-emerald-600' : 'text-destructive') : 'text-muted-foreground';
  const cashflowColor = cashflow !== null ? (cashflow > 0 ? 'text-emerald-600' : 'text-destructive') : 'text-muted-foreground';

  return (
    <div className="flex flex-col-reverse md:grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Inputs</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-3">Sub-2 Portion</p>
            <div className="space-y-3 pl-3 border-l-2 border-blue-200">
              <NumInput label="Existing Loan Balance (Sub-2)" value={sub2Loan} onChange={setSub2Loan} />
              <NumInput label="Monthly PITI on Sub-2 Loan" value={sub2Payment} onChange={setSub2Payment} />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-3">Seller Finance Portion</p>
            <div className="space-y-3 pl-3 border-l-2 border-amber-200">
              <NumInput label="Seller Finance Amount" value={sfAmount} onChange={setSfAmount} />
              <div className="space-y-1.5">
                <Label>Interest Rate (%)</Label>
                <Input type="number" placeholder="6" value={sfRate} onChange={e => setSfRate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Term (years)</Label>
                <Input type="number" placeholder="30" value={sfTerm} onChange={e => setSfTerm(e.target.value)} />
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-3">Deal Terms</p>
            <div className="space-y-3 pl-3 border-l-2 border-emerald-200">
              <NumInput label="Purchase Price" value={purchasePrice} onChange={setPurchasePrice} />
              <NumInput label="Down Payment (cash)" value={downPayment} onChange={setDownPayment} />
              <NumInput label="Repair Estimate" value={repairs} onChange={setRepairs} />
              <NumInput label="ARV" value={arv} onChange={setArv} />
              <NumInput label="Exit / Sale Price" value={exitPrice} onChange={setExitPrice} />
              <div className="space-y-1.5">
                <Label>Hold Period (months)</Label>
                <Input type="number" placeholder="12" value={holdingMonths} onChange={e => setHoldingMonths(e.target.value)} />
              </div>
              <NumInput label="Monthly Rent" value={monthlyRent} onChange={setMonthlyRent} />
              <NumInput label="Monthly Expenses" value={expenses} onChange={setExpenses} hint="taxes, insurance, mgmt" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="pt-6 pb-6 text-center space-y-1">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Total Monthly Debt Service</p>
            <p className="text-4xl font-bold text-foreground">{totalMonthlyDebt > 0 ? currency(totalMonthlyDebt) : '—'}</p>
            {cashflow !== null && (
              <p className={`text-sm font-medium ${cashflowColor}`}>Cash flow: {currency(cashflow)}/mo</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5"><Info className="w-3.5 h-3.5 text-muted-foreground" /> Structure Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sub-2 Loan Balance</span>
              <span className="font-medium text-blue-600">{sub2LoanNum > 0 ? currency(sub2LoanNum) : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sub-2 Monthly Pmt</span>
              <span className="font-medium">{sub2Pmt > 0 ? currency(sub2Pmt) : '—'}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="text-muted-foreground">Seller Finance Amount</span>
              <span className="font-medium text-amber-600">{sfAmountNum > 0 ? currency(sfAmountNum) : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">SF Monthly Pmt</span>
              <span className="font-medium">{sfMonthly > 0 ? currency(sfMonthly) : '—'}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="text-muted-foreground">Total Financed</span>
              <span className="font-medium">{totalFinanced > 0 ? currency(totalFinanced) : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cash Out of Pocket</span>
              <span className="font-medium">{cashOutOfPocket > 0 ? currency(cashOutOfPocket) : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Holding Costs ({months}mo)</span>
              <span className="font-medium">{holdingCost > 0 ? currency(holdingCost) : '—'}</span>
            </div>
            {profit !== null && (
              <div className={`flex justify-between font-bold border-t border-border pt-2 ${profitColor}`}>
                <span>Projected Profit</span>
                <span>{currency(profit)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}