import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const EMPTY = { rental_property_id: '', name: '', email: '', phone: '', lease_start: '', lease_end: '', monthly_rent: '', security_deposit: '', status: 'active', notes: '' };

export default function TenantDialog({ open, onOpenChange, tenant, properties, onSave }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(tenant ? { ...EMPTY, ...tenant } : EMPTY);
  }, [tenant, open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name || !form.rental_property_id) return;
    setSaving(true);
    const data = { ...form };
    ['monthly_rent','security_deposit'].forEach(k => {
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
          <DialogTitle>{tenant ? 'Edit Tenant' : 'Add Tenant'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-2">
          <div className="col-span-2 space-y-1">
            <Label className="text-xs">Property *</Label>
            <Select value={form.rental_property_id} onValueChange={v => set('rental_property_id', v)}>
              <SelectTrigger><SelectValue placeholder="Select property..." /></SelectTrigger>
              <SelectContent>
                {properties.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.address}{p.city ? `, ${p.city}` : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1">
            <Label className="text-xs">Full Name *</Label>
            <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Jane Smith" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Email</Label>
            <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Phone</Label>
            <Input value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Lease Start</Label>
            <Input type="date" value={form.lease_start} onChange={e => set('lease_start', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Lease End</Label>
            <Input type="date" value={form.lease_end} onChange={e => set('lease_end', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Monthly Rent ($)</Label>
            <Input type="number" value={form.monthly_rent} onChange={e => set('monthly_rent', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Security Deposit ($)</Label>
            <Input type="number" value={form.security_deposit} onChange={e => set('security_deposit', e.target.value)} />
          </div>
          <div className="col-span-2 space-y-1">
            <Label className="text-xs">Status</Label>
            <Select value={form.status} onValueChange={v => set('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="late">Late on Rent</SelectItem>
                <SelectItem value="past">Past Tenant</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1">
            <Label className="text-xs">Notes</Label>
            <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.name || !form.rental_property_id}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}