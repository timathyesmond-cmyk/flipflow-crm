import React, { useState, useEffect } from 'react';
import ProfileSection from '@/components/settings/ProfileSection';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, Mail, Settings as SettingsIcon, X, Save, CreditCard, Zap, Star, Crown, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import { useTrial } from '@/hooks/useTrial';

const STAGE_LABELS = {
  any: 'Any Stage', lead: 'Lead', contacted: 'Contacted',
  under_contract: 'Under Contract', assigned: 'Assigned', closed: 'Closed',
};
const AUDIENCE_LABELS = { seller: 'Seller', buyer: 'Buyer', both: 'Both' };
const AUDIENCE_COLORS = {
  seller: 'bg-blue-100 text-blue-700',
  buyer: 'bg-emerald-100 text-emerald-700',
  both: 'bg-purple-100 text-purple-700',
};

const EMPTY = { name: '', deal_stage: 'any', audience: 'seller', subject: '', body: '' };

const PLACEHOLDER_HINT = '{{name}}, {{address}}, {{offer_price}}, {{closing_date}}';

const PLAN_TIERS = [
  { id: 'basic', label: 'Basic', price: '$14.99/mo', icon: Zap, color: 'text-blue-500', features: ['Dashboard & overview', 'Unlimited deal tracking', 'Contact management', 'Interactive map view', 'Activity timeline & notes'] },
  { id: 'wholesale', label: 'Wholesale', price: '$24.99/mo', icon: Star, color: 'text-amber-500', features: ['Everything in Basic', 'MAO / Wholesale Calculator', 'Max allowable offer analysis', 'Deal profit estimator'] },
  { id: 'pro', label: 'Pro', price: '$49.99/mo', icon: Crown, color: 'text-purple-500', features: ['Everything in Wholesale', 'Sub-To & Seller Finance calculators', 'Contract generators (PDF)', 'Email & SMS templates', 'Suggestions board'] },
];

