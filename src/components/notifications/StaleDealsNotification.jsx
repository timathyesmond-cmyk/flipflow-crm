import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Bell, X, AlertTriangle, ChevronRight } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const STALE_DAYS = 7;
const ACTIVE_STAGES = ['lead', 'contacted', 'under_contract'];

export default function StaleDealsNotification() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dismissed_stale_deals') || '[]'); } catch { return []; }
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['deals-stale-check'],
    queryFn: () => base44.entities.Deal.list('-updated_date', 200),
  });

  const staleDeals = deals.filter(deal => {
    if (!ACTIVE_STAGES.includes(deal.stage)) return false;
    if (dismissed.includes(deal.id)) return false;
    const lastUpdate = deal.updated_date ? parseISO(deal.updated_date) : null;
    if (!lastUpdate) return false;
    return differenceInDays(new Date(), lastUpdate) >= STALE_DAYS;
  });

  const dismiss = (id) => {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem('dismissed_stale_deals', JSON.stringify(next));
  };

  const dismissAll = () => {
    const ids = staleDeals.map(d => d.id);
    const next = [...dismissed, ...ids];
    setDismissed(next);
    localStorage.setItem('dismissed_stale_deals', JSON.stringify(next));
    setOpen(false);
  };

  if (staleDeals.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-sidebar-accent/50 text-sidebar-foreground/70 hover:text-white transition-colors"
        title="Follow-up reminders"
      >
        <Bell className="w-[18px] h-[18px]" />
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {staleDeals.length}
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-full ml-3 top-0 z-50 w-80 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-amber-50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold text-amber-800">
                  {staleDeals.length} Stale Deal{staleDeals.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={dismissAll} className="text-xs text-amber-600 hover:text-amber-800 font-medium">
                  Dismiss all
                </button>
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground px-4 pt-3 pb-1">
              These deals haven't moved in {STALE_DAYS}+ days — time to follow up!
            </p>

            <div className="max-h-72 overflow-y-auto divide-y divide-border">
              {staleDeals.map(deal => {
                const days = differenceInDays(new Date(), parseISO(deal.updated_date));
                return (
                  <div key={deal.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{deal.property_address}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] capitalize text-muted-foreground">{deal.stage?.replace('_', ' ')}</span>
                        <span className="text-[11px] text-amber-600 font-medium">· {days}d ago</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Link
                        to={`/deals/${deal.id}`}
                        onClick={() => setOpen(false)}
                        className="p-1.5 rounded-md hover:bg-muted text-primary"
                        title="Open deal"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => dismiss(deal.id)}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}