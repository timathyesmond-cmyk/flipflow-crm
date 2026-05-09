import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  MessageSquare, Phone, Mail, Users, FileText,
  ArrowLeftRight, Loader2, Clock
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';

const typeConfig = {
  note:            { icon: MessageSquare, label: 'Note',            color: 'text-slate-500 bg-slate-100',   dot: 'bg-slate-400' },
  call:            { icon: Phone,         label: 'Call Logged',     color: 'text-blue-600 bg-blue-100',     dot: 'bg-blue-400' },
  email:           { icon: Mail,          label: 'Email Sent',      color: 'text-purple-600 bg-purple-100', dot: 'bg-purple-400' },
  meeting:         { icon: Users,         label: 'Meeting',         color: 'text-amber-600 bg-amber-100',   dot: 'bg-amber-400' },
  offer_made:      { icon: FileText,      label: 'Offer Made',      color: 'text-emerald-600 bg-emerald-100', dot: 'bg-emerald-400' },
  contract_signed: { icon: FileText,      label: 'Contract Signed', color: 'text-emerald-600 bg-emerald-100', dot: 'bg-emerald-400' },
  stage_change:    { icon: ArrowLeftRight,label: 'Stage Changed',   color: 'text-secondary bg-secondary/10', dot: 'bg-secondary' },
  other:           { icon: MessageSquare, label: 'Activity',        color: 'text-slate-500 bg-slate-100',   dot: 'bg-slate-400' },
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
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities', dealId],
    queryFn: () => base44.entities.Activity.filter({ deal_id: dealId }, '-created_date'),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
        <Clock className="w-8 h-8 opacity-30" />
        <p className="text-sm">No history yet. Stage changes and logged activities will appear here.</p>
      </div>
    );
  }

  const groups = groupByDate(activities);

  return (
    <div className="space-y-6">
      {groups.map(([dateKey, items]) => (
        <div key={dateKey}>
          {/* Date label */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {formatDateLabel(items[0].created_date)}
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Timeline items */}
          <div className="relative pl-6">
            {/* Vertical line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

            <div className="space-y-4">
              {items.map((activity, idx) => {
                const config = typeConfig[activity.type] || typeConfig.other;
                const Icon = config.icon;
                return (
                  <div key={activity.id} className="relative flex gap-3">
                    {/* Dot */}
                    <div className={cn(
                      'absolute -left-6 w-3.5 h-3.5 rounded-full border-2 border-background mt-1 flex-shrink-0',
                      config.dot
                    )} />

                    {/* Icon badge + content */}
                    <div className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                      config.color
                    )}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex-1 min-w-0 pb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-foreground">{config.label}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(activity.created_date), 'h:mm a')}
                        </span>
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
  );
}