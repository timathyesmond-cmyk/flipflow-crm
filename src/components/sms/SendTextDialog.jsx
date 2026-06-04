import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, ExternalLink } from 'lucide-react';

function applyTemplate(msg, vars) {
  return msg
    .replace(/{{name}}/g, vars.name || '')
    .replace(/{{address}}/g, vars.address || '')
    .replace(/{{stage}}/g, vars.stage || '');
}

export default function SendTextDialog({ open, onOpenChange, toName, toPhone, vars = {} }) {
  const [message, setMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => { base44.auth.me().then(setCurrentUser).catch(() => {}); }, []);

  const { data: templates = [] } = useQuery({
    queryKey: ['sms-templates', currentUser?.id],
    queryFn: () => base44.entities.SmsTemplate.filter({ created_by_id: currentUser.id }),
    enabled: !!currentUser,
  });

  useEffect(() => {
    if (!open) setMessage('');
  }, [open]);

  const handleTemplateSelect = (id) => {
    const t = templates.find(t => t.id === id);
    if (t) setMessage(applyTemplate(t.message, { name: toName, ...vars }));
  };

  const handleOpenSms = () => {
    const normalized = toPhone.replace(/\D/g, '');
    const e164 = normalized.startsWith('1') ? normalized : '1' + normalized;
    const url = `sms:+${e164}${message ? `?body=${encodeURIComponent(message)}` : ''}`;
    window.open(url, '_self');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Text {toName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-xs text-muted-foreground font-medium">To: {toPhone}</p>

          {templates.length > 0 && (
            <Select onValueChange={handleTemplateSelect}>
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Load a template..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div>
            <Textarea
              placeholder="Type your message..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={5}
              maxLength={320}
              className="resize-none text-sm"
            />
            <p className={`text-[10px] mt-1 text-right ${message.length > 160 ? 'text-amber-500' : 'text-muted-foreground'}`}>
              {message.length} chars{message.length > 160 ? ' (2 segments)' : ''}
            </p>
          </div>

          <div className="rounded-lg bg-muted/50 border border-border px-3 py-2 text-xs text-muted-foreground">
            💡 Clicking "Open in Messages" will pre-fill your phone's SMS app with this message.
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleOpenSms} disabled={!toPhone} className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Open in Messages
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}