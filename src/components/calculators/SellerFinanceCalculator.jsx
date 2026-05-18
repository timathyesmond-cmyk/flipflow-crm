import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { AlertTriangle, CheckCircle2, Download, Save } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useCalculatorAutoSave } from '@/hooks/useCalculatorAutoSave';

function fmt(val, suffix = '') {
  if (val === null || val === undefined || val === '') return '—';
  const num = Number(val);
  if (isNaN(num)) return '—';
  const formatted = '$' + Math.abs(num).toLocaleString(undefined, { maximumFractionDigits: 0 });
  return (num < 0 ? '-' : '') + formatted + suffix;
}

function fmtPct(val) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return val.toFixed(1) + '%';
}

function calcMonthlyPayment(principal, annualRate, termMonths) {
  if (!principal || !annualRate || !termMonths) return 0;
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / termMonths;
  return principal * (r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1);
}

function Row({ label, value, highlight }) {
  return (
    <div className={`flex items-baseline gap-2 py-1.5 ${highlight ? 'font-semibold' : ''}`}>
      <span className="text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap flex-shrink-0" style={{ fontFamily: 'monospace' }}>
        {label}
      </span>
      <span className="flex-1 border-b border-dotted border-border/60 mb-0.5 min-w-4" />
      <span className={`text-sm font-mono font-medium flex-shrink-0 ${highlight ? 'text-foreground' : 'text-foreground/80'}`}>
        {value}
      </span>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h3 className="text-base font-bold uppercase tracking-wide border-b-2 border-foreground pb-1 mb-3 mt-2">
      {children}
    </h3>
  );
}

function NumField({ label, value, onChange, suffix }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground uppercase tracking-wide">{label}</Label>
      <div className="relative">
        {!suffix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>}
        <Input
          type="number"
          placeholder="0"
          value={value}
          onChange={e => onChange(e.target.value)}
          className={`${!suffix ? 'pl-7' : ''} h-8 text-sm`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">{suffix}</span>}
      </div>
    </div>
  );
}

export default function SellerFinanceCalculator() {
  const reportRef = useRef(null);
  const [address, setAddress] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [interestRate, setInterestRate] = useState('6');
  const [termYears, setTermYears] = useState('30');
  const [balloonYears, setBalloonYears] = useState('');
  const [assignmentFee, setAssignmentFee] = useState('');
  const [closingCosts, setClosingCosts] = useState('');
  const [taxes, setTaxes] = useState('');
  const [insurance, setInsurance] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');

  const pp = parseFloat(purchasePrice) || 0;
  const dp = parseFloat(downPayment) || 0;
  const rate = parseFloat(interestRate) || 0;
  const term = (parseFloat(termYears) || 0) * 12;
  const balloon = parseFloat(balloonYears) || 0;
  const balloonMo = balloon > 0 ? balloon * 12 : null;
  const af = parseFloat(assignmentFee) || 0;
  const cc = parseFloat(closingCosts) || 0;
  const taxMo = parseFloat(taxes) || 0;
  const insMo = parseFloat(insurance) || 0;
  const rent = parseFloat(monthlyRent) || 0;

  const principal = pp - dp;
  const monthly = principal > 0 ? calcMonthlyPayment(principal, rate, term) : 0;
  const totalEntryFee = dp + af + cc;
  const entryFeePct = pp > 0 ? (totalEntryFee / pp) * 100 : 0;
  const totalPITI = monthly + taxMo + insMo;
  const cashflowMo = rent > 0 ? rent - totalPITI : null;
  const cashflowYr = cashflowMo !== null ? cashflowMo * 12 : null;
  const cocReturn = totalEntryFee > 0 && cashflowYr !== null ? (cashflowYr / totalEntryFee) * 100 : null;
  const totalInterest = monthly > 0 && term > 0 ? (monthly * term) - principal : null;

  let balloonBalance = null;
  if (balloonMo && principal > 0 && rate > 0) {
    const r = rate / 100 / 12;
    balloonBalance = principal * Math.pow(1 + r, balloonMo) - monthly * ((Math.pow(1 + r, balloonMo) - 1) / r);
  }

  const { matchedDeal, saveStatus } = useCalculatorAutoSave(address, {
    offer_price: pp || undefined,
    assignment_fee: af || undefined,
    buyer_price: totalEntryFee || undefined,
  });

  const insights = [];
  if (cocReturn !== null) {
    if (cocReturn >= 20) {
      insights.push({ positive: true, title: 'STRONG CASH-ON-CASH RETURN', detail: `${fmtPct(cocReturn)} meets or exceeds the 20% benchmark. Great deal structure.` });
    } else {
      insights.push({ positive: false, title: 'WEAK CASH-ON-CASH RETURN', detail: `${fmtPct(cocReturn)} is below the 20% benchmark. Negotiate a lower rate, longer term, or lower purchase price.` });
    }
  }
  if (entryFeePct > 0) {
    if (entryFeePct <= 20) {
      insights.push({ positive: true, title: 'LOW ENTRY FEE', detail: `Only ${fmtPct(entryFeePct)} entry fee — easy entry point and a huge selling point to buyers.` });
    } else {
      insights.push({ positive: false, title: 'HIGH ENTRY FEE', detail: `${fmtPct(entryFeePct)} entry fee may be a tough sell. Try reducing the down payment, assignment fee, or closing costs.` });
    }
  }
  if (cashflowMo !== null) {
    if (cashflowMo >= 0) {
      insights.push({ positive: true, title: 'POSITIVE CASHFLOW', detail: `${fmt(cashflowMo)}/mo — this deal generates income every month.` });
    } else {
      insights.push({ positive: false, title: 'NEGATIVE CASHFLOW', detail: `${fmt(cashflowMo)}/mo — this deal bleeds money every month. Renegotiate the terms or walk away.` });
    }
  }

  const handleDownload = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width / 2, canvas.height / 2] });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
    const filename = address ? `seller-finance-${address.toLowerCase().replace(/\s+/g, '-')}.pdf` : 'seller-finance-calculator.pdf';
    pdf.save(filename);
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8">
      {/* LEFT: Inputs */}
      <div className="space-y-5">
        <div>
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Property Address</Label>
          <Input placeholder="123 Main St, Salem, Oregon" value={address} onChange={e => setAddress(e.target.value)} className="mt-1" />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3 border-b border-blue-100 pb-1">Loan Terms</p>
          <div className="grid grid-cols-2 gap-3">
            <NumField label="Purchase Price" value={purchasePrice} onChange={setPurchasePrice} />
            <NumField label="Down Payment" value={downPayment} onChange={setDownPayment} />
            <NumField label="Term (years)" value={termYears} onChange={setTermYears} suffix="yrs" />
            <NumField label="Balloon (years)" value={balloonYears} onChange={setBalloonYears} suffix="yrs" />
          </div>
          <div className="mt-3 space-y-2">
            <Label className="flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wide">
              <span>Interest Rate</span>
              <span className="font-bold text-primary">{interestRate}%</span>
            </Label>
            <Slider min={1} max={15} step={0.25} value={[parseFloat(interestRate) || 6]} onValueChange={([v]) => setInterestRate(String(v))} />
            <div className="flex justify-between text-xs text-muted-foreground"><span>1%</span><span>15%</span></div>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3 border-b border-emerald-100 pb-1">Buyer Costs & Rental</p>
          <div className="grid grid-cols-2 gap-3">
            <NumField label="Assignment Fee" value={assignmentFee} onChange={setAssignmentFee} />
            <NumField label="Closing Costs" value={closingCosts} onChange={setClosingCosts} />
            <NumField label="Taxes/mo" value={taxes} onChange={setTaxes} />
            <NumField label="Insurance/mo" value={insurance} onChange={setInsurance} />
            <NumField label="Rent/mo" value={monthlyRent} onChange={setMonthlyRent} />
          </div>
        </div>
      </div>

      {/* RIGHT: Output Report */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          {matchedDeal && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Save className="w-3 h-3" />
              {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? `Saved to "${matchedDeal.property_address}"` : `Linked to "${matchedDeal.property_address}"`}
            </p>
          )}
          <Button variant="outline" size="sm" className="gap-2 ml-auto" onClick={handleDownload}>
            <Download className="w-4 h-4" /> Download PDF
          </Button>
        </div>

        <div ref={reportRef} className="bg-[#f5f0e8] rounded-2xl p-6 space-y-4 font-mono">
          <div className="text-center mb-4">
            <h2 className="text-4xl font-black tracking-tight text-foreground">SELLER FINANCE</h2>
            {address && <p className="text-sm uppercase tracking-widest text-muted-foreground mt-1">{address.toUpperCase()}</p>}
          </div>

          <div>
            <SectionTitle>Your Offer to the Seller</SectionTitle>
            <Row label="Purchase Price" value={fmt(pp)} />
            <Row label="Down Payment" value={fmt(dp)} />
            <Row label="Financed Amount" value={principal > 0 ? fmt(principal) : '—'} />
            <Row label="Interest Rate" value={rate > 0 ? fmtPct(rate) : '—'} />
            <Row label="Amortization Term" value={termYears ? `${termYears} YRS` : '—'} />
            <Row label="Monthly P&I Payment" value={monthly > 0 ? fmt(monthly) + '/MO' : '—'} highlight />
            <Row label="Balloon Duration" value={balloon > 0 ? `${balloon} YRS` : '—'} />
            <Row label="Balloon Payment" value={balloonBalance !== null ? fmt(balloonBalance) : '—'} />
          </div>

          <div>
            <SectionTitle>What Buyers See</SectionTitle>
            <Row label="Purchase Price" value={fmt(pp)} />
            <Row label="Down Payment" value={fmt(dp)} />
            <Row label="Assignment Fee" value={fmt(af)} />
            <Row label="Closing Costs" value={fmt(cc)} />
            <Row label="Total Entry Fee" value={totalEntryFee > 0 ? fmt(totalEntryFee) : '—'} highlight />
            <Row label="Entry Fee %" value={entryFeePct > 0 ? fmtPct(entryFeePct) : '—'} />
            <Row label="Interest Rate" value={rate > 0 ? fmtPct(rate) : '—'} />
            <Row label="Monthly P&I" value={monthly > 0 ? fmt(monthly) + '/MO' : '—'} />
            <Row label="Taxes Per Month" value={taxMo > 0 ? fmt(taxMo) : '—'} />
            <Row label="Insurance Per Month" value={insMo > 0 ? fmt(insMo) : '—'} />
            <Row label="Total PITI" value={totalPITI > 0 ? fmt(totalPITI) + '/MO' : '—'} highlight />
            <Row label="Rent" value={rent > 0 ? fmt(rent) + '/MO' : '—'} />
            <Row label="Cashflow / Month" value={cashflowMo !== null ? fmt(cashflowMo) : '—'} highlight />
            <Row label="Cashflow / Year" value={cashflowYr !== null ? fmt(cashflowYr) : '—'} />
            <Row label="Cash-on-Cash Return" value={cocReturn !== null ? fmtPct(cocReturn) : '—'} highlight />
            <Row label="Total Interest Paid" value={totalInterest !== null ? fmt(totalInterest) : '—'} />
            <Row label="Balloon Duration" value={balloon > 0 ? `${balloon} YRS` : '—'} />
            <Row label="Balloon Payment" value={balloonBalance !== null ? fmt(balloonBalance) : '—'} />
          </div>

          {insights.length > 0 && (
            <div>
              <SectionTitle>Deal Insights</SectionTitle>
              <div className="space-y-3 font-sans">
                {insights.map((ins, i) => (
                  <div key={i}>
                    <p className={`text-xs font-bold flex items-center gap-1.5 ${ins.positive ? 'text-emerald-700' : 'text-red-700'}`}>
                      {ins.positive
                        ? <><CheckCircle2 className="w-3.5 h-3.5" /> + {ins.title}</>
                        : <><AlertTriangle className="w-3.5 h-3.5" /> - {ins.title}</>
                      }
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 ml-5">{ins.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}