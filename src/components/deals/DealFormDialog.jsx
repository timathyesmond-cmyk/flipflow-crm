import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const defaultDeal = {
  property_address: '', city: '', state: '', zip: '',
  stage: 'lead', deal_type: 'assignment', priority: 'medium',
  property_type: 'single_family', lead_source: '',
  asking_price: '', offer_price: '', arv: '', repair_estimate: '',
  assignment_fee: '', buyer_price: '',
  seller_name: '', seller_phone: '', seller_email: '',
  buyer_name: '', buyer_phone: '', buyer_email: '',
  bedrooms: '', bathrooms: '', sqft: '',
  contract_date: '', closing_date: '', notes: ''
};

export default function DealFormDialog({ open, onOpenChange, onSave, deal, isLoading }) {
  const [form, setForm] = useState(deal || defaultDeal);

  React.useEffect(() => {
    setForm(deal || defaultDeal);
  }, [deal, open]);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const setNum = (field, value) => set(field, value === '' ? '' : Number(value));

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleaned = { ...form };
    ['asking_price', 'offer_price', 'arv', 'repair_estimate', 'assignment_fee', 'buyer_price', 'bedrooms', 'bathrooms', 'sqft'].forEach(f => {
      if (cleaned[f] === '') delete cleaned[f];
    });
    onSave(cleaned);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{deal ? 'Edit Deal' : 'New Deal'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs defaultValue="property" className="w-full">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="property">Property</TabsTrigger>
              <TabsTrigger value="financials">Financials</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="property" className="space-y-3 mt-4">
              <div>
                <Label>Property Address *</Label>
                <Input value={form.property_address} onChange={e => set('property_address', e.target.value)} placeholder="123 Main St" required />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>City</Label>
                  <Input value={form.city} onChange={e => set('city', e.target.value)} placeholder="City" />
                </div>
                <div>
                  <Label>State</Label>
                  <Input value={form.state} onChange={e => set('state', e.target.value)} placeholder="FL" />
                </div>
                <div>
                  <Label>ZIP</Label>
                  <Input value={form.zip} onChange={e => set('zip', e.target.value)} placeholder="33101" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Property Type</Label>
                  <Select value={form.property_type} onValueChange={v => set('property_type', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single_family">Single Family</SelectItem>
                      <SelectItem value="multi_family">Multi Family</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                      <SelectItem value="condo">Condo</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Lead Source</Label>
                  <Select value={form.lead_source || ''} onValueChange={v => set('lead_source', v)}>
                    <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="driving_for_dollars">Driving for Dollars</SelectItem>
                      <SelectItem value="direct_mail">Direct Mail</SelectItem>
                      <SelectItem value="cold_calling">Cold Calling</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="mls">MLS</SelectItem>
                      <SelectItem value="auction">Auction</SelectItem>
                      <SelectItem value="online_marketing">Online Marketing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Beds</Label>
                  <Input type="number" value={form.bedrooms} onChange={e => setNum('bedrooms', e.target.value)} />
                </div>
                <div>
                  <Label>Baths</Label>
                  <Input type="number" value={form.bathrooms} onChange={e => setNum('bathrooms', e.target.value)} />
                </div>
                <div>
                  <Label>Sqft</Label>
                  <Input type="number" value={form.sqft} onChange={e => setNum('sqft', e.target.value)} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="financials" className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Asking Price</Label>
                  <Input type="number" value={form.asking_price} onChange={e => setNum('asking_price', e.target.value)} placeholder="$0" />
                </div>
                <div>
                  <Label>Offer Price</Label>
                  <Input type="number" value={form.offer_price} onChange={e => setNum('offer_price', e.target.value)} placeholder="$0" />
                </div>
                <div>
                  <Label>ARV</Label>
                  <Input type="number" value={form.arv} onChange={e => setNum('arv', e.target.value)} placeholder="$0" />
                </div>
                <div>
                  <Label>Repair Estimate</Label>
                  <Input type="number" value={form.repair_estimate} onChange={e => setNum('repair_estimate', e.target.value)} placeholder="$0" />
                </div>
                <div>
                  <Label>Assignment Fee</Label>
                  <Input type="number" value={form.assignment_fee} onChange={e => setNum('assignment_fee', e.target.value)} placeholder="$0" />
                </div>
                <div>
                  <Label>Buyer Price</Label>
                  <Input type="number" value={form.buyer_price} onChange={e => setNum('buyer_price', e.target.value)} placeholder="$0" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contacts" className="space-y-4 mt-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">Seller Info</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Name</Label><Input value={form.seller_name} onChange={e => set('seller_name', e.target.value)} /></div>
                  <div><Label>Phone</Label><Input value={form.seller_phone} onChange={e => set('seller_phone', e.target.value)} /></div>
                  <div><Label>Email</Label><Input value={form.seller_email} onChange={e => set('seller_email', e.target.value)} /></div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Buyer Info</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Name</Label><Input value={form.buyer_name} onChange={e => set('buyer_name', e.target.value)} /></div>
                  <div><Label>Phone</Label><Input value={form.buyer_phone} onChange={e => set('buyer_phone', e.target.value)} /></div>
                  <div><Label>Email</Label><Input value={form.buyer_email} onChange={e => set('buyer_email', e.target.value)} /></div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-3 mt-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Stage</Label>
                  <Select value={form.stage} onValueChange={v => set('stage', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="under_contract">Under Contract</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="dead">Dead</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Deal Type</Label>
                  <Select value={form.deal_type} onValueChange={v => set('deal_type', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="double_close">Double Close</SelectItem>
                      <SelectItem value="novation">Novation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={v => set('priority', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Contract Date</Label>
                  <Input type="date" value={form.contract_date} onChange={e => set('contract_date', e.target.value)} />
                </div>
                <div>
                  <Label>Closing Date</Label>
                  <Input type="date" value={form.closing_date} onChange={e => set('closing_date', e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} placeholder="Add any notes about this deal..." />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (deal ? 'Update Deal' : 'Create Deal')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}