export default function Settings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [user, setUser] = useState(null);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { trialStatus, daysRemaining } = useTrial(user);

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['my-subscription', user?.email],
    queryFn: () => base44.entities.UserSubscription.filter({ user_email: user.email }),
    enabled: !!user,
  });
  const activeSub = subscriptions.find(s => s.status === 'active') || null;

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['email_templates', user?.id],
    queryFn: () => base44.entities.EmailTemplate.filter({ created_by_id: user.id }, '-created_date'),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.EmailTemplate.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['email_templates'] }); closeForm(); toast.success('Template saved!'); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EmailTemplate.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['email_templates'] }); closeForm(); toast.success('Template updated!'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.EmailTemplate.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['email_templates'] }); toast.success('Template deleted.'); },
  });

  const openNew = () => { setForm(EMPTY); setEditing('new'); };
  const openEdit = (t) => { setForm({ name: t.name, deal_stage: t.deal_stage || 'any', audience: t.audience || 'seller', subject: t.subject, body: t.body }); setEditing(t); };
  const closeForm = () => { setEditing(null); setForm(EMPTY); };

  const handleSave = () => {
    if (!form.name.trim() || !form.subject.trim() || !form.body.trim()) {
      toast.error('Please fill in name, subject, and body.'); return;
    }
    if (editing === 'new') {
      createMutation.mutate(form);
    } else {
      updateMutation.mutate({ id: editing.id, data: form });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-6 h-6" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your profile, plan, and email templates</p>
        </div>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="plan">Plan</TabsTrigger>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSection />
        </TabsContent>

        <TabsContent value="plan">
          <div className="space-y-4">
            {/* Current plan */}
            {activeSub ? (
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardContent className="py-4 px-5 flex items-center gap-4">
                  {(() => { const tier = PLAN_TIERS.find(t => t.id === activeSub.tier); if (!tier) return null; const Icon = tier.icon; return <Icon className={`w-8 h-8 ${tier.color}`} />; })()}
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Current Plan: <span className="capitalize">{activeSub.tier}</span></p>
                    <p className="text-xs text-muted-foreground">{PLAN_TIERS.find(t => t.id === activeSub.tier)?.price}</p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-0"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>
                </CardContent>
              </Card>
            ) : trialStatus === 'active' ? (
              <Card className="border-2 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20">
                <CardContent className="py-4 px-5 flex items-center gap-4">
                  <Zap className="w-8 h-8 text-emerald-500" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Free Trial</p>
                    <p className="text-xs text-muted-foreground">
                      {daysRemaining !== null
                        ? `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`
                        : 'Full access during your trial'}
                    </p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-0">Trial</Badge>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-5 px-5 space-y-2">
                  <p className="text-sm text-muted-foreground">You don't have an active subscription.</p>
                  <Link to="/pricing" className="text-sm text-primary hover:underline">View plans →</Link>
                </CardContent>
              </Card>
            )}

            {/* Plan options */}
            <div className="grid sm:grid-cols-3 gap-4">
              {PLAN_TIERS.map(tier => {
                const Icon = tier.icon;
                const isCurrent = activeSub?.tier === tier.id;
                return (
                  <Card key={tier.id} className={`relative transition-all ${isCurrent ? 'border-2 border-primary ring-1 ring-primary/20' : 'hover:shadow-md'}`}>
                    <CardContent className="pt-5 pb-4 px-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-5 h-5 ${tier.color}`} />
                        <span className="font-semibold text-sm">{tier.label}</span>
                        {isCurrent && <Badge className="text-[10px] ml-auto bg-primary text-primary-foreground">Current</Badge>}
                      </div>
                      <p className="text-lg font-bold">{tier.price}</p>
                      <ul className="space-y-1">
                        {tier.features.map(f => (
                          <li key={f} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />{f}
                          </li>
                        ))}
                      </ul>
                      <Button
                        size="sm"
                        variant={isCurrent ? 'outline' : 'default'}
                        className="w-full gap-1.5"
                        disabled={isCurrent}
                        onClick={() => navigate('/pricing')}
                      >
                        {isCurrent ? 'Current Plan' : 'Switch to ' + tier.label}
                        {!isCurrent && <ExternalLink className="w-3 h-3" />}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {activeSub && (
              <p className="text-xs text-muted-foreground text-center">
                To cancel or manage billing, go to <button className="underline hover:text-foreground" onClick={() => navigate('/pricing')}>Pricing page</button>.
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates">
      {/* Email Templates Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Email Templates</h2>
          </div>
          {!editing && (
            <Button size="sm" onClick={openNew} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> New Template
            </Button>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          These templates appear in the email dialog when contacting sellers or buyers. Use placeholders: <code className="text-xs bg-muted px-1 py-0.5 rounded">{PLACEHOLDER_HINT}</code>
        </p>

        {/* Form */}
        {editing && (
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                {editing === 'new' ? 'New Template' : `Editing: ${editing.name}`}
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={closeForm}><X className="w-4 h-4" /></Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5 sm:col-span-1">
                  <Label>Template Name</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Initial Seller Outreach" />
                </div>
                <div className="space-y-1.5">
                  <Label>Deal Stage</Label>
                  <Select value={form.deal_stage} onValueChange={v => setForm(f => ({ ...f, deal_stage: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STAGE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Audience</Label>
                  <Select value={form.audience} onValueChange={v => setForm(f => ({ ...f, audience: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(AUDIENCE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Subject Line</Label>
                <Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="e.g. Quick question about {{address}}" />
              </div>
              <div className="space-y-1.5">
                <Label>Body</Label>
                <Textarea
                  value={form.body}
                  onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                  rows={8}
                  className="resize-none text-sm font-mono"
                  placeholder={`Hi {{name}},\n\nI wanted to reach out about {{address}}...\n\nBest regards`}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeForm}>Cancel</Button>
                <Button onClick={handleSave} disabled={isSaving} className="gap-1.5">
                  {isSaving ? <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Template
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Template list */}
        {isLoading ? (
          <div className="flex justify-center py-10"><span className="w-5 h-5 border-2 border-muted border-t-foreground rounded-full animate-spin" /></div>
        ) : templates.length === 0 && !editing ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
              <Mail className="w-8 h-8 opacity-30" />
              <p className="text-sm">No custom templates yet. Create one to get started.</p>
              <Button size="sm" variant="outline" onClick={openNew}><Plus className="w-3.5 h-3.5 mr-1" /> New Template</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {templates.map(t => (
              <Card key={t.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="py-3 px-4 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-sm">{t.name}</span>
                      <Badge variant="outline" className="text-xs">{STAGE_LABELS[t.deal_stage] || 'Any Stage'}</Badge>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${AUDIENCE_COLORS[t.audience] || AUDIENCE_COLORS.both}`}>
                        {AUDIENCE_LABELS[t.audience] || 'Both'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{t.subject}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(t)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(t.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}