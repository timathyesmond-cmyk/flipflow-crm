import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, BellOff, Check, X } from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

export default function TaskReminderCard({ deal, onSave, isSaving }) {
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(deal.follow_up_date || '');
  const [note, setNote] = useState(deal.follow_up_note || '');

  useEffect(() => {
    setDate(deal.follow_up_date || '');
    setNote(deal.follow_up_note || '');
  }, [deal.follow_up_date, deal.follow_up_note]);

  const handleSave = () => {
    onSave({ follow_up_date: date || null, follow_up_note: note || null });
    setEditing(false);
  };

  const handleDismiss = () => {
    onSave({ follow_up_date: null, follow_up_note: null });
    setDate('');
    setNote('');
    setEditing(false);
  };

  const hasReminder = !!deal.follow_up_date;
  const isOverdue = hasReminder && isPast(parseISO(deal.follow_up_date));

  return (
    <Card className={cn(hasReminder && isOverdue && "border-red-200", hasReminder && !isOverdue && "border-amber-200")}>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bell className={cn("w-4 h-4", hasReminder ? (isOverdue ? "text-red-500" : "text-amber-500") : "text-muted-foreground")} />
          Task Reminder
        </CardTitle>
        {!editing && (
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEditing(true)}>
            {hasReminder ? 'Edit' : 'Set'}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="space-y-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Follow-up Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">What to follow up on</label>
              <Input
                placeholder="e.g. Call seller to confirm price..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" className="h-7 text-xs gap-1" onClick={handleSave} disabled={isSaving}>
                <Check className="w-3 h-3" /> Save
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => setEditing(false)}>
                <X className="w-3 h-3" /> Cancel
              </Button>
              {hasReminder && (
                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-destructive hover:text-destructive ml-auto" onClick={handleDismiss}>
                  <BellOff className="w-3 h-3" /> Clear
                </Button>
              )}
            </div>
          </div>
        ) : hasReminder ? (
          <div>
            <p className={cn("text-sm font-medium", isOverdue ? "text-red-600" : "text-amber-700")}>
              {isOverdue ? '⚠ Overdue — ' : ''}
              {format(parseISO(deal.follow_up_date), 'EEEE, MMM d, yyyy')}
            </p>
            {deal.follow_up_note && (
              <p className="text-xs text-muted-foreground mt-1">{deal.follow_up_note}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No reminder set. Click "Set" to add one.</p>
        )}
      </CardContent>
    </Card>
  );
}