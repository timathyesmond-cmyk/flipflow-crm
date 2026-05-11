import React from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MapPin, Home, DollarSign, Loader2, Sparkles } from 'lucide-react';

const stageColors = {
  lead: 'bg-slate-100 text-slate-700',
  contacted: 'bg-blue-100 text-blue-700',
  under_contract: 'bg-amber-100 text-amber-700',
  assigned: 'bg-purple-100 text-purple-700',
  closed: 'bg-emerald-100 text-emerald-700',
  dead: 'bg-red-100 text-red-700',
};

function dealMatchesContact(deal, contact) {
  if (['closed', 'dead'].includes(deal.stage)) return false;

  const locationMatch = !contact.buyer_locations?.length ||
    contact.buyer_locations.some(loc => {
      const l = loc.toLowerCase();
      return (
        deal.city?.toLowerCase().includes(l) ||
        deal.state?.toLowerCase().includes(l) ||
        deal.zip?.toLowerCase().includes(l) ||
        deal.property_address?.toLowerCase().includes(l)
      );
    });

  const propTypeMatch = !contact.buyer_property_types?.length ||
    contact.buyer_property_types.includes(deal.property_type);

  return locationMatch && propTypeMatch;
}

export default function MatchingDealsDialog({ open, onOpenChange, contact }) {
  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: () => base44.entities.Deal.list('-updated_date'),
    enabled: open,
  });

  const matchingDeals = deals.filter(d => dealMatchesContact(d, contact));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Matching Deals for {contact?.name}
          </DialogTitle>
          <p className="text-xs text-muted-foreground pt-1">
            Active deals matching this investor's preferred locations and property types.
          </p>
        </DialogHeader>

        {/* Criteria summary */}
        {(contact?.buyer_locations?.length > 0 || contact?.buyer_property_types?.length > 0) && (
          <div className="flex flex-wrap gap-1.5 px-1 pb-2 border-b border-border">
            {contact.buyer_locations?.map(loc => (
              <span key={loc} className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">📍 {loc}</span>
            ))}
            {contact.buyer_property_types?.map(pt => (
              <span key={pt} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full capitalize">{pt.replace('_', ' ')}</span>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : matchingDeals.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Home className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No active deals match this investor's criteria right now.</p>
              {!contact?.buyer_locations?.length && !contact?.buyer_property_types?.length && (
                <p className="text-xs mt-1 opacity-70">Set up their buyer profile with locations & property types to see matches.</p>
              )}
            </div>
          ) : (
            matchingDeals.map(deal => (
              <Link
                key={deal.id}
                to={`/deals/${deal.id}`}
                onClick={() => onOpenChange(false)}
                className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{deal.property_address}</p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {deal.city && (
                      <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" />{deal.city}{deal.state ? `, ${deal.state}` : ''}
                      </span>
                    )}
                    {deal.property_type && (
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full capitalize">
                        {deal.property_type.replace('_', ' ')}
                      </span>
                    )}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${stageColors[deal.stage] || 'bg-slate-100 text-slate-700'}`}>
                      {deal.stage?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {deal.assignment_fee > 0 && (
                    <p className="text-sm font-semibold text-emerald-600 flex items-center gap-0.5">
                      <DollarSign className="w-3 h-3" />{deal.assignment_fee.toLocaleString()}
                    </p>
                  )}
                  {deal.arv > 0 && (
                    <p className="text-xs text-muted-foreground">ARV ${deal.arv.toLocaleString()}</p>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>

        {!isLoading && matchingDeals.length > 0 && (
          <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
            {matchingDeals.length} matching deal{matchingDeals.length !== 1 ? 's' : ''} found
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}