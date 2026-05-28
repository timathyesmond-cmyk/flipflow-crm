import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const EMPTY = { address: '', city: '', state: '', zip: '', status: 'vacant', property_type: 'single_family', bedrooms: '', bathrooms: '', sqft: '', monthly_rent: '', purchase_price: '', current_value: '', notes: '' };

export default function RentalDialog({ open, onOpenChange, property, onSave }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(property ? { ...EMPTY, ...property } : EMPTY);
  }, [property, open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.address) return;
    setSaving(true);
    const data = { ...form };
    ['bedrooms','bathrooms','sqft','monthly_rent','purchase_price','current_value'].forEach(k => {
      if (data[k] !== '' && data[k] !== null) data[k] = Number(data[k]);
    });
    await onSave(data);
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{property ? 'Edit Rental Property' : 'Add Rental Property'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-2">
          <div className="col-span-2 space-y-1">
            <Label className="text-xs">Address *</Label>
            <Input value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Main St" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">City</Label>
            <Input value={form.city} onChange={e => set('city', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">State</Label>
            <Input value={form.state} onChange={e => set('state', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Status</Label>
            <Select value={form.status} onValueChange={v => set('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="vacant">Vacant</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Property Type</Label>
            <Select value={form.property_type} onValueChange={v => set('property_type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="single_family">Single Family</SelectItem>
                <SelectItem value="multi_family">Multi Family</SelectItem>
                <SelectItem value="condo">Condo</SelectItem>
                <SelectItem value="townhouse">Townhouse</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Beds</Label>
            <Input type="number" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Baths</Label>
            <Input type="number" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Monthly Rent ($)</Label>
            <Input type="number" value={form.monthly_rent} onChange={e => set('monthly_rent', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Purchase Price ($)</Label>
            <Input type="number" value={form.purchase_price} onChange={e => set('purchase_price', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Current Value ($)</Label>
            <Input type="number" value={form.current_value} onChange={e => set('current_value', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Sqft</Label>
            <Input type="number" value={form.sqft} onChange={e => set('sqft', e.target.value)} />
          </div>
          <div className="col-span-2 space-y-1">
            <Label className="text-xs">Notes</Label>
            <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.address}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}