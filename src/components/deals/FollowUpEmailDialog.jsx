import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
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

export default function FollowUpEmailDialog({ open, onOpenChange, deal, contactName, contactEmail, contactType }) {
  const [templateKey, setTemplateKey] = useState('follow_up');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [initialized, setInitialized] = useState(false);

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
    const tpl = TEMPLATES[key];
    setSubject(tpl.subject(deal));
    setBody(tpl.body(contactName || contactType, deal));
  };

  const handleSend = async () => {
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: contactEmail,
      subject,
      body,
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
                {Object.entries(TEMPLATES).map(([key, tpl]) => (
                  <SelectItem key={key} value={key}>{tpl.label}</SelectItem>
                ))}
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