import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  MessageSquare, Phone, Mail, Users, FileText,
  ArrowLeftRight, Loader2, Clock, Send
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';

const typeConfig = {
  note:            { icon: MessageSquare, label: 'Note',            color: 'text-slate-500 bg-slate-100',      dot: 'bg-slate-400' },
  call:            { icon: Phone,         label: 'Call Logged',     color: 'text-blue-600 bg-blue-100',        dot: 'bg-blue-400' },
  email:           { icon: Mail,          label: 'Email Sent',      color: 'text-purple-600 bg-purple-100',    dot: 'bg-purple-400' },
  meeting:         { icon: Users,         label: 'Meeting',         color: 'text-amber-600 bg-amber-100',      dot: 'bg-amber-400' },
  offer_made:      { icon: FileText,      label: 'Offer Made',      color: 'text-emerald-600 bg-emerald-100',  dot: 'bg-emerald-400' },
  contract_signed: { icon: FileText,      label: 'Contract Signed', color: 'text-emerald-600 bg-emerald-100',  dot: 'bg-emerald-400' },
  stage_change:    { icon: ArrowLeftRight,label: 'Stage Changed',   color: 'text-secondary bg-secondary/10',  dot: 'bg-secondary' },
  other:           { icon: MessageSquare, label: 'Activity',        color: 'text-slate-500 bg-slate-100',      dot: 'bg-slate-400' },
};

function formatDateLabel(dateStr) {
  const d = new Date(dateStr);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMMM d, yyyy');
}

function groupByDate(activities) {
  const groups = {};
  activities.forEach(a => {
    const key = format(new Date(a.created_date), 'yyyy-MM-dd');
    if (!groups[key]) groups[key] = [];
    groups[key].push(a);
  });
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
}

export default function DealTimeline({ dealId }) {
  const [note, setNote] = useState('');
  const [noteType, setNoteType] = useState('note');
  const queryClient = useQueryClient();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities', dealId],
    queryFn: () => base44.entities.Activity.filter({ deal_id: dealId }, '-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Activity.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', dealId] });
      setNote('');
      setNoteType('note');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    createMutation.mutate({ deal_id: dealId, type: noteType, description: note });
  };

  return (
    <div className="space-y-5">
      {/* Log activity form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Log a note, call, meeting..."
          rows={2}
          className="resize-none text-sm"
        />
        <div className="flex items-center gap-2">
          <Select value={noteType} onValueChange={setNoteType}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="note">Note</SelectItem>
              <SelectItem value="call">Call</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="offer_made">Offer Made</SelectItem>
              <SelectItem value="contract_signed">Contract Signed</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" size="sm" className="h-8 gap-1.5 text-xs" disabled={createMutation.isPending || !note.trim()}>
            {createMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            Log
          </Button>
        </div>
      </form>

      {/* Timeline */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
          <Clock className="w-8 h-8 opacity-30" />
          <p className="text-sm">No history yet. Stage changes and logged activities will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupByDate(activities).map(([dateKey, items]) => (
            <div key={dateKey}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {formatDateLabel(items[0].created_date)}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="relative pl-6">
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
                <div className="space-y-4">
                  {items.map(activity => {
                    const config = typeConfig[activity.type] || typeConfig.other;
                    const Icon = config.icon;
                    return (
                      <div key={activity.id} className="relative flex gap-3">
                        <div className={cn('absolute -left-6 w-3.5 h-3.5 rounded-full border-2 border-background mt-1 flex-shrink-0', config.dot)} />
                        <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', config.color)}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0 pb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-foreground">{config.label}</span>
                            <span className="text-[10px] text-muted-foreground">{format(new Date(activity.created_date), 'h:mm a')}</span>
                            {activity.created_by && (
                              <span className="text-[10px] text-muted-foreground">· {activity.created_by}</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5 leading-snug">{activity.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}