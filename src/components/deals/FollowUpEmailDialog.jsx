import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

const TEMPLATES = {
  follow_up: {
    label: 'General Follow-Up',
    subject: (deal) => `Following up on ${deal.property_address}`,
    body: (name, deal) =>
      `Hi ${name},\n\nI wanted to follow up regarding the property at ${deal.property_address}. Are you still interested in discussing?\n\nLooking forward to connecting.\n\nBest regards`,
  },
  offer: {
    label: 'Offer Reminder',
    subject: (deal) => `Our offer for ${deal.property_address}`,
    body: (name, deal) =>
      `Hi ${name},\n\nJust a quick reminder about our offer on ${deal.property_address}${deal.offer_price ? ` of $${deal.offer_price.toLocaleString()}` : ''}. Please let me know if you have any questions or would like to discuss further.\n\nBest regards`,
  },
  closing: {
    label: 'Closing Update',
    subject: (deal) => `Closing update — ${deal.property_address}`,
    body: (name, deal) =>
      `Hi ${name},\n\nI wanted to touch base regarding the upcoming closing for ${deal.property_address}${deal.closing_date ? ` scheduled for ${deal.closing_date}` : ''}. Please let me know if everything is on track from your side.\n\nBest regards`,
  },
  intro: {
    label: 'Introduction',
    subject: (deal) => `Regarding ${deal.property_address}`,
    body: (name, deal) =>
      `Hi ${name},\n\nMy name is and I'm a real estate investor in your area. I came across the property at ${deal.property_address} and would love to make you a fair cash offer. There are no commissions or fees involved.\n\nWould you be open to a quick chat?\n\nBest regards`,
  },
};

function wrapInBrandedHtml(name, subject, plainBody) {
  const paragraphs = plainBody
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => '<p style="margin:0 0 12px;font-size:14px;color:#475569;line-height:1.7;">' + line + '</p>')
    .join('');

  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"></head>'
    + '<body style="margin:0;padding:0;background:#f1f5f9;font-family:\'Helvetica Neue\',Arial,sans-serif;">'
    + '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">'
    + '<tr><td align="center">'
    + '<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">'
    + '<tr><td style="background:linear-gradient(135deg,#1e3a5f 0%,#2d5282 100%);padding:32px 40px;text-align:center;">'
    + '<table cellpadding="0" cellspacing="0" align="center"><tr>'
    + '<td style="background:rgba(255,255,255,0.15);border-radius:10px;padding:10px 14px;">'
    + '<span style="font-size:22px;font-weight:800;color:#f6ad55;letter-spacing:-0.5px;">&#127968; FlipFlow</span>'
    + '</td></tr></table>'
    + '<p style="margin:12px 0 0;color:rgba(255,255,255,0.7);font-size:11px;letter-spacing:2px;text-transform:uppercase;">Wholesale CRM</p>'
    + '</td></tr>'
    + '<tr><td style="padding:40px;">'
    + paragraphs
    + '</td></tr>'
    + '<tr><td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center;">'
    + '<p style="margin:0;font-size:13px;font-weight:600;color:#1e3a5f;">&#127968; FlipFlow Wholesale CRM</p>'
    + '</td></tr>'
    + '</table></td></tr></table></body></html>';
}

function applyPlaceholders(text, contactName, deal) {
  return (text || '')
    .replace(/\{\{name\}\}/g, contactName || '')
    .replace(/\{\{address\}\}/g, deal?.property_address || '')
    .replace(/\{\{offer_price\}\}/g, deal?.offer_price ? '$' + deal.offer_price.toLocaleString() : '')
    .replace(/\{\{closing_date\}\}/g, deal?.closing_date || '');
}

export default function FollowUpEmailDialog({ open, onOpenChange, deal, contactName, contactEmail, contactType }) {
  const [templateKey, setTemplateKey] = useState('follow_up');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const { data: customTemplates = [] } = useQuery({
    queryKey: ['email_templates'],
    queryFn: () => base44.entities.EmailTemplate.list('-created_date'),
  });

  useEffect(() => {
    if (open && !initialized) {
      const tpl = TEMPLATES[templateKey];
      setSubject(tpl.subject(deal));
      setBody(tpl.body(contactName || contactType, deal));
      setInitialized(true);
    }
    if (!open) setInitialized(false);
  }, [open]);

  const applyTemplate = (key) => {
    setTemplateKey(key);
    // Check built-in first
    if (TEMPLATES[key]) {
      const tpl = TEMPLATES[key];
      setSubject(tpl.subject(deal));
      setBody(tpl.body(contactName || contactType, deal));
    } else {
      // Custom template — key is the id
      const tpl = customTemplates.find(t => t.id === key);
      if (tpl) {
        setSubject(applyPlaceholders(tpl.subject, contactName || contactType, deal));
        setBody(applyPlaceholders(tpl.body, contactName || contactType, deal));
      }
    }
  };

  const handleSend = async () => {
    setSending(true);
    const htmlBody = wrapInBrandedHtml(contactName || contactType, subject, body);
    await base44.integrations.Core.SendEmail({
      to: contactEmail,
      subject,
      body: htmlBody,
      from_name: 'FlipFlow CRM',
    });
    await base44.entities.Activity.create({
      deal_id: deal.id,
      type: 'email',
      description: `Email sent to ${contactName || contactType} (${contactEmail}): "${subject}"`,
    });
    setSending(false);
    toast.success('Email sent successfully!');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Send Follow-Up Email</DialogTitle>
          <p className="text-sm text-muted-foreground">
            To: <span className="font-medium">{contactName}</span> &lt;{contactEmail}&gt;
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-xs mb-1.5 block">Template</Label>
            <Select value={templateKey} onValueChange={applyTemplate}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__builtin__" disabled className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">— Built-in —</SelectItem>
                {Object.entries(TEMPLATES).map(([key, tpl]) => (
                  <SelectItem key={key} value={key}>{tpl.label}</SelectItem>
                ))}
                {customTemplates.length > 0 && (
                  <>
                    <SelectItem value="__custom__" disabled className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">— Custom —</SelectItem>
                    {customTemplates.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs mb-1.5 block">Subject</Label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} />
          </div>

          <div>
            <Label className="text-xs mb-1.5 block">Message</Label>
            <Textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={8}
              className="resize-none text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSend} disabled={sending || !subject || !body} className="gap-2">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}