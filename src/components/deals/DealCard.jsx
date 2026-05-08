import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { MapPin, DollarSign, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const priorityConfig = {
  low: { label: 'Low', color: 'bg-muted text-muted-foreground' },
  medium: { label: 'Med', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'High', color: 'bg-amber-100 text-amber-700' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-600' },
};

export default function DealCard({ deal }) {
  const priority = priorityConfig[deal.priority] || priorityConfig.medium;

  return (
    <Link
      to={`/deals/${deal.id}`}
      className="block bg-card rounded-xl border border-border/60 p-4 hover:shadow-md hover:border-secondary/30 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <p className="text-sm font-semibold truncate group-hover:text-secondary transition-colors">
            {deal.property_address}
          </p>
        </div>
        <Badge variant="secondary" className={cn("text-[10px] ml-2 flex-shrink-0", priority.color)}>
          {priority.label}
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground mb-3">
        {deal.city}{deal.state ? `, ${deal.state}` : ''} {deal.zip || ''}
      </p>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {deal.offer_price ? (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <DollarSign className="w-3 h-3" />
            <span>Offer: ${deal.offer_price.toLocaleString()}</span>
          </div>
        ) : null}
        {deal.assignment_fee ? (
          <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <DollarSign className="w-3 h-3" />
            <span>Fee: ${deal.assignment_fee.toLocaleString()}</span>
          </div>
        ) : null}
        {deal.seller_name ? (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <User className="w-3 h-3" />
            <span className="truncate">{deal.seller_name}</span>
          </div>
        ) : null}
        {deal.closing_date ? (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{format(new Date(deal.closing_date), 'MMM d')}</span>
          </div>
        ) : null}
      </div>
    </Link>
  );
}