import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
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

export default function SellerFinanceCalculator() {
  const [purchasePrice, setPurchasePrice] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [interestRate, setInterestRate] = useState('6');
  const [termYears, setTermYears] = useState('30');
  const [balloonYears, setBalloonYears] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [expenses, setExpenses] = useState('');

  const pp = parseFloat(purchasePrice) || 0;
  const dp = parseFloat(downPayment) || 0;
  const rate = parseFloat(interestRate) || 0;
  const term = (parseFloat(termYears) || 0) * 12;
  const balloonMo = balloonYears ? (parseFloat(balloonYears) || 0) * 12 : null;
  const rent = parseFloat(monthlyRent) || 0;
  const exp = parseFloat(expenses) || 0;

  const principal = pp - dp;
  const monthly = principal > 0 ? calcMonthlyPayment(principal, rate, term) : 0;
  const cashflow = rent > 0 ? rent - monthly - exp : null;
  const totalInterest = monthly > 0 && term > 0 ? (monthly * term) - principal : null;

  // Balloon balance (remaining principal at balloon date)
  let balloonBalance = null;
  if (balloonMo && principal > 0 && rate > 0) {
    const r = rate / 100 / 12;
    balloonBalance = principal * Math.pow(1 + r, balloonMo) - monthly * ((Math.pow(1 + r, balloonMo) - 1) / r);
  }

  const cashflowColor = cashflow !== null ? (cashflow > 0 ? 'text-emerald-600' : 'text-destructive') : 'text-muted-foreground';

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Inputs</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <NumInput label="Purchase Price" value={purchasePrice} onChange={setPurchasePrice} />
          <NumInput label="Down Payment" value={downPayment} onChange={setDownPayment} />
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              <span>Interest Rate</span>
              <span className="font-bold text-primary">{interestRate}%</span>
            </Label>
            <Slider min={1} max={15} step={0.25} value={[parseFloat(interestRate) || 6]}
              onValueChange={([v]) => setInterestRate(String(v))} />
            <div className="flex justify-between text-xs text-muted-foreground"><span>1%</span><span>15%</span></div>
          </div>
          <div className="space-y-1.5">
            <Label>Amortization Term (years)</Label>
            <Input type="number" placeholder="30" value={termYears} onChange={e => setTermYears(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Balloon Payment (years) <span className="text-xs text-muted-foreground">optional</span></Label>
            <Input type="number" placeholder="e.g. 5" value={balloonYears} onChange={e => setBalloonYears(e.target.value)} />
          </div>
          <NumInput label="Monthly Rent / Income" value={monthlyRent} onChange={setMonthlyRent} />
          <NumInput label="Monthly Expenses" value={expenses} onChange={setExpenses} hint="taxes, insurance, mgmt" />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="pt-6 pb-6 text-center space-y-1">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Monthly Payment</p>
            <p className="text-4xl font-bold text-foreground">{monthly > 0 ? currency(monthly) : '—'}</p>
            {cashflow !== null && (
              <p className={`text-sm font-medium ${cashflowColor}`}>
                Cash flow: {currency(cashflow)}/mo
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5"><Info className="w-3.5 h-3.5 text-muted-foreground" /> Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Purchase Price</span>
              <span className="font-medium">{pp > 0 ? currency(pp) : '—'}</span>
            </div>
            <div className="flex justify-between text-destructive">
              <span>− Down Payment</span>
              <span>{dp > 0 ? currency(dp) : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Financed Amount</span>
              <span className="font-medium">{principal > 0 ? currency(principal) : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rate / Term</span>
              <span className="font-medium">{rate}% / {termYears}yr</span>
            </div>
            <div className="flex justify-between font-bold border-t border-border pt-2">
              <span>Monthly P&I</span>
              <span>{monthly > 0 ? currency(monthly) : '—'}</span>
            </div>
            {totalInterest !== null && (
              <div className="flex justify-between text-muted-foreground">
                <span>Total Interest Paid</span>
                <span>{currency(totalInterest)}</span>
              </div>
            )}
            {balloonBalance !== null && (
              <div className="flex justify-between text-amber-600 font-medium border-t border-border pt-2">
                <span>Balloon Balance (yr {balloonYears})</span>
                <span>{currency(balloonBalance)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}