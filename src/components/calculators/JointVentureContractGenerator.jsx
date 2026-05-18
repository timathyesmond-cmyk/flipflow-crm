import React, { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function Field({ label, value, onChange, placeholder, type = 'text', className = '' }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <Label className="text-xs text-muted-foreground uppercase tracking-wide">{label}</Label>
      <Input type={type} placeholder={placeholder || ''} value={value} onChange={e => onChange(e.target.value)} className="h-8 text-sm" />
    </div>
  );
}

export default function JointVentureContractGenerator() {
  const reportRef = useRef(null);

  const [party1Name, setParty1Name] = useState('');
  const [party1Role, setParty1Role] = useState('');
  const [party1Split, setParty1Split] = useState('');
  const [party2Name, setParty2Name] = useState('');
  const [party2Role, setParty2Role] = useState('');
  const [party2Split, setParty2Split] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [projectedProfit, setProjectedProfit] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [additionalTerms, setAdditionalTerms] = useState('');

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const fmt = (val) => {
    const num = parseFloat(val);
    if (!val || isNaN(num)) return '___________';
    return '$' + num.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  const fmtDate = (val) => {
    if (!val) return '___________';
    return new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const fmtPct = (val) => (!val ? '____%' : `${val}%`);

  const fullAddress = [propertyAddress, city, state, zip].filter(Boolean).join(', ') || '___________';

  const handleDownload = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width / 2, canvas.height / 2] });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
    const filename = propertyAddress
      ? `jv-agreement-${propertyAddress.toLowerCase().replace(/\s+/g, '-')}.pdf`
      : 'joint-venture-agreement.pdf';
    pdf.save(filename);
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8">
      {/* LEFT: Inputs */}
      <div className="space-y-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3 border-b border-blue-100 pb-1">Party 1</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full Name" value={party1Name} onChange={setParty1Name} placeholder="Jane Doe" className="col-span-2" />
            <Field label="Role / Contribution" value={party1Role} onChange={setParty1Role} placeholder="Deal Finder / Wholesaler" className="col-span-2" />
            <Field label="Profit Split (%)" value={party1Split} onChange={setParty1Split} placeholder="50" type="number" className="col-span-2" />
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-purple-600 mb-3 border-b border-purple-100 pb-1">Party 2</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full Name" value={party2Name} onChange={setParty2Name} placeholder="John Smith" className="col-span-2" />
            <Field label="Role / Contribution" value={party2Role} onChange={setParty2Role} placeholder="Funding / Operations" className="col-span-2" />
            <Field label="Profit Split (%)" value={party2Split} onChange={setParty2Split} placeholder="50" type="number" className="col-span-2" />
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-3 border-b border-amber-100 pb-1">Property</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Street Address" value={propertyAddress} onChange={setPropertyAddress} placeholder="123 Main St" className="col-span-2" />
            <Field label="City" value={city} onChange={setCity} placeholder="Portland" />
            <Field label="State" value={state} onChange={setState} placeholder="OR" />
            <Field label="Zip Code" value={zip} onChange={setZip} placeholder="97201" />
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3 border-b border-emerald-100 pb-1">Deal Financials</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Purchase Price ($)" value={purchasePrice} onChange={setPurchasePrice} placeholder="150000" type="number" />
            <Field label="Projected Profit ($)" value={projectedProfit} onChange={setProjectedProfit} placeholder="30000" type="number" />
            <Field label="Agreement Start Date" value={startDate} onChange={setStartDate} type="date" />
            <Field label="Target End Date" value={endDate} onChange={setEndDate} type="date" />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Additional Terms / Notes</Label>
          <Textarea
            placeholder="e.g. All decisions require written consent from both parties."
            value={additionalTerms}
            onChange={e => setAdditionalTerms(e.target.value)}
            className="text-sm h-24 resize-none"
          />
        </div>
      </div>

      {/* RIGHT: Contract Preview */}
      <div className="space-y-3">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleDownload}>
            <Download className="w-4 h-4" /> Download PDF
          </Button>
        </div>

        <div ref={reportRef} className="bg-white rounded-2xl border border-border p-6 text-sm space-y-4 font-serif leading-relaxed">
          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-3 flex gap-2 items-start">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-800 font-sans font-medium">
              <strong>TEMPLATE ONLY — NOT A LEGAL DOCUMENT.</strong> This is a general-purpose template for informational purposes only. It is not legal advice. Always consult a licensed real estate attorney before signing any contract.
            </p>
          </div>

          {/* Title */}
          <div className="text-center space-y-1 py-2">
            <h2 className="text-xl font-bold uppercase tracking-wide font-sans">Joint Venture Agreement</h2>
            <p className="text-xs text-gray-400 font-sans">Date: {today}</p>
          </div>

          {/* Parties */}
          <div>
            <p>
              This Joint Venture Agreement ("Agreement") is entered into as of <strong>{today}</strong>, by and between:
            </p>
            <p className="mt-2"><strong>PARTY 1:</strong> {party1Name || '___________'} — {party1Role || '___________'}</p>
            <p className="mt-1"><strong>PARTY 2:</strong> {party2Name || '___________'} — {party2Role || '___________'}</p>
            <p className="mt-2">(each a "Party," collectively the "Parties")</p>
          </div>

          {/* Purpose */}
          <div>
            <p className="font-bold font-sans text-xs uppercase tracking-wide border-b pb-1 mb-2">1. Purpose</p>
            <p>
              The Parties agree to enter into this joint venture for the sole purpose of acquiring, wholesaling, and/or disposing of the real property located at: <strong>{fullAddress}</strong> (the "Property"), with a purchase price of <strong>{fmt(purchasePrice)}</strong> and a projected profit of <strong>{fmt(projectedProfit)}</strong>.
            </p>
          </div>

          {/* Contributions */}
          <div>
            <p className="font-bold font-sans text-xs uppercase tracking-wide border-b pb-1 mb-2">2. Contributions & Roles</p>
            <p><strong>{party1Name || '___________'}</strong> shall be responsible for: {party1Role || '___________'}.</p>
            <p className="mt-1"><strong>{party2Name || '___________'}</strong> shall be responsible for: {party2Role || '___________'}.</p>
          </div>

          {/* Profit Split */}
          <div>
            <p className="font-bold font-sans text-xs uppercase tracking-wide border-b pb-1 mb-2">3. Profit Distribution</p>
            <p>
              Net profits from the transaction shall be distributed as follows:
            </p>
            <p className="mt-1">
              <strong>{party1Name || '___________'}:</strong> {fmtPct(party1Split)} of net profit
            </p>
            <p className="mt-1">
              <strong>{party2Name || '___________'}:</strong> {fmtPct(party2Split)} of net profit
            </p>
            <p className="mt-2">
              "Net profit" means gross proceeds from the disposition of the Property less all agreed-upon costs directly related to the transaction (title fees, closing costs, assignment fees, and any other mutually approved expenses).
            </p>
          </div>

          {/* Term */}
          <div>
            <p className="font-bold font-sans text-xs uppercase tracking-wide border-b pb-1 mb-2">4. Term</p>
            <p>
              This Agreement shall commence on <strong>{fmtDate(startDate)}</strong> and shall terminate upon the closing or disposition of the Property, or no later than <strong>{fmtDate(endDate)}</strong>, unless extended by written mutual consent.
            </p>
          </div>

          {/* Decision Making */}
          <div>
            <p className="font-bold font-sans text-xs uppercase tracking-wide border-b pb-1 mb-2">5. Decision Making</p>
            <p>
              All material decisions relating to the Property — including but not limited to offer prices, contract modifications, and disposition strategy — shall require the written consent of both Parties.
            </p>
          </div>

          {/* Exclusivity */}
          <div>
            <p className="font-bold font-sans text-xs uppercase tracking-wide border-b pb-1 mb-2">6. Exclusivity</p>
            <p>
              This Agreement is limited solely to the Property described herein. Neither Party's other business activities, investments, or affiliations are subject to this Agreement.
            </p>
          </div>

          {/* Confidentiality */}
          <div>
            <p className="font-bold font-sans text-xs uppercase tracking-wide border-b pb-1 mb-2">7. Confidentiality</p>
            <p>
              The Parties agree to keep all financial terms of this Agreement and any related transaction details confidential and shall not disclose such information to any third party without prior written consent of the other Party.
            </p>
          </div>

          {/* Additional Terms */}
          {additionalTerms && (
            <div>
              <p className="font-bold font-sans text-xs uppercase tracking-wide border-b pb-1 mb-2">8. Additional Terms</p>
              <p className="whitespace-pre-wrap">{additionalTerms}</p>
            </div>
          )}

          {/* Signatures */}
          <div className="pt-4 space-y-6">
            <p className="font-bold font-sans text-xs uppercase tracking-wide border-b pb-1">Signatures</p>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <div className="border-b border-gray-400 h-8" />
                <p className="text-xs font-sans text-gray-500">Party 1 Signature</p>
                <p className="text-xs font-sans">{party1Name || '___________'}</p>
                <p className="text-xs font-sans text-gray-400">Date: ___________</p>
              </div>
              <div className="space-y-1">
                <div className="border-b border-gray-400 h-8" />
                <p className="text-xs font-sans text-gray-500">Party 2 Signature</p>
                <p className="text-xs font-sans">{party2Name || '___________'}</p>
                <p className="text-xs font-sans text-gray-400">Date: ___________</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}