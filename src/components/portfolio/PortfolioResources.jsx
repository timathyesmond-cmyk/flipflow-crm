import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Copy, Check, Download } from 'lucide-react';
import { toast } from 'sonner';

const TEMPLATES = [
  {
    id: 'lease',
    title: 'Residential Lease Agreement',
    category: 'Rental',
    description: 'Standard month-to-month or fixed-term lease for residential properties.',
    content: `RESIDENTIAL LEASE AGREEMENT

This Lease Agreement ("Agreement") is entered into as of [DATE], between:

LANDLORD: [LANDLORD NAME], ("Landlord")
TENANT(S): [TENANT NAME(S)], ("Tenant")

PROPERTY: [FULL PROPERTY ADDRESS], [CITY], [STATE] [ZIP]

1. LEASE TERM
This lease begins on [START DATE] and ends on [END DATE] (Fixed-Term) or continues month-to-month.

2. RENT
Monthly Rent: $[AMOUNT], due on the 1st of each month.
Late Fee: $[LATE FEE] if rent is received after the [GRACE PERIOD] day of the month.
Payment Method: [PAYMENT METHOD/ADDRESS]

3. SECURITY DEPOSIT
A security deposit of $[DEPOSIT AMOUNT] is due prior to move-in. The deposit will be returned within [X] days after move-out, less any deductions for damages beyond normal wear and tear.

4. UTILITIES
Tenant is responsible for: [LIST UTILITIES — e.g., electricity, gas, internet].
Landlord is responsible for: [LIST UTILITIES — e.g., water, trash].

5. MAINTENANCE & REPAIRS
Tenant agrees to keep the premises clean and in good condition. Tenant must report any maintenance issues promptly.

6. PETS
[ ] No pets allowed.
[ ] Pets allowed with a pet deposit of $[PET DEPOSIT].

7. ENTRY BY LANDLORD
Landlord will provide [X] hours notice before entering the property except in case of emergency.

8. TERMINATION
Either party may terminate a month-to-month tenancy with [X] days written notice. Early termination of a fixed-term lease requires [EARLY TERMINATION TERMS].

9. GOVERNING LAW
This Agreement is governed by the laws of the State of [STATE].

LANDLORD SIGNATURE: _________________________ Date: ___________
TENANT SIGNATURE: __________________________ Date: ___________`,
  },
  {
    id: 'move-in-checklist',
    title: 'Move-In / Move-Out Checklist',
    category: 'Rental',
    description: 'Document property condition at move-in and move-out to protect against disputes.',
    content: `MOVE-IN / MOVE-OUT PROPERTY CHECKLIST

Property Address: _______________________________________
Tenant Name: ___________________________________________
Move-In Date: ________________  Move-Out Date: ________________

INSTRUCTIONS: Rate each item as: E=Excellent, G=Good, F=Fair, P=Poor, N/A=Not Applicable
Note any existing damage in the "Comments" column.

LIVING ROOM
[ ] Walls/Ceiling     Move-In: ___ Move-Out: ___ Comments: ___________________
[ ] Floors            Move-In: ___ Move-Out: ___ Comments: ___________________
[ ] Windows/Blinds    Move-In: ___ Move-Out: ___ Comments: ___________________
[ ] Doors/Locks       Move-In: ___ Move-Out: ___ Comments: ___________________
[ ] Light Fixtures    Move-In: ___ Move-Out: ___ Comments: ___________________

KITCHEN
[ ] Walls/Ceiling     Move-In: ___ Move-Out: ___ Comments: ___________________
[ ] Cabinets          Move-In: ___ Move-Out: ___ Comments: ___________________
[ ] Countertops       Move-In: ___ Move-Out: ___ Comments: ___________________
[ ] Appliances        Move-In: ___ Move-Out: ___ Comments: ___________________
[ ] Sink/Faucet       Move-In: ___ Move-Out: ___ Comments: ___________________

BEDROOMS (repeat per bedroom)
[ ] Walls/Ceiling     Move-In: ___ Move-Out: ___ Comments: ___________________
[ ] Floors            Move-In: ___ Move-Out: ___ Comments: ___________________
[ ] Closet            Move-In: ___ Move-Out: ___ Comments: ___________________

BATHROOMS
[ ] Toilet            Move-In: ___ Move-Out: ___ Comments: ___________________
[ ] Shower/Tub        Move-In: ___ Move-Out: ___ Comments: ___________________
[ ] Sink/Vanity       Move-In: ___ Move-Out: ___ Comments: ___________________
[ ] Tiles/Grout       Move-In: ___ Move-Out: ___ Comments: ___________________

GENERAL
[ ] HVAC/Filters      Move-In: ___ Move-Out: ___ Comments: ___________________
[ ] Smoke Detectors   Move-In: ___ Move-Out: ___ Comments: ___________________
[ ] Exterior/Yard     Move-In: ___ Move-Out: ___ Comments: ___________________

KEYS/ACCESS
Number of keys provided: ___  Garage remotes: ___  Other: ___

LANDLORD SIGNATURE: ______________________ Date: ___________
TENANT SIGNATURE: _______________________ Date: ___________`,
  },
  {
    id: 'rent-increase',
    title: 'Rent Increase Notice',
    category: 'Rental',
    description: 'Formal notice to tenants of an upcoming rent increase.',
    content: `NOTICE OF RENT INCREASE

Date: [DATE]

To: [TENANT NAME(S)]
Property Address: [PROPERTY ADDRESS]

Dear [TENANT NAME],

This notice is to inform you that the monthly rent for the above-referenced property will increase as follows:

Current Monthly Rent: $[CURRENT AMOUNT]
New Monthly Rent:     $[NEW AMOUNT]
Effective Date:       [EFFECTIVE DATE]

This represents an increase of $[DIFFERENCE] ([PERCENTAGE]%) per month.

This notice is provided in accordance with [STATE] law, which requires [X] days' written notice prior to a rent increase.

If you have any questions regarding this notice, please contact me at:
[LANDLORD PHONE / EMAIL]

If you choose not to accept the new rental rate, you must provide written notice of your intent to vacate the premises by [VACATE NOTICE DEADLINE].

Thank you for being a valued tenant.

Sincerely,

_____________________________
[LANDLORD NAME]
[DATE]`,
  },
  {
    id: 'fix-flip-budget',
    title: 'Fix & Flip Rehab Budget Template',
    category: 'Fix & Flip',
    description: 'Detailed line-item rehab budget to track costs and stay on target.',
    content: `FIX & FLIP REHAB BUDGET TRACKER

Property Address: _______________________________________
Purchase Price: $____________  ARV: $____________  Target Profit: $____________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXTERIOR
[ ] Roof                  Budget: $________  Actual: $________  Notes: ___________
[ ] Siding/Exterior Paint Budget: $________  Actual: $________  Notes: ___________
[ ] Windows               Budget: $________  Actual: $________  Notes: ___________
[ ] Doors (front/back)    Budget: $________  Actual: $________  Notes: ___________
[ ] Driveway/Concrete     Budget: $________  Actual: $________  Notes: ___________
[ ] Landscaping/Curb      Budget: $________  Actual: $________  Notes: ___________
[ ] Fence                 Budget: $________  Actual: $________  Notes: ___________
EXTERIOR SUBTOTAL:        Budget: $________  Actual: $________

INTERIOR
[ ] Demo/Haul Away        Budget: $________  Actual: $________  Notes: ___________
[ ] Framing               Budget: $________  Actual: $________  Notes: ___________
[ ] Drywall               Budget: $________  Actual: $________  Notes: ___________
[ ] Interior Paint        Budget: $________  Actual: $________  Notes: ___________
[ ] Flooring              Budget: $________  Actual: $________  Notes: ___________
[ ] Trim/Baseboards       Budget: $________  Actual: $________  Notes: ___________
[ ] Interior Doors        Budget: $________  Actual: $________  Notes: ___________
INTERIOR SUBTOTAL:        Budget: $________  Actual: $________

KITCHEN
[ ] Cabinets              Budget: $________  Actual: $________  Notes: ___________
[ ] Countertops           Budget: $________  Actual: $________  Notes: ___________
[ ] Appliances            Budget: $________  Actual: $________  Notes: ___________
[ ] Plumbing (kitchen)    Budget: $________  Actual: $________  Notes: ___________
KITCHEN SUBTOTAL:         Budget: $________  Actual: $________

BATHROOMS
[ ] Tile/Shower           Budget: $________  Actual: $________  Notes: ___________
[ ] Vanity/Fixtures       Budget: $________  Actual: $________  Notes: ___________
[ ] Toilet                Budget: $________  Actual: $________  Notes: ___________
BATHROOMS SUBTOTAL:       Budget: $________  Actual: $________

SYSTEMS
[ ] HVAC                  Budget: $________  Actual: $________  Notes: ___________
[ ] Electrical            Budget: $________  Actual: $________  Notes: ___________
[ ] Plumbing              Budget: $________  Actual: $________  Notes: ___________
[ ] Water Heater          Budget: $________  Actual: $________  Notes: ___________
SYSTEMS SUBTOTAL:         Budget: $________  Actual: $________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL REHAB BUDGET:       Budget: $________  Actual: $________
Purchase Price:           $________
Holding Costs (est.):     $________
Closing Costs (est.):     $________

TOTAL ALL-IN COST:        $________
ARV:                      $________
PROJECTED PROFIT:         $________`,
  },
  {
    id: 'property-inspection',
    title: 'Property Inspection Checklist',
    category: 'Fix & Flip',
    description: 'Pre-purchase inspection checklist to identify issues before buying a deal.',
    content: `PRE-PURCHASE PROPERTY INSPECTION CHECKLIST

Address: _______________________________________
Inspection Date: _____________  Inspector: _________________

Rate each item: OK = No Issues | MINOR = Minor Repair | MAJOR = Significant Issue | N/A

ROOF & ATTIC
[ ] Roof Age / Condition        Status: _______ Est. Cost: $_______ Notes: ___________
[ ] Gutters / Downspouts        Status: _______ Est. Cost: $_______ Notes: ___________
[ ] Attic Insulation            Status: _______ Est. Cost: $_______ Notes: ___________
[ ] Signs of Leaks / Water      Status: _______ Est. Cost: $_______ Notes: ___________

FOUNDATION & STRUCTURE
[ ] Foundation Cracks           Status: _______ Est. Cost: $_______ Notes: ___________
[ ] Basement Water Intrusion    Status: _______ Est. Cost: $_______ Notes: ___________
[ ] Floor/Wall Separation       Status: _______ Est. Cost: $_______ Notes: ___________
[ ] Load-Bearing Walls          Status: _______ Est. Cost: $_______ Notes: ___________

ELECTRICAL
[ ] Panel/Breakers              Status: _______ Est. Cost: $_______ Notes: ___________
[ ] Wiring Type (Knob & Tube?)  Status: _______ Est. Cost: $_______ Notes: ___________
[ ] GFCI Outlets                Status: _______ Est. Cost: $_______ Notes: ___________
[ ] Smoke/CO Detectors          Status: _______ Est. Cost: $_______ Notes: ___________

PLUMBING
[ ] Water Heater Age            Status: _______ Est. Cost: $_______ Notes: ___________
[ ] Water Pressure              Status: _______ Est. Cost: $_______ Notes: ___________
[ ] Drain/Sewer Condition       Status: _______ Est. Cost: $_______ Notes: ___________
[ ] Visible Leaks/Stains        Status: _______ Est. Cost: $_______ Notes: ___________

HVAC
[ ] Furnace/AC Age              Status: _______ Est. Cost: $_______ Notes: ___________
[ ] Ductwork Condition          Status: _______ Est. Cost: $_______ Notes: ___________

INTERIOR
[ ] Mold/Mildew Signs           Status: _______ Est. Cost: $_______ Notes: ___________
[ ] Windows/Seals               Status: _______ Est. Cost: $_______ Notes: ___________
[ ] Flooring Condition          Status: _______ Est. Cost: $_______ Notes: ___________
[ ] Doors/Hardware              Status: _______ Est. Cost: $_______ Notes: ___________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ESTIMATED TOTAL REPAIR COST: $___________
RECOMMENDATION: [ ] Buy  [ ] Pass  [ ] Negotiate Down`,
  },
  {
    id: 'late-rent-notice',
    title: 'Late Rent / Pay or Quit Notice',
    category: 'Rental',
    description: 'Formal notice when a tenant has failed to pay rent on time.',
    content: `NOTICE TO PAY RENT OR QUIT

Date: [DATE]

To: [TENANT NAME(S)]
Property Address: [FULL PROPERTY ADDRESS]

Dear [TENANT NAME],

You are hereby notified that you are in DEFAULT of your rental agreement for failure to pay rent.

As of [DATE], the following amount is past due:

  Monthly Rent Due:    $[RENT AMOUNT]
  Late Fee:            $[LATE FEE]
  Other Charges:       $[OTHER]
  ─────────────────────────────────
  TOTAL AMOUNT DUE:    $[TOTAL]

You are required to pay the total amount due IN FULL within [X] DAYS of receiving this notice, OR vacate and surrender possession of the premises.

Payment must be received by: [DEADLINE DATE]

If you fail to pay the full amount owed or vacate the premises by the deadline, legal proceedings will be initiated against you to recover possession of the premises, past-due rent, damages, attorney fees, and court costs.

This notice does not waive any rights the landlord may have under the lease or applicable law.

_____________________________
Landlord/Agent Name
[PHONE] | [EMAIL]
[DATE]`,
  },
];

const CATEGORY_COLORS = {
  'Rental':     'bg-blue-100 text-blue-700',
  'Fix & Flip': 'bg-amber-100 text-amber-700',
};

export default function PortfolioResources() {
  const [selected, setSelected] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selected.content);
    setCopied(true);
    toast.success('Template copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([selected.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selected.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Template downloaded');
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Pro-exclusive templates for landlords and fix-and-flip investors. Click any template to view, copy, or download.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEMPLATES.map(t => (
          <Card
            key={t.id}
            className="hover:shadow-md transition-shadow cursor-pointer border-border"
            onClick={() => setSelected(t)}
          >
            <CardContent className="pt-4 pb-4 space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-snug">{t.title}</p>
                  <Badge className={`text-[10px] mt-1 ${CATEGORY_COLORS[t.category]}`}>{t.category}</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{t.description}</p>
              <Button variant="outline" size="sm" className="w-full h-7 text-xs gap-1.5 mt-1">
                <FileText className="w-3 h-3" /> View Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Template Viewer Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              {selected?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 mt-1 mb-3">
            <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={handleCopy}>
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={handleDownload}>
              <Download className="w-3 h-3" /> Download
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap bg-muted/40 rounded-lg p-4 leading-relaxed">
              {selected?.content}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}