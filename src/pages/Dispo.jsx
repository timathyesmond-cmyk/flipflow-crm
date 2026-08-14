import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSubscription } from '@/hooks/useSubscription';
import { useTrial } from '@/hooks/useTrial';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Zap, Lock, Plus, Clock, CheckCircle2, XCircle, Eye, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const STATUS_CONFIG = {
  pending:   { label: 'Pending Review', color: 'bg-amber-100 text-amber-700', icon: Clock },
  reviewing: { label: 'Under Review',   color: 'bg-blue-100 text-blue-700',   icon: Eye },
  matched:   { label: 'Buyer Matched',  color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  closed:    { label: 'Closed',         color: 'bg-purple-100 text-purple-700', icon: CheckCircle2 },
  rejected:  { label: 'Not a Fit',      color: 'bg-red-100 text-red-700',     icon: XCircle },
};

const PROPERTY_TYPES = [
  { value: 'single_family', label: 'Single Family' },
  { value: 'multi_family',  label: 'Multi Family' },
  { value: 'townhouse',     label: 'Townhouse' },
  { value: 'condo',         label: 'Condo' },
  { value: 'land',          label: 'Land' },
  { value: 'commercial',    label: 'Commercial' },
  { value: 'other',         label: 'Other' },
];

const EMPTY_FORM = {
  property_address: '', city: '', state: '', zip: '',
  property_type: 'single_family',
  bedrooms: '', bathrooms: '', sqft: '',
  asking_price: '', arv: '', repair_estimate: '', assignment_fee: '',
  closing_date: '', description: '',
};

function fmt(n) {
  if (!n) return '—';
  return '$' + Number(n).toLocaleString();
}

export default function Dispo() {
  const [user, setUser] = useState(null);
  const { tier, loading: subLoading } = useSubscription(user);
  const { trialStatus } = useTrial(user);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: myDeals = [], isLoading } = useQuery({
    queryKey: ['dispo-my-deals', user?.email],
    queryFn: () => base44.entities.DispoDeal.filter({ submitter_email: user.email }, '-created_date'),
    enabled: !!user,
  });

  const isSubscribed = !!tier || trialStatus === 'active' || trialStatus === 'unknown'
    || user?.role === 'admin' || user?.gifted_membership;
  const freeSlotUsed = myDeals.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await base44.entities.DispoDeal.create({
        ...form,
        submitter_email: user.email,
        submitter_name: user.full_name || user.email,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
        sqft: form.sqft ? Number(form.sqft) : undefined,
        asking_price: form.asking_price ? Number(form.asking_price) : undefined,
        arv: form.arv ? Number(form.arv) : undefined,
        repair_estimate: form.repair_estimate ? Number(form.repair_estimate) : undefined,
        assignment_fee: form.assignment_fee ? Number(form.assignment_fee) : undefined,
        status: 'pending',
      });
      queryClient.invalidateQueries({ queryKey: ['dispo-my-deals'] });
      setShowForm(false);
      setForm(EMPTY_FORM);
      toast.success('Deal submitted for dispo review!');
    } catch (err) {
      console.error('Dispo submit failed:', err);
      toast.error('Failed to submit deal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  if (subLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not subscribed AND already used free slot
  if (!isSubscribed) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
        <DispoHeader />
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-6 pb-6 text-center space-y-4">
            <Lock className="w-10 h-10 text-amber-500 mx-auto" />
            <h2 className="text-lg font-bold">Subscription Required</h2>
            <p className="text-sm text-muted-foreground">
              You need an active FlipFlow subscription to submit dispo deals.
              Your <strong>first dispo deal is free</strong> once you subscribe.
            </p>
            <Button asChild>
              <Link to="/pricing">View Plans →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <DispoHeader />

      {/* Info banner */}
      <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20">
        <CardContent className="pt-4 pb-4 flex items-start gap-3">
          <Zap className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-emerald-800 dark:text-emerald-300">
            <strong>How it works:</strong> Submit your deal below. Our team reviews it, matches it with a
            qualified cash buyer from our network, and contacts both parties to close.
            {!freeSlotUsed && <span className="ml-1 font-semibold">Your first dispo is free!</span>}
          </div>
        </CardContent>
      </Card>

      {/* Submit button */}
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Submit a Deal for Dispo
        </Button>
      </div>

      {/* My submitted deals */}
      {myDeals.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No deals submitted yet. Submit your first deal above!</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">My Submitted Deals</h2>
          {myDeals.map(deal => {
            const s = STATUS_CONFIG[deal.status] || STATUS_CONFIG.pending;
            const Icon = s.icon;
            return (
              <Card key={deal.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1">
                      <p className="font-semibold text-sm">{deal.property_address}</p>
                      <p className="text-xs text-muted-foreground">
                        {[deal.city, deal.state, deal.zip].filter(Boolean).join(', ')}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                        {deal.asking_price && <span>Ask: <strong>{fmt(deal.asking_price)}</strong></span>}
                        {deal.arv && <span>ARV: <strong>{fmt(deal.arv)}</strong></span>}
                        {deal.assignment_fee && <span>Fee: <strong>{fmt(deal.assignment_fee)}</strong></span>}
                      </div>
                      {deal.status === 'matched' && deal.matched_buyer_name && (
                        <p className="text-xs text-emerald-700 font-medium mt-1">
                          ✅ Matched with: {deal.matched_buyer_name}
                        </p>
                      )}
                    </div>
                    <Badge className={cn('flex items-center gap-1 shrink-0', s.color)}>
                      <Icon className="w-3 h-3" />
                      {s.label}
                    </Badge>
                  </div>
                  {deal.admin_notes && (
                    <p className="mt-3 text-xs text-muted-foreground border-t pt-2">{deal.admin_notes}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Submit Deal Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submit Deal for Dispo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Property Address *</Label>
              <Input value={form.property_address} onChange={e => set('property_address', e.target.value)} required placeholder="123 Main St" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1 col-span-2">
                <Label>City</Label>
                <Input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Atlanta" />
              </div>
              <div className="space-y-1">
                <Label>State</Label>
                <Input value={form.state} onChange={e => set('state', e.target.value)} placeholder="GA" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Zip</Label>
                <Input value={form.zip} onChange={e => set('zip', e.target.value)} placeholder="30301" />
              </div>
              <div className="space-y-1">
                <Label>Property Type</Label>
                <Select value={form.property_type} onValueChange={v => set('property_type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Beds</Label>
                <Input type="number" min="0" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} placeholder="3" />
              </div>
              <div className="space-y-1">
                <Label>Baths</Label>
                <Input type="number" min="0" step="0.5" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} placeholder="2" />
              </div>
              <div className="space-y-1">
                <Label>Sq Ft</Label>
                <Input type="number" min="0" value={form.sqft} onChange={e => set('sqft', e.target.value)} placeholder="1400" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Asking Price *</Label>
                <Input type="number" min="0" value={form.asking_price} onChange={e => set('asking_price', e.target.value)} required placeholder="120000" />
              </div>
              <div className="space-y-1">
                <Label>ARV</Label>
                <Input type="number" min="0" value={form.arv} onChange={e => set('arv', e.target.value)} placeholder="200000" />
              </div>
              <div className="space-y-1">
                <Label>Repair Estimate</Label>
                <Input type="number" min="0" value={form.repair_estimate} onChange={e => set('repair_estimate', e.target.value)} placeholder="25000" />
              </div>
              <div className="space-y-1">
                <Label>Assignment Fee</Label>
                <Input type="number" min="0" value={form.assignment_fee} onChange={e => set('assignment_fee', e.target.value)} placeholder="10000" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Closing Date</Label>
              <Input type="date" value={form.closing_date} onChange={e => set('closing_date', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Additional Details</Label>
              <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Condition, seller motivation, access, any other notes..." rows={3} />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Deal →'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DispoHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
        <Zap className="w-5 h-5 text-amber-500" />
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dispo Services</h1>
        <p className="text-sm text-muted-foreground">Submit your deals — we'll find you a qualified buyer</p>
      </div>
    </div>
  );
}