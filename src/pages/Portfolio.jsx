import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import UpgradeGate from '@/components/UpgradeGate';
import RentalDialog from '@/components/portfolio/RentalDialog';
import TenantDialog from '@/components/portfolio/TenantDialog';
import FixFlipDialog from '@/components/portfolio/FixFlipDialog';
import PortfolioAnalytics from '@/components/portfolio/PortfolioAnalytics';
import PortfolioResources from '@/components/portfolio/PortfolioResources';
import {
  Home, Users, Wrench, Plus, Edit, Trash2, Phone, Mail,
  DollarSign, Calendar, TrendingUp, Building2, BarChart2, BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';

const RENTAL_STATUS = {
  vacant:      { label: 'Vacant',      class: 'bg-red-100 text-red-700' },
  occupied:    { label: 'Occupied',    class: 'bg-emerald-100 text-emerald-700' },
  maintenance: { label: 'Maintenance', class: 'bg-amber-100 text-amber-700' },
};
const TENANT_STATUS = {
  active: { label: 'Active',       class: 'bg-emerald-100 text-emerald-700' },
  late:   { label: 'Late on Rent', class: 'bg-red-100 text-red-700' },
  past:   { label: 'Past Tenant',  class: 'bg-muted text-muted-foreground' },
};
const FLIP_STATUS = {
  planning:    { label: 'Planning',    class: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'In Progress', class: 'bg-amber-100 text-amber-700' },
  listed:      { label: 'Listed',      class: 'bg-purple-100 text-purple-700' },
  sold:        { label: 'Sold',        class: 'bg-emerald-100 text-emerald-700' },
};

function fmt(n) { return n ? `$${Number(n).toLocaleString()}` : '—'; }
function fmtDate(d) { return d ? new Date(d).toLocaleDateString() : '—'; }

export default function Portfolio() {
  const qc = useQueryClient();
  const { effectiveTier } = useOutletContext() || {};
  const TIER_RANK = { basic: 1, wholesale: 2, pro: 3, trial: 3 };
  const isPro = (TIER_RANK[effectiveTier] || 0) >= TIER_RANK['pro'];

  const [rentalOpen, setRentalOpen] = useState(false);
  const [editRental, setEditRental] = useState(null);
  const [tenantOpen, setTenantOpen] = useState(false);
  const [editTenant, setEditTenant] = useState(null);
  const [flipOpen, setFlipOpen] = useState(false);
  const [editFlip, setEditFlip] = useState(null);

  const { data: rentals = [] } = useQuery({
    queryKey: ['rental-properties'],
    queryFn: () => base44.entities.RentalProperty.list(),
    enabled: isPro,
  });
  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => base44.entities.Tenant.list(),
    enabled: isPro,
  });
  const { data: flips = [] } = useQuery({
    queryKey: ['fix-and-flips'],
    queryFn: () => base44.entities.FixAndFlip.list(),
    enabled: isPro,
  });

  const saveRental = useMutation({
    mutationFn: (data) => editRental
      ? base44.entities.RentalProperty.update(editRental.id, data)
      : base44.entities.RentalProperty.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['rental-properties'] }); toast.success('Property saved'); },
  });
  const deleteRental = useMutation({
    mutationFn: (id) => base44.entities.RentalProperty.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['rental-properties'] }); toast.success('Property removed'); },
  });

  const saveTenant = useMutation({
    mutationFn: (data) => editTenant
      ? base44.entities.Tenant.update(editTenant.id, data)
      : base44.entities.Tenant.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tenants'] }); toast.success('Tenant saved'); },
  });
  const deleteTenant = useMutation({
    mutationFn: (id) => base44.entities.Tenant.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tenants'] }); toast.success('Tenant removed'); },
  });

  const saveFlip = useMutation({
    mutationFn: (data) => editFlip
      ? base44.entities.FixAndFlip.update(editFlip.id, data)
      : base44.entities.FixAndFlip.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fix-and-flips'] }); toast.success('Project saved'); },
  });
  const deleteFlip = useMutation({
    mutationFn: (id) => base44.entities.FixAndFlip.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fix-and-flips'] }); toast.success('Project removed'); },
  });

  if (!isPro) return <UpgradeGate requiredTier="pro" />;

  const vacantCount = rentals.filter(r => r.status === 'vacant').length;
  const monthlyIncome = rentals.filter(r => r.status === 'occupied').reduce((s, r) => s + (r.monthly_rent || 0), 0);
  const activeFlips = flips.filter(f => f.status === 'in_progress').length;
  const lateCount = tenants.filter(t => t.status === 'late').length;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Portfolio</h1>
          <p className="text-sm text-muted-foreground">Rental properties, tenants, and fix-and-flip projects</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Vacant Units',    value: vacantCount,       icon: Home,        color: 'text-red-500' },
          { label: 'Monthly Income',  value: fmt(monthlyIncome), icon: DollarSign,  color: 'text-emerald-500' },
          { label: 'Active Flips',    value: activeFlips,       icon: Wrench,      color: 'text-amber-500' },
          { label: 'Late on Rent',    value: lateCount,         icon: Users,       color: 'text-red-500' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <s.icon className={cn('w-5 h-5', s.color)} />
                <div>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="rentals">
        <TabsList>
          <TabsTrigger value="rentals" className="flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5" /> Rentals ({rentals.length})
          </TabsTrigger>
          <TabsTrigger value="tenants" className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Tenants ({tenants.length})
          </TabsTrigger>
          <TabsTrigger value="flips" className="flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5" /> Fix-and-Flip ({flips.length})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5" /> Analytics
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> Resources
          </TabsTrigger>
        </TabsList>

        {/* ── RENTALS ── */}
        <TabsContent value="rentals" className="mt-4 space-y-3">
          <div className="flex justify-end">
            <Button size="sm" className="gap-1.5" onClick={() => { setEditRental(null); setRentalOpen(true); }}>
              <Plus className="w-4 h-4" /> Add Property
            </Button>
          </div>
          {rentals.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Home className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No rental properties yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rentals.map(p => {
                const st = RENTAL_STATUS[p.status] || RENTAL_STATUS.vacant;
                const propTenants = tenants.filter(t => t.rental_property_id === p.id && t.status === 'active');
                return (
                  <Card key={p.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4 pb-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{p.address}</p>
                          {(p.city || p.state) && <p className="text-xs text-muted-foreground">{[p.city, p.state].filter(Boolean).join(', ')}</p>}
                        </div>
                        <Badge className={cn('text-[10px] flex-shrink-0', st.class)}>{st.label}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        {p.bedrooms && <div className="bg-muted/40 rounded p-1.5"><p className="font-semibold">{p.bedrooms}</p><p className="text-muted-foreground">Beds</p></div>}
                        {p.bathrooms && <div className="bg-muted/40 rounded p-1.5"><p className="font-semibold">{p.bathrooms}</p><p className="text-muted-foreground">Baths</p></div>}
                        {p.monthly_rent && <div className="bg-emerald-50 rounded p-1.5"><p className="font-semibold text-emerald-700">{fmt(p.monthly_rent)}</p><p className="text-muted-foreground">/ mo</p></div>}
                      </div>
                      {propTenants.length > 0 && (
                        <p className="text-xs text-muted-foreground">👤 {propTenants.map(t => t.name).join(', ')}</p>
                      )}
                      <div className="flex gap-2 pt-1">
                        <Button variant="outline" size="sm" className="gap-1 h-7 text-xs" onClick={() => { setEditRental(p); setRentalOpen(true); }}>
                          <Edit className="w-3 h-3" /> Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1 h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10">
                              <Trash2 className="w-3 h-3" /> Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this property?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => deleteRental.mutate(p.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── TENANTS ── */}
        <TabsContent value="tenants" className="mt-4 space-y-3">
          <div className="flex justify-end">
            <Button size="sm" className="gap-1.5" onClick={() => { setEditTenant(null); setTenantOpen(true); }}>
              <Plus className="w-4 h-4" /> Add Tenant
            </Button>
          </div>
          {tenants.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No tenants yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tenants.map(t => {
                const st = TENANT_STATUS[t.status] || TENANT_STATUS.active;
                const prop = rentals.find(r => r.id === t.rental_property_id);
                return (
                  <Card key={t.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm">{t.name}</p>
                            <Badge className={cn('text-[10px]', st.class)}>{st.label}</Badge>
                          </div>
                          {prop && <p className="text-xs text-muted-foreground">🏠 {prop.address}</p>}
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            {t.email && <a href={`mailto:${t.email}`} className="flex items-center gap-1 hover:text-foreground"><Mail className="w-3 h-3" />{t.email}</a>}
                            {t.phone && <a href={`tel:${t.phone}`} className="flex items-center gap-1 hover:text-foreground"><Phone className="w-3 h-3" />{t.phone}</a>}
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            {t.monthly_rent && <span><strong>{fmt(t.monthly_rent)}</strong>/mo</span>}
                            {t.lease_start && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmtDate(t.lease_start)} – {fmtDate(t.lease_end)}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button variant="outline" size="sm" className="gap-1 h-7 text-xs" onClick={() => { setEditTenant(t); setTenantOpen(true); }}>
                            <Edit className="w-3 h-3" /> Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove tenant?</AlertDialogTitle>
                                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => deleteTenant.mutate(t.id)}>Remove</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── FIX-AND-FLIP ── */}
        <TabsContent value="flips" className="mt-4 space-y-3">
          <div className="flex justify-end">
            <Button size="sm" className="gap-1.5" onClick={() => { setEditFlip(null); setFlipOpen(true); }}>
              <Plus className="w-4 h-4" /> Add Project
            </Button>
          </div>
          {flips.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Wrench className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No fix-and-flip projects yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {flips.map(f => {
                const st = FLIP_STATUS[f.status] || FLIP_STATUS.planning;
                const profit = f.actual_sale_price && f.purchase_price
                  ? f.actual_sale_price - f.purchase_price - (f.rehab_spent || 0)
                  : null;
                const rehabPct = f.rehab_budget && f.rehab_spent
                  ? Math.min(100, Math.round((f.rehab_spent / f.rehab_budget) * 100))
                  : null;
                return (
                  <Card key={f.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4 pb-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{f.address}</p>
                          {(f.city || f.state) && <p className="text-xs text-muted-foreground">{[f.city, f.state].filter(Boolean).join(', ')}</p>}
                        </div>
                        <Badge className={cn('text-[10px] flex-shrink-0', st.class)}>{st.label}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {f.purchase_price && <div className="bg-muted/40 rounded p-1.5"><p className="font-semibold">{fmt(f.purchase_price)}</p><p className="text-muted-foreground">Purchase</p></div>}
                        {f.arv && <div className="bg-blue-50 rounded p-1.5"><p className="font-semibold text-blue-700">{fmt(f.arv)}</p><p className="text-muted-foreground">ARV</p></div>}
                        {f.rehab_budget && <div className="bg-amber-50 rounded p-1.5"><p className="font-semibold text-amber-700">{fmt(f.rehab_budget)}</p><p className="text-muted-foreground">Budget</p></div>}
                        {f.rehab_spent && <div className="bg-muted/40 rounded p-1.5"><p className="font-semibold">{fmt(f.rehab_spent)}</p><p className="text-muted-foreground">Spent</p></div>}
                      </div>
                      {rehabPct !== null && (
                        <div>
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Rehab Progress</span><span>{rehabPct}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-muted rounded-full">
                            <div className="h-1.5 bg-amber-500 rounded-full" style={{ width: `${rehabPct}%` }} />
                          </div>
                        </div>
                      )}
                      {profit !== null && (
                        <div className={cn('text-xs font-semibold flex items-center gap-1', profit >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                          <TrendingUp className="w-3.5 h-3.5" />
                          {profit >= 0 ? '+' : ''}{fmt(profit)} profit
                        </div>
                      )}
                      <div className="flex gap-2 pt-1">
                        <Button variant="outline" size="sm" className="gap-1 h-7 text-xs" onClick={() => { setEditFlip(f); setFlipOpen(true); }}>
                          <Edit className="w-3 h-3" /> Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1 h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10">
                              <Trash2 className="w-3 h-3" /> Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this project?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => deleteFlip.mutate(f.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── ANALYTICS ── */}
        <TabsContent value="analytics" className="mt-4">
          <PortfolioAnalytics rentals={rentals} tenants={tenants} flips={flips} />
        </TabsContent>

        {/* ── RESOURCES ── */}
        <TabsContent value="resources" className="mt-4">
          <PortfolioResources />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <RentalDialog
        open={rentalOpen}
        onOpenChange={setRentalOpen}
        property={editRental}
        onSave={(data) => saveRental.mutateAsync(data)}
      />
      <TenantDialog
        open={tenantOpen}
        onOpenChange={setTenantOpen}
        tenant={editTenant}
        properties={rentals}
        onSave={(data) => saveTenant.mutateAsync(data)}
      />
      <FixFlipDialog
        open={flipOpen}
        onOpenChange={setFlipOpen}
        project={editFlip}
        onSave={(data) => saveFlip.mutateAsync(data)}
      />
    </div>
  );
}