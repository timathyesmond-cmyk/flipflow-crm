import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Zap, User, Clock, CheckCircle2, XCircle, Eye, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',        color: 'bg-amber-100 text-amber-700' },
  reviewing: { label: 'Reviewing',      color: 'bg-blue-100 text-blue-700' },
  matched:   { label: 'Buyer Matched',  color: 'bg-emerald-100 text-emerald-700' },
  closed:    { label: 'Closed',         color: 'bg-purple-100 text-purple-700' },
  rejected:  { label: 'Not a Fit',      color: 'bg-red-100 text-red-700' },
};

function fmt(n) {
  if (!n) return '—';
  return '$' + Number(n).toLocaleString();
}

export default function DispoQueue() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [matchForm, setMatchForm] = useState({ buyer_email: '', buyer_name: '', status: 'reviewing', admin_notes: '' });
  const [saving, setSaving] = useState(false);

  const { data: dispoDeals = [], isLoading } = useQuery({
    queryKey: ['admin-dispo-deals'],
    queryFn: () => base44.entities.DispoDeal.list('-created_date'),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['admin-dispo-contacts'],
    queryFn: () => base44.entities.Contact.filter({ type: 'cash_buyer' }),
  });

  const cashBuyers = contacts.filter(c => c.type === 'cash_buyer' && c.email);

  const openDeal = (deal) => {
    setSelectedDeal(deal);
    setMatchForm({
      buyer_email: deal.matched_buyer_email || '',
      buyer_name: deal.matched_buyer_name || '',
      status: deal.status || 'reviewing',
      admin_notes: deal.admin_notes || '',
    });
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.DispoDeal.update(selectedDeal.id, {
      status: matchForm.status,
      matched_buyer_email: matchForm.buyer_email || undefined,
      matched_buyer_name: matchForm.buyer_name || undefined,
      admin_notes: matchForm.admin_notes || undefined,
    });

    // If matched, email both parties
    if (matchForm.status === 'matched' && matchForm.buyer_email) {
      const deal = selectedDeal;
      const addr = deal.property_address + (deal.city ? `, ${deal.city}` : '') + (deal.state ? ` ${deal.state}` : '');

      // Notify wholesaler
      await base44.integrations.Core.SendEmail({
        to: deal.submitter_email,
        from_name: 'FlipFlow Dispo',
        subject: `🎉 Buyer Matched for ${deal.property_address}!`,
        body: `<p>Hi ${deal.submitter_name || 'there'},</p>
<p>Great news — we've matched your deal at <strong>${addr}</strong> with a qualified cash buyer!</p>
<p><strong>Buyer:</strong> ${matchForm.buyer_name} (${matchForm.buyer_email})</p>
${matchForm.admin_notes ? `<p><strong>Notes:</strong> ${matchForm.admin_notes}</p>` : ''}
<p>They'll be reaching out to you shortly. Please be ready to share your contract and any additional property details.</p>
<p>— The FlipFlow Dispo Team</p>`,
      }).catch(() => {});

      // Notify buyer
      await base44.integrations.Core.SendEmail({
        to: matchForm.buyer_email,
        from_name: 'FlipFlow Dispo',
        subject: `🏠 New Deal Match: ${deal.property_address}`,
        body: `<p>Hi ${matchForm.buyer_name || 'there'},</p>
<p>We have a deal that matches your buyer criteria:</p>
<ul>
  <li><strong>Address:</strong> ${addr}</li>
  <li><strong>Property Type:</strong> ${deal.property_type?.replace('_', ' ') || '—'}</li>
  ${deal.bedrooms ? `<li><strong>Beds/Baths:</strong> ${deal.bedrooms} bed / ${deal.bathrooms || '?'} bath</li>` : ''}
  <li><strong>Asking Price:</strong> ${fmt(deal.asking_price)}</li>
  ${deal.arv ? `<li><strong>ARV:</strong> ${fmt(deal.arv)}</li>` : ''}
  ${deal.repair_estimate ? `<li><strong>Repairs:</strong> ${fmt(deal.repair_estimate)}</li>` : ''}
  ${deal.assignment_fee ? `<li><strong>Assignment Fee:</strong> ${fmt(deal.assignment_fee)}</li>` : ''}
</ul>
${deal.description ? `<p><strong>Details:</strong> ${deal.description}</p>` : ''}
<p><strong>Wholesaler:</strong> ${deal.submitter_name} (${deal.submitter_email})</p>
<p>Reply to this email or contact the wholesaler directly to move forward.</p>
<p>— The FlipFlow Dispo Team</p>`,
      }).catch(() => {});
    }

    queryClient.invalidateQueries({ queryKey: ['admin-dispo-deals'] });
    setSelectedDeal(null);
    setSaving(false);
  };

  const filtered = dispoDeals.filter(d => {
    if (!search) return true;
    const q = search.toLowerCase();
    return d.property_address?.toLowerCase().includes(q) ||
           d.submitter_email?.toLowerCase().includes(q) ||
           d.submitter_name?.toLowerCase().includes(q);
  });

  const pendingCount = dispoDeals.filter(d => d.status === 'pending').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold">Dispo Queue</h2>
          {pendingCount > 0 && (
            <Badge className="bg-amber-100 text-amber-700">{pendingCount} pending</Badge>
          )}
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search deals..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No dispo deals submitted yet.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(deal => {
            const s = STATUS_CONFIG[deal.status] || STATUS_CONFIG.pending;
            return (
              <Card key={deal.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openDeal(deal)}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1">
                      <p className="font-semibold text-sm">{deal.property_address}</p>
                      <p className="text-xs text-muted-foreground">{[deal.city, deal.state].filter(Boolean).join(', ')}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        <span>{deal.submitter_name || deal.submitter_email}</span>
                      </div>
                      <div className="flex gap-3 text-xs text-muted-foreground flex-wrap mt-1">
                        {deal.asking_price && <span>Ask: <strong>{fmt(deal.asking_price)}</strong></span>}
                        {deal.arv && <span>ARV: <strong>{fmt(deal.arv)}</strong></span>}
                        {deal.assignment_fee && <span>Fee: <strong>{fmt(deal.assignment_fee)}</strong></span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={cn(s.color)}>{s.label}</Badge>
                      <Button variant="outline" size="sm" onClick={e => { e.stopPropagation(); openDeal(deal); }}>
                        Review →
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Review / Match Dialog */}
      <Dialog open={!!selectedDeal} onOpenChange={v => !v && setSelectedDeal(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Dispo Deal</DialogTitle>
          </DialogHeader>
          {selectedDeal && (
            <div className="space-y-4 pt-2">
              {/* Deal summary */}
              <div className="rounded-lg bg-muted p-3 space-y-1 text-sm">
                <p className="font-semibold">{selectedDeal.property_address}</p>
                <p className="text-muted-foreground text-xs">{[selectedDeal.city, selectedDeal.state, selectedDeal.zip].filter(Boolean).join(', ')}</p>
                <div className="flex gap-4 text-xs mt-1 flex-wrap">
                  {selectedDeal.bedrooms && <span>{selectedDeal.bedrooms}bd/{selectedDeal.bathrooms}ba</span>}
                  {selectedDeal.sqft && <span>{Number(selectedDeal.sqft).toLocaleString()} sqft</span>}
                  {selectedDeal.asking_price && <span>Ask: <strong>{fmt(selectedDeal.asking_price)}</strong></span>}
                  {selectedDeal.arv && <span>ARV: <strong>{fmt(selectedDeal.arv)}</strong></span>}
                  {selectedDeal.repair_estimate && <span>Repairs: <strong>{fmt(selectedDeal.repair_estimate)}</strong></span>}
                  {selectedDeal.assignment_fee && <span>Fee: <strong>{fmt(selectedDeal.assignment_fee)}</strong></span>}
                </div>
                {selectedDeal.description && <p className="text-xs text-muted-foreground mt-1">{selectedDeal.description}</p>}
                <p className="text-xs text-muted-foreground">Submitted by: <strong>{selectedDeal.submitter_name}</strong> ({selectedDeal.submitter_email})</p>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={matchForm.status} onValueChange={v => setMatchForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                      <SelectItem key={val} value={val}>{cfg.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Buyer match */}
              <div className="space-y-1">
                <Label>Match with Buyer</Label>
                <Select
                  value={matchForm.buyer_email}
                  onValueChange={v => {
                    const buyer = cashBuyers.find(c => c.email === v);
                    setMatchForm(f => ({ ...f, buyer_email: v, buyer_name: buyer?.name || '' }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a cash buyer from contacts..." />
                  </SelectTrigger>
                  <SelectContent>
                    {cashBuyers.map(c => (
                      <SelectItem key={c.id} value={c.email}>
                        {c.name} — {c.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {cashBuyers.length === 0 && (
                  <p className="text-xs text-muted-foreground">No cash buyers in Contacts yet. Add contacts with type "Cash Buyer".</p>
                )}
              </div>

              {/* Admin notes */}
              <div className="space-y-1">
                <Label>Notes to Wholesaler</Label>
                <Textarea
                  value={matchForm.admin_notes}
                  onChange={e => setMatchForm(f => ({ ...f, admin_notes: e.target.value }))}
                  placeholder="Any feedback or next steps for the wholesaler..."
                  rows={2}
                />
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <Button variant="outline" onClick={() => setSelectedDeal(null)}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : matchForm.status === 'matched' ? 'Save & Notify Both Parties →' : 'Save'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}