import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Phone, Mail, Users, FileText, ArrowLeftRight, Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const typeConfig = {
  note: { icon: MessageSquare, label: 'Note', color: 'text-muted-foreground bg-muted' },
  call: { icon: Phone, label: 'Call', color: 'text-blue-600 bg-blue-100' },
  email: { icon: Mail, label: 'Email', color: 'text-purple-600 bg-purple-100' },
  meeting: { icon: Users, label: 'Meeting', color: 'text-amber-600 bg-amber-100' },
  offer_made: { icon: FileText, label: 'Offer', color: 'text-emerald-600 bg-emerald-100' },
  contract_signed: { icon: FileText, label: 'Contract', color: 'text-emerald-600 bg-emerald-100' },
  stage_change: { icon: ArrowLeftRight, label: 'Stage Change', color: 'text-secondary bg-secondary/10' },
  other: { icon: MessageSquare, label: 'Other', color: 'text-muted-foreground bg-muted' },
};

export default function ActivityFeed({ dealId }) {
  const [newNote, setNewNote] = useState('');
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
      setNewNote('');
      setNoteType('note');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    createMutation.mutate({ deal_id: dealId, type: noteType, description: newNote });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          placeholder="Add a note, log a call..."
          rows={2}
          className="resize-none"
        />
        <div className="flex items-center gap-2">
          <Select value={noteType} onValueChange={setNoteType}>
            <SelectTrigger className="w-32 h-8 text-xs">
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
          <Button type="submit" size="sm" disabled={createMutation.isPending || !newNote.trim()}>
            {createMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            <span className="ml-1">Add</span>
          </Button>
        </div>
      </form>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : activities.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No activity yet</p>
      ) : (
        <div className="space-y-3">
          {activities.map(activity => {
            const config = typeConfig[activity.type] || typeConfig.other;
            const Icon = config.icon;
            return (
              <div key={activity.id} className="flex gap-3">
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", config.color)}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{config.label}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(activity.created_date), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{activity.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}