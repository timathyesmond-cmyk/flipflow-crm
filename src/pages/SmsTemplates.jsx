import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Pencil, MessageSquare, Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

const BLANK = { name: '', deal_stage: 'any', audience: 'seller', message: '', auto_send: false };
const STAGE_LABELS = { any: 'Any (manual)', lead: 'Lead', contacted: 'Contacted', under_contract: 'Under Contract', assigned: 'Assigned', closed: 'Closed' };
const AUDIENCE_LABELS = { seller: 'Seller', buyer: 'Buyer', contact: 'Contact' };

function TemplateForm({ initial, onSave, onCancel, isLoading }) {
  const [form, setForm] = useState(initial || BLANK);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="pt-4 space-y-3">
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="sm:col-span-3">
            <label className="text-xs font-medium text-muted-foreground">Template Name</label>
            <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Under Contract Seller" className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Auto-send Stage</label>
            <Select value={form.deal_stage} onValueChange={v => set('deal_stage', v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(STAGE_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Audience</label>
            <Select value={form.audience} onValueChange={v => set('audience', v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(AUDIENCE_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end pb-0.5">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={form.auto_send} onChange={e => set('auto_send', e.target.checked)} className="rounded" />
              Auto-send on stage change
            </label>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Message <span className="text-muted-foreground/60">(use {'{{name}}'}, {'{{address}}'}, {'{{stage}}'})</span></label>
          <Textarea value={form.message} onChange={e => set('message', e.target.value)} rows={4} className="mt-1 resize-none text-sm" placeholder="Hi {{name}}, just wanted to follow up..." />
          <p className="text-[10px] text-muted-foreground mt-1 text-right">{form.message.length} chars</p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}><X className="w-3 h-3 mr-1" />Cancel</Button>
          <Button size="sm" onClick={() => onSave(form)} disabled={!form.name || !form.message || isLoading} className="gap-1">
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
            Save Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SmsTemplates() {
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState(null);
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['sms-templates'],
    queryFn: () => base44.entities.SmsTemplate.list('-updated_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SmsTemplate.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sms-templates'] }); setShowNew(false); toast.success('Template created'); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SmsTemplate.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sms-templates'] }); setEditing(null); toast.success('Template updated'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SmsTemplate.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sms-templates'] }); toast.success('Template deleted'); },
  });

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6" /> SMS Templates
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Reusable text message templates for contacts and deals</p>
        </div>
        <Button className="gap-2" onClick={() => setShowNew(true)} disabled={showNew}>
          <Plus className="w-4 h-4" /> New Template
        </Button>
      </div>

      <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
        <strong>Placeholder variables:</strong> <code>{'{{name}}'}</code> — contact/seller/buyer name, <code>{'{{address}}'}</code> — property address, <code>{'{{stage}}'}</code> — deal stage.
        Templates are loaded in the Send Text dialog when texting a contact or deal party.
      </div>

      {showNew && (
        <TemplateForm
          onSave={(data) => createMutation.mutate(data)}
          onCancel={() => setShowNew(false)}
          isLoading={createMutation.isPending}
        />
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : templates.length === 0 && !showNew ? (
        <div className="text-center py-16 text-muted-foreground">
          <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No templates yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map(t => editing?.id === t.id ? (
            <TemplateForm
              key={t.id}
              initial={t}
              onSave={(data) => updateMutation.mutate({ id: t.id, data })}
              onCancel={() => setEditing(null)}
              isLoading={updateMutation.isPending}
            />
          ) : (
            <Card key={t.id} className="group">
              <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-sm">{t.name}</CardTitle>
                  <Badge variant="secondary" className="text-[10px]">{AUDIENCE_LABELS[t.audience]}</Badge>
                  {t.deal_stage !== 'any' && (
                    <Badge variant="outline" className="text-[10px]">{STAGE_LABELS[t.deal_stage]}</Badge>
                  )}
                  {t.auto_send && (
                    <Badge className="text-[10px] bg-emerald-100 text-emerald-700">Auto-send</Badge>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditing(t)} className="p-1.5 rounded hover:bg-muted">
                    <Pencil className="w-3 h-3 text-muted-foreground" />
                  </button>
                  <button onClick={() => deleteMutation.mutate(t.id)} className="p-1.5 rounded hover:bg-muted">
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{t.message}</p>
                <p className="text-[10px] text-muted-foreground mt-2">{t.message.length} chars</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}