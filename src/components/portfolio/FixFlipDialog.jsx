import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const EMPTY = { address: '', city: '', state: '', status: 'planning', purchase_price: '', rehab_budget: '', rehab_spent: '', arv: '', purchase_date: '', target_sale_date: '', actual_sale_price: '', contractor_name: '', contractor_phone: '', notes: '' };

export default function FixFlipDialog({ open, onOpenChange, project, onSave }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(project ? { ...EMPTY, ...project } : EMPTY);
  }, [project, open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.address) return;
    setSaving(true);
    const data = { ...form };
    ['purchase_price','rehab_budget','rehab_spent','arv','actual_sale_price'].forEach(k => {
      if (data[k] !== '') data[k] = Number(data[k]);
    });
    await onSave(data);
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? 'Edit Fix & Flip' : 'Add Fix & Flip Project'}</DialogTitle>
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
          <div className="col-span-2 space-y-1">
            <Label className="text-xs">Status</Label>
            <Select value={form.status} onValueChange={v => set('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="listed">Listed for Sale</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Purchase Price ($)</Label>
            <Input type="number" value={form.purchase_price} onChange={e => set('purchase_price', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">ARV ($)</Label>
            <Input type="number" value={form.arv} onChange={e => set('arv', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Rehab Budget ($)</Label>
            <Input type="number" value={form.rehab_budget} onChange={e => set('rehab_budget', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Rehab Spent ($)</Label>
            <Input type="number" value={form.rehab_spent} onChange={e => set('rehab_spent', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Purchase Date</Label>
            <Input type="date" value={form.purchase_date} onChange={e => set('purchase_date', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Target Sale Date</Label>
            <Input type="date" value={form.target_sale_date} onChange={e => set('target_sale_date', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Actual Sale Price ($)</Label>
            <Input type="number" value={form.actual_sale_price} onChange={e => set('actual_sale_price', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Contractor</Label>
            <Input value={form.contractor_name} onChange={e => set('contractor_name', e.target.value)} />
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