import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { MapPin, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const stageConfig = {
  lead: { label: 'Lead', color: 'bg-muted text-muted-foreground' },
  contacted: { label: 'Contacted', color: 'bg-primary/10 text-primary' },
  under_contract: { label: 'Under Contract', color: 'bg-amber-100 text-amber-700' },
  assigned: { label: 'Assigned', color: 'bg-blue-100 text-blue-700' },
  closed: { label: 'Closed', color: 'bg-emerald-100 text-emerald-700' },
  dead: { label: 'Dead', color: 'bg-red-100 text-red-600' },
};

export default function RecentDeals({ deals }) {
  const recent = [...deals].sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date)).slice(0, 6);

  if (recent.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-5 border border-border/60">
        <h3 className="text-sm font-semibold mb-4">Recent Deals</h3>
        <p className="text-sm text-muted-foreground text-center py-8">No deals yet. Add your first deal to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-5 border border-border/60">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Recent Deals</h3>
        <Link to="/deals" className="text-xs text-secondary hover:underline font-medium flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-2">
        {recent.map(deal => {
          const stage = stageConfig[deal.stage] || stageConfig.lead;
          return (
            <Link
              key={deal.id}
              to={`/deals/${deal.id}`}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-primary/60" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{deal.property_address}</p>
                  <p className="text-xs text-muted-foreground">{deal.city}{deal.state ? `, ${deal.state}` : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                {deal.assignment_fee ? (
                  <span className="text-xs font-semibold text-emerald-600">${deal.assignment_fee.toLocaleString()}</span>
                ) : null}
                <Badge variant="secondary" className={cn("text-[10px] font-medium px-2", stage.color)}>
                  {stage.label}
                </Badge>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}