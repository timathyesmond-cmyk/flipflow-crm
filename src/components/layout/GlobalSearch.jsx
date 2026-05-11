import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function GlobalSearch({ className }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const { data: deals = [] } = useQuery({
    queryKey: ['deals'],
    queryFn: () => base44.entities.Deal.list('-updated_date'),
  });

  const results = query.trim().length < 2 ? [] : deals.filter(d => {
    const q = query.toLowerCase();
    return d.property_address?.toLowerCase().includes(q) ||
      d.city?.toLowerCase().includes(q) ||
      d.zip?.toLowerCase().includes(q) ||
      d.seller_name?.toLowerCase().includes(q);
  }).slice(0, 8);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (deal) => {
    navigate(`/deals/${deal.id}`);
    setQuery('');
    setOpen(false);
  };

  const stageColors = {
    lead: 'bg-muted text-muted-foreground',
    contacted: 'bg-primary/10 text-primary',
    under_contract: 'bg-amber-100 text-amber-700',
    assigned: 'bg-blue-100 text-blue-700',
    closed: 'bg-emerald-100 text-emerald-700',
    dead: 'bg-red-100 text-red-600',
  };

  const stageLabels = {
    lead: 'Lead', contacted: 'Contacted', under_contract: 'Under Contract',
    assigned: 'Assigned', closed: 'Closed', dead: 'Dead',
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search properties…"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="w-full h-8 pl-8 pr-7 text-sm bg-muted/60 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute top-full mt-1.5 left-0 right-0 bg-popover border border-border rounded-xl shadow-lg z-50 overflow-hidden">
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4 px-3">No deals found</p>
          ) : (
            <ul>
              {results.map(deal => (
                <li key={deal.id}>
                  <button
                    onMouseDown={() => handleSelect(deal)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/60 transition-colors text-left"
                  >
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{deal.property_address}</p>
                      <p className="text-xs text-muted-foreground">
                        {deal.city}{deal.state ? `, ${deal.state}` : ''} {deal.zip || ''}
                      </p>
                    </div>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0", stageColors[deal.stage])}>
                      {stageLabels[deal.stage] || deal.stage}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}