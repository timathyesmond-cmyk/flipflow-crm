import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Mail, Settings as SettingsIcon, X, Save } from 'lucide-react';
import { toast } from 'sonner';

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

export default function Settings() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null); // null | 'new' | template object
  const [form, setForm] = useState(EMPTY);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['email_templates'],
    queryFn: () => base44.entities.EmailTemplate.list('-created_date'),
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
          <p className="text-sm text-muted-foreground">Manage your email templates for deals</p>
        </div>
      </div>

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
    </div>
  );
}