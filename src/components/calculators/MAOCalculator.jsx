import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { TrendingUp, Wrench, DollarSign, AlertTriangle, CheckCircle2, Download, Save } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useCalculatorAutoSave } from '@/hooks/useCalculatorAutoSave';

function fmt(val) {
  if (val === null || val === undefined) return '—';
  const num = Number(val);
  if (isNaN(num)) return '—';
  return (num < 0 ? '-' : '') + '$' + Math.abs(num).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function fmtPct(val) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return val.toFixed(1) + '%';
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

export default function MAOCalculator() {
  const reportRef = useRef(null);
  const [address, setAddress] = useState('');
  const [arv, setArv] = useState('');
  const [repairs, setRepairs] = useState('');
  const [percentArv, setPercentArv] = useState(70);
  const [assignmentFee, setAssignmentFee] = useState('');

  const arvNum = parseFloat(arv) || 0;
  const repairsNum = parseFloat(repairs) || 0;
  const feeNum = parseFloat(assignmentFee) || 0;

  const maxOffer = arvNum > 0 ? arvNum * (percentArv / 100) : null;
  const mao = arvNum > 0 ? (arvNum * (percentArv / 100)) - repairsNum - feeNum : null;
  const equity = arvNum > 0 && mao !== null ? arvNum - mao - repairsNum : null;
  const repairPct = arvNum > 0 ? (repairsNum / arvNum) * 100 : null;
  const profitMargin = arvNum > 0 && mao !== null ? ((arvNum - mao - repairsNum) / arvNum) * 100 : null;

  const { matchedDeal, saveStatus } = useCalculatorAutoSave(address, {
    arv: arvNum || undefined,
    repair_estimate: repairsNum || undefined,
    assignment_fee: feeNum || undefined,
    offer_price: mao > 0 ? mao : undefined,
  });

  const insights = [];
  if (mao !== null) {
    if (mao > 0) {
      insights.push({ positive: true, title: 'DEAL PENCILS', detail: `MAO of ${fmt(mao)} leaves room for profit. Present this offer with confidence.` });
    } else {
      insights.push({ positive: false, title: 'DEAL DOES NOT PENCIL', detail: `MAO is negative at these numbers. Lower your repairs estimate or push for a lower ARV multiplier.` });
    }
  }
  if (repairPct !== null && repairsNum > 0) {
    if (repairPct <= 15) {
      insights.push({ positive: true, title: 'LOW REPAIR RATIO', detail: `Repairs are only ${fmtPct(repairPct)} of ARV — light lift, easy sell to buyers.` });
    } else if (repairPct > 30) {
      insights.push({ positive: false, title: 'HIGH REPAIR RATIO', detail: `Repairs are ${fmtPct(repairPct)} of ARV — heavy rehab. Make sure your estimate is accurate.` });
    }
  }
  if (profitMargin !== null && profitMargin > 0) {
    if (profitMargin >= 25) {
      insights.push({ positive: true, title: 'STRONG EQUITY SPREAD', detail: `${fmtPct(profitMargin)} equity margin gives buyers plenty of room on the deal.` });
    } else {
      insights.push({ positive: false, title: 'THIN EQUITY SPREAD', detail: `Only ${fmtPct(profitMargin)} equity margin. Buyers may push back — tighten your numbers.` });
    }
  }

  const handleDownload = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width / 2, canvas.height / 2] });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
    const filename = address ? `mao-${address.toLowerCase().replace(/\s+/g, '-')}.pdf` : 'mao-calculator.pdf';
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
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3 border-b border-blue-100 pb-1">Deal Numbers</p>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> After Repair Value (ARV)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input type="number" placeholder="0" value={arv} onChange={e => setArv(e.target.value)} className="pl-7 h-8 text-sm" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" /> Repair Estimate
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input type="number" placeholder="0" value={repairs} onChange={e => setRepairs(e.target.value)} className="pl-7 h-8 text-sm" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" /> Assignment Fee
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input type="number" placeholder="0" value={assignmentFee} onChange={e => setAssignmentFee(e.target.value)} className="pl-7 h-8 text-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wide">
                <span>ARV Multiplier</span>
                <span className="font-bold text-primary">{percentArv}%</span>
              </Label>
              <Slider min={50} max={90} step={1} value={[percentArv]} onValueChange={([v]) => setPercentArv(v)} />
              <div className="flex justify-between text-xs text-muted-foreground"><span>50% (conservative)</span><span>90% (aggressive)</span></div>
            </div>
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
            <h2 className="text-4xl font-black tracking-tight text-foreground">WHOLESALE / MAO</h2>
            {address && <p className="text-sm uppercase tracking-widest text-muted-foreground mt-1">{address.toUpperCase()}</p>}
          </div>

          <div>
            <SectionTitle>Deal Formula</SectionTitle>
            <Row label="After Repair Value (ARV)" value={fmt(arvNum)} />
            <Row label={`ARV Multiplier (${percentArv}%)`} value={maxOffer !== null ? fmt(maxOffer) : '—'} />
            <Row label="Repair Estimate" value={repairsNum > 0 ? fmt(repairsNum) : '—'} />
            <Row label="Assignment Fee" value={feeNum > 0 ? fmt(feeNum) : '—'} />
            <Row label="Maximum Allowable Offer" value={mao !== null ? fmt(mao) : '—'} highlight />
          </div>

          <div>
            <SectionTitle>Deal Summary</SectionTitle>
            <Row label="ARV" value={fmt(arvNum)} />
            <Row label="MAO (Your Offer)" value={mao !== null ? fmt(mao) : '—'} />
            <Row label="Repair Estimate" value={repairsNum > 0 ? fmt(repairsNum) : '—'} />
            <Row label="Total Equity Captured" value={equity !== null ? fmt(equity) : '—'} highlight />
            <Row label="Equity as % of ARV" value={profitMargin !== null ? fmtPct(profitMargin) : '—'} />
            <Row label="Repairs as % of ARV" value={repairPct !== null && repairsNum > 0 ? fmtPct(repairPct) : '—'} />
            <Row label="Assignment Fee" value={feeNum > 0 ? fmt(feeNum) : '—'} />
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