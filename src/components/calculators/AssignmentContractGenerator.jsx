import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Download, Save, CheckCircle2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { base44 } from '@/api/base44Client';
import { useCalculatorAutoSave } from '@/hooks/useCalculatorAutoSave';

function Field({ label, value, onChange, placeholder, type = 'text', className = '' }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <Label className="text-xs text-muted-foreground uppercase tracking-wide">{label}</Label>
      <Input type={type} placeholder={placeholder || ''} value={value} onChange={e => onChange(e.target.value)} className="h-8 text-sm" />
    </div>
  );
}

export default function AssignmentContractGenerator() {
  const reportRef = useRef(null);

  const [assignorName, setAssignorName] = useState('');
  const [assigneeName, setAssigneeName] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [originalContractDate, setOriginalContractDate] = useState('');
  const [originalPurchasePrice, setOriginalPurchasePrice] = useState('');
  const [assignmentFee, setAssignmentFee] = useState('');
  const [assignmentFeeDeposit, setAssignmentFeeDeposit] = useState('');
  const [closingDate, setClosingDate] = useState('');
  const [additionalTerms, setAdditionalTerms] = useState('');

  const { matchedDeal } = useCalculatorAutoSave(propertyAddress, {});
  const [saved, setSaved] = useState(false);

  const handleSaveToDeal = async () => {
    if (!matchedDeal) return;
    await base44.entities.GeneratedContract.create({
      deal_id: matchedDeal.id,
      contract_type: 'assignment_contract',
      property_address: [propertyAddress, city, state, zip].filter(Boolean).join(', '),
      parties: [assignorName, assigneeName].filter(Boolean).join(' / '),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

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

  const fullAddress = [propertyAddress, city, state, zip].filter(Boolean).join(', ') || '___________';

  const handleDownload = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width / 2, canvas.height / 2] });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
    const filename = propertyAddress
      ? `assignment-contract-${propertyAddress.toLowerCase().replace(/\s+/g, '-')}.pdf`
      : 'assignment-contract.pdf';
    pdf.save(filename);
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8">
      {/* LEFT: Inputs */}
      <div className="space-y-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3 border-b border-blue-100 pb-1">Parties</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Assignor (Wholesaler)" value={assignorName} onChange={setAssignorName} placeholder="Jane Doe" className="col-span-2" />
            <Field label="Assignee (End Buyer)" value={assigneeName} onChange={setAssigneeName} placeholder="John Buyer and/or Assigns" className="col-span-2" />
            <Field label="Original Seller" value={sellerName} onChange={setSellerName} placeholder="Property Owner Name" className="col-span-2" />
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
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3 border-b border-emerald-100 pb-1">Contract & Fee Details</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Original Contract Date" value={originalContractDate} onChange={setOriginalContractDate} type="date" />
            <Field label="Original Purchase Price ($)" value={originalPurchasePrice} onChange={setOriginalPurchasePrice} placeholder="150000" type="number" />
            <Field label="Assignment Fee ($)" value={assignmentFee} onChange={setAssignmentFee} placeholder="10000" type="number" />
            <Field label="Fee Deposit Due Now ($)" value={assignmentFeeDeposit} onChange={setAssignmentFeeDeposit} placeholder="2500" type="number" />
            <Field label="Closing Date" value={closingDate} onChange={setClosingDate} type="date" className="col-span-2" />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Additional Terms / Notes</Label>
          <Textarea
            placeholder="e.g. All terms of the original purchase agreement remain in effect."
            value={additionalTerms}
            onChange={e => setAdditionalTerms(e.target.value)}
            className="text-sm h-24 resize-none"
          />
        </div>
      </div>

      {/* RIGHT: Contract Preview */}
      <div className="space-y-3">
        <div className="flex justify-end gap-2">
          {matchedDeal && (
            <Button variant="outline" size="sm" className="gap-2" onClick={handleSaveToDeal} disabled={saved}>
              {saved ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Save className="w-4 h-4" />}
              {saved ? 'Saved!' : `Save to Deal`}
            </Button>
          )}
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
            <h2 className="text-xl font-bold uppercase tracking-wide font-sans">Assignment of Real Estate Contract</h2>
            <p className="text-xs text-gray-400 font-sans">Date: {today}</p>
          </div>

          {/* Parties */}
          <div>
            <p>
              This Assignment of Real Estate Contract ("Assignment") is entered into as of <strong>{today}</strong>, by and between:
            </p>
            <p className="mt-2"><strong>ASSIGNOR:</strong> {assignorName || '___________'} ("Assignor")</p>
            <p className="mt-1"><strong>ASSIGNEE:</strong> {assigneeName || '___________'}, and/or Assigns ("Assignee")</p>
          </div>

          {/* Recitals */}
          <div>
            <p className="font-bold font-sans text-xs uppercase tracking-wide border-b pb-1 mb-2">1. Recitals</p>
            <p>
              Assignor entered into that certain Real Estate Purchase Agreement dated <strong>{fmtDate(originalContractDate)}</strong> (the "Original Contract") with <strong>{sellerName || '___________'}</strong> ("Seller") for the purchase of the real property located at: <strong>{fullAddress}</strong> (the "Property"), at a purchase price of <strong>{fmt(originalPurchasePrice)}</strong>.
            </p>
          </div>

          {/* Assignment */}
          <div>
            <p className="font-bold font-sans text-xs uppercase tracking-wide border-b pb-1 mb-2">2. Assignment</p>
            <p>
              For good and valuable consideration, Assignor hereby assigns, transfers, and conveys to Assignee all of Assignor's right, title, and interest in and to the Original Contract, including all rights to purchase the Property under the terms set forth therein.
            </p>
          </div>

          {/* Assignment Fee */}
          <div>
            <p className="font-bold font-sans text-xs uppercase tracking-wide border-b pb-1 mb-2">3. Assignment Fee</p>
            <p>
              In consideration of this Assignment, Assignee agrees to pay Assignor an assignment fee of <strong>{fmt(assignmentFee)}</strong>. A non-refundable deposit of <strong>{fmt(assignmentFeeDeposit)}</strong> is due upon execution of this Assignment. The remaining balance shall be paid at closing.
            </p>
          </div>

          {/* Assumption */}
          <div>
            <p className="font-bold font-sans text-xs uppercase tracking-wide border-b pb-1 mb-2">4. Assumption of Obligations</p>
            <p>
              Assignee hereby assumes and agrees to perform all duties and obligations of Assignor under the Original Contract from and after the date of this Assignment. Assignor shall be released from all obligations under the Original Contract upon execution hereof.
            </p>
          </div>

          {/* Closing */}
          <div>
            <p className="font-bold font-sans text-xs uppercase tracking-wide border-b pb-1 mb-2">5. Closing</p>
            <p>
              Closing shall occur on or before <strong>{fmtDate(closingDate)}</strong>, or such other date as mutually agreed in writing, in accordance with the terms of the Original Contract.
            </p>
          </div>

          {/* As-Is */}
          <div>
            <p className="font-bold font-sans text-xs uppercase tracking-wide border-b pb-1 mb-2">6. Property Condition</p>
            <p>
              Assignee acknowledges they have had the opportunity to inspect the Property and accepts it in "AS-IS" condition. Assignor makes no representations or warranties regarding the condition of the Property.
            </p>
          </div>

          {/* Additional Terms */}
          {additionalTerms && (
            <div>
              <p className="font-bold font-sans text-xs uppercase tracking-wide border-b pb-1 mb-2">7. Additional Terms</p>
              <p className="whitespace-pre-wrap">{additionalTerms}</p>
            </div>
          )}

          {/* Signatures */}
          <div className="pt-4 space-y-6">
            <p className="font-bold font-sans text-xs uppercase tracking-wide border-b pb-1">Signatures</p>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <div className="border-b border-gray-400 h-8" />
                <p className="text-xs font-sans text-gray-500">Assignor Signature</p>
                <p className="text-xs font-sans">{assignorName || '___________'}</p>
                <p className="text-xs font-sans text-gray-400">Date: ___________</p>
              </div>
              <div className="space-y-1">
                <div className="border-b border-gray-400 h-8" />
                <p className="text-xs font-sans text-gray-500">Assignee Signature</p>
                <p className="text-xs font-sans">{assigneeName || '___________'}</p>
                <p className="text-xs font-sans text-gray-400">Date: ___________</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}