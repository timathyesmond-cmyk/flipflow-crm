import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Download, FileText, Save, CheckCircle2 } from 'lucide-react';
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

export default function PurchaseAgreementGenerator() {
  const reportRef = useRef(null);

  const [sellerName, setSellerName] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [earnestMoney, setEarnestMoney] = useState('');
  const [closeDate, setCloseDate] = useState('');
  const [inspectionDays, setInspectionDays] = useState('10');
  const [additionalTerms, setAdditionalTerms] = useState('');

  const { matchedDeal } = useCalculatorAutoSave(propertyAddress, {});
  const [saved, setSaved] = useState(false);

  const handleSaveToDeal = async () => {
    if (!matchedDeal) return;
    await base44.entities.GeneratedContract.create({
      deal_id: matchedDeal.id,
      contract_type: 'purchase_agreement',
      property_address: [propertyAddress, city, state, zip].filter(Boolean).join(', '),
      parties: [sellerName, buyerName].filter(Boolean).join(' / '),
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

  const handleDownload = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width / 2, canvas.height / 2] });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
    const filename = propertyAddress
      ? `purchase-agreement-${propertyAddress.toLowerCase().replace(/\s+/g, '-')}.pdf`
      : 'purchase-agreement.pdf';
    pdf.save(filename);
  };

  const fullAddress = [propertyAddress, city, state, zip].filter(Boolean).join(', ') || '___________';

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8">
      {/* LEFT: Inputs */}
      <div className="space-y-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3 border-b border-blue-200 pb-1">Parties</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Seller Full Name" value={sellerName} onChange={setSellerName} placeholder="John Smith" className="col-span-2" />
            <Field label="Buyer / Assignee Name" value={buyerName} onChange={setBuyerName} placeholder="Jane Doe and/or Assigns" className="col-span-2" />
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-3 border-b border-amber-200 pb-1">Property</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Street Address" value={propertyAddress} onChange={setPropertyAddress} placeholder="123 Main St" className="col-span-2" />
            <Field label="City" value={city} onChange={setCity} placeholder="Portland" />
            <Field label="State" value={state} onChange={setState} placeholder="OR" />
            <Field label="Zip Code" value={zip} onChange={setZip} placeholder="97201" />
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3 border-b border-emerald-200 pb-1">Terms</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Purchase Price ($)" value={purchasePrice} onChange={setPurchasePrice} placeholder="150000" type="number" />
            <Field label="Earnest Money ($)" value={earnestMoney} onChange={setEarnestMoney} placeholder="1000" type="number" />
            <Field label="Closing Date" value={closeDate} onChange={setCloseDate} type="date" />
            <Field label="Inspection Period (days)" value={inspectionDays} onChange={setInspectionDays} placeholder="10" type="number" />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Additional Terms / Notes</Label>
          <Textarea
            placeholder="e.g. Seller to leave all appliances. Property sold as-is."
            value={additionalTerms}
            onChange={e => setAdditionalTerms(e.target.value)}
            className="text-sm h-24 resize-none"
          />
        </div>
      </div>

      {/* RIGHT: Agreement Preview */}
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

        <div ref={reportRef} className="bg-white rounded-2xl border border-border p-6 text-sm space-y-4 font-serif leading-relaxed text-gray-900">
          {/* Disclaimer Banner */}
          <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-3 flex gap-2 items-start">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-800 font-sans font-medium">
              <strong>TEMPLATE ONLY — NOT A LEGAL DOCUMENT.</strong> This is a general-purpose template provided for informational purposes. It is not intended as legal advice. Always consult a licensed real estate attorney before signing any contract.
            </p>
          </div>

          {/* Title */}
          <div className="text-center space-y-1 py-2">
            <h2 className="text-xl font-bold uppercase tracking-wide font-sans">Real Estate Purchase Agreement</h2>
            <p className="text-xs text-gray-500 font-sans uppercase tracking-widest">(Assignable Contract)</p>
            <p className="text-xs text-gray-400 font-sans">Date: {today}</p>
          </div>

          {/* Parties */}
          <div>
            <p>
              This Real Estate Purchase Agreement ("Agreement") is entered into as of <strong>{today}</strong>, by and between:
            </p>
            <p className="mt-2">
              <strong>SELLER:</strong> {sellerName || '___________'} ("Seller")
            </p>
            <p className="mt-1">
              <strong>BUYER:</strong> {buyerName || '___________'}, and/or Assigns ("Buyer")
            </p>
          </div>

          {/* Property */}
          <div>
            <p className="font-bold font-sans text-xs uppercase tracking-wide border-b pb-1 mb-2">1. Property</p>
            <p>
              Seller agrees to sell and Buyer agrees to purchase the real property located at: <strong>{fullAddress}</strong>, together with all improvements, fixtures, and appurtenances thereon (the "Property").
            </p>
          </div>

          {/* Purchase Price */}
          <div>
            <p className="font-bold font-sans text-xs uppercase tracking-wide border-b pb-1 mb-2">2. Purchase Price &amp; Earnest Money</p>
            <p>
              The total purchase price is <strong>{fmt(purchasePrice)}</strong>. Buyer shall deposit earnest money of <strong>{fmt(earnestMoney)}</strong> within 3 business days of execution of this Agreement. Earnest money shall be credited toward the purchase price at closing.
            </p>
          </div>

          {/* Closing */}
          <div>
            <p className="font-bold font-sans text-xs uppercase tracking-wide border-b pb-1 mb-2">3. Closing Date</p>
            <p>
              Closing shall occur on or before <strong>{closeDate ? new Date(closeDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '___________'}</strong>, or such other date as mutually agreed upon in writing.
            </p>
          </div>

          {/* Inspection */}
          <div>
            <p className="font-bold font-sans text-xs uppercase tracking-wide border-b pb-1 mb-2">4. Inspection Period</p>
            <p>
              Buyer shall have <strong>{inspectionDays || '___'} calendar days</strong> from the Effective Date to inspect the Property. If Buyer is unsatisfied, Buyer may terminate this Agreement in writing and receive a full refund of earnest money.
            </p>
          </div>

          {/* As-Is */}
          <div>
            <p className="font-bold font-sans text-xs uppercase tracking-wide border-b pb-1 mb-2">5. Property Condition (As-Is)</p>
            <p>
              Buyer agrees to purchase the Property in its present "AS-IS" condition. Seller makes no representations or warranties regarding the condition of the Property.
            </p>
          </div>

          {/* Assignment */}
          <div>
            <p className="font-bold font-sans text-xs uppercase tracking-wide border-b pb-1 mb-2">6. Assignment</p>
            <p>
              <strong>This Agreement is freely assignable by Buyer</strong> without the prior written consent of Seller. Buyer may assign all rights and obligations hereunder to any third party ("Assignee"). Upon such assignment, Buyer shall be released from all obligations under this Agreement and Assignee shall assume all Buyer's obligations herein.
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
                <p className="text-xs font-sans text-gray-500">Seller Signature</p>
                <p className="text-xs font-sans">{sellerName || '___________'}</p>
                <p className="text-xs font-sans text-gray-400">Date: ___________</p>
              </div>
              <div className="space-y-1">
                <div className="border-b border-gray-400 h-8" />
                <p className="text-xs font-sans text-gray-500">Buyer Signature</p>
                <p className="text-xs font-sans">{buyerName || '___________'}</p>
                <p className="text-xs font-sans text-gray-400">Date: ___________</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}