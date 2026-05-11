import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, ChevronRight, CalendarClock, CheckCircle2 } from 'lucide-react';
import { format, isToday, isPast, parseISO } from 'date-fns';

const STAGE_COLORS = {
  lead: 'bg-slate-100 text-slate-700',
  contacted: 'bg-blue-100 text-blue-700',
  under_contract: 'bg-amber-100 text-amber-700',
  assigned: 'bg-purple-100 text-purple-700',
  closed: 'bg-emerald-100 text-emerald-700',
  dead: 'bg-red-100 text-red-700',
};

export default function TodayFollowUps({ deals }) {
  const followUps = deals
    .filter(d => d.follow_up_date && !['closed', 'dead'].includes(d.stage))
    .filter(d => {
      const date = parseISO(d.follow_up_date);
      return isToday(date) || isPast(date);
    })
    .sort((a, b) => new Date(a.follow_up_date) - new Date(b.follow_up_date));

  const overdueCount = followUps.filter(d => !isToday(parseISO(d.follow_up_date))).length;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500" />
            Today's Follow-Ups
          </div>
          <div className="flex items-center gap-2">
            {overdueCount > 0 && (
              <Badge className="bg-red-100 text-red-700 text-xs">{overdueCount} overdue</Badge>
            )}
            <Badge variant="outline" className="text-xs">{followUps.length} total</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {followUps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
            <CheckCircle2 className="w-8 h-8 opacity-30" />
            <p className="text-sm">All caught up! No follow-ups due today.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {followUps.map(deal => {
              const date = parseISO(deal.follow_up_date);
              const isOverdue = !isToday(date);
              return (
                <Link
                  key={deal.id}
                  to={`/deals/${deal.id}`}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                >
                  <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${isOverdue ? 'bg-red-500' : 'bg-amber-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{deal.property_address}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {deal.seller_name && (
                        <span className="text-xs text-muted-foreground">{deal.seller_name}</span>
                      )}
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${STAGE_COLORS[deal.stage] || 'bg-slate-100 text-slate-700'}`}>
                        {deal.stage?.replace('_', ' ')}
                      </span>
                    </div>
                    {deal.follow_up_note && (
                      <p className="text-xs text-muted-foreground mt-1 truncate italic">"{deal.follow_up_note}"</p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                      <CalendarClock className="w-3 h-3" />
                      {isOverdue ? `${format(date, 'MMM d')} (overdue)` : 'Today'}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground mt-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}