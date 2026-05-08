import React from 'react';
import DealCard from './DealCard';
import { cn } from '@/lib/utils';

const stageConfig = {
  lead: { label: 'Leads', color: 'bg-muted' },
  contacted: { label: 'Contacted', color: 'bg-primary/20' },
  under_contract: { label: 'Under Contract', color: 'bg-amber-200' },
  assigned: { label: 'Assigned', color: 'bg-blue-200' },
  closed: { label: 'Closed', color: 'bg-emerald-200' },
  dead: { label: 'Dead', color: 'bg-red-200' },
};

export default function StageColumn({ stage, deals }) {
  const config = stageConfig[stage];

  return (
    <div className="min-w-[280px] max-w-[320px] flex-shrink-0">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={cn("w-2.5 h-2.5 rounded-full", config.color)} />
        <h3 className="text-sm font-semibold">{config.label}</h3>
        <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
          {deals.length}
        </span>
      </div>
      <div className="space-y-2">
        {deals.map(deal => (
          <DealCard key={deal.id} deal={deal} />
        ))}
        {deals.length === 0 && (
          <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-xl">
            No deals
          </div>
        )}
      </div>
    </div>
  );
}