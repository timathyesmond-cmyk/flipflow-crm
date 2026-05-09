import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Loader2, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const PROPERTY_TYPES = [
  { value: 'single_family', label: 'Single Family' },
  { value: 'multi_family', label: 'Multi Family' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'condo', label: 'Condo' },
  { value: 'land', label: 'Land' },
  { value: 'commercial', label: 'Commercial' },
];

const DEAL_TYPES = [
  { value: 'assignment', label: 'Assignment' },
  { value: 'double_close', label: 'Double Close' },
  { value: 'novation', label: 'Novation' },
];

function ToggleChip({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
        selected
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-background text-muted-foreground border-border hover:border-primary/50'
      )}
    >
      {label}
    </button>
  );
}

function LocationTags({ locations, onChange }) {
  const [input, setInput] = useState('');

  const add = () => {
    const val = input.trim();
    if (val && !locations.includes(val)) {
      onChange([...locations, val]);
    }
    setInput('');
  };

  const remove = (loc) => onChange(locations.filter(l => l !== loc));

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder="City, state, or zip (press Enter)"
          className="text-sm h-8"
        />
        <Button type="button" size="sm" variant="outline" onClick={add} className="h-8 px-2">
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>
      {locations.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {locations.map(loc => (
            <span key={loc} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary rounded-full px-2.5 py-1">
              {loc}
              <button type="button" onClick={() => remove(loc)} className="hover:text-primary/60">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BuyerProfileDialog({ open, onOpenChange, contact, onSave, isLoading }) {
  const [profile, setProfile] = useState({
    buyer_property_types: [],
    buyer_locations: [],
    buyer_deal_types: [],
    buyer_min_beds: '',
    buyer_max_price: '',
    buyer_min_arv: '',
    buyer_notes: '',
  });

  useEffect(() => {
    if (contact) {
      setProfile({
        buyer_property_types: contact.buyer_property_types || [],
        buyer_locations: contact.buyer_locations || [],
        buyer_deal_types: contact.buyer_deal_types || [],
        buyer_min_beds: contact.buyer_min_beds ?? '',
        buyer_max_price: contact.buyer_max_price ?? '',
        buyer_min_arv: contact.buyer_min_arv ?? '',
        buyer_notes: contact.buyer_notes || '',
      });
    }
  }, [contact]);

  const toggle = (field, value) => {
    setProfile(p => ({
      ...p,
      [field]: p[field].includes(value) ? p[field].filter(v => v !== value) : [...p[field], value],
    }));
  };

  const handleSave = () => {
    const cleaned = { ...profile };
    if (cleaned.buyer_min_beds === '') cleaned.buyer_min_beds = null;
    else cleaned.buyer_min_beds = Number(cleaned.buyer_min_beds);
    if (cleaned.buyer_max_price === '') cleaned.buyer_max_price = null;
    else cleaned.buyer_max_price = Number(cleaned.buyer_max_price);
    if (cleaned.buyer_min_arv === '') cleaned.buyer_min_arv = null;
    else cleaned.buyer_min_arv = Number(cleaned.buyer_min_arv);
    onSave(cleaned);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buyer Profile — {contact?.name}</DialogTitle>
          <p className="text-sm text-muted-foreground">Save this investor's property preferences to match deals faster.</p>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Property Types */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Preferred Property Types</Label>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map(pt => (
                <ToggleChip
                  key={pt.value}
                  label={pt.label}
                  selected={profile.buyer_property_types.includes(pt.value)}
                  onClick={() => toggle('buyer_property_types', pt.value)}
                />
              ))}
            </div>
          </div>

          {/* Deal Types */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Preferred Deal Types</Label>
            <div className="flex flex-wrap gap-2">
              {DEAL_TYPES.map(dt => (
                <ToggleChip
                  key={dt.value}
                  label={dt.label}
                  selected={profile.buyer_deal_types.includes(dt.value)}
                  onClick={() => toggle('buyer_deal_types', dt.value)}
                />
              ))}
            </div>
          </div>

          {/* Locations */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Preferred Locations</Label>
            <LocationTags
              locations={profile.buyer_locations}
              onChange={locs => setProfile(p => ({ ...p, buyer_locations: locs }))}
            />
          </div>

          {/* Numeric criteria */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Min Beds</Label>
              <Input
                type="number"
                min={0}
                value={profile.buyer_min_beds}
                onChange={e => setProfile(p => ({ ...p, buyer_min_beds: e.target.value }))}
                className="h-8 text-sm"
                placeholder="Any"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Max Price ($)</Label>
              <Input
                type="number"
                min={0}
                value={profile.buyer_max_price}
                onChange={e => setProfile(p => ({ ...p, buyer_max_price: e.target.value }))}
                className="h-8 text-sm"
                placeholder="Any"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Min ARV ($)</Label>
              <Input
                type="number"
                min={0}
                value={profile.buyer_min_arv}
                onChange={e => setProfile(p => ({ ...p, buyer_min_arv: e.target.value }))}
                className="h-8 text-sm"
                placeholder="Any"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Additional Preferences</Label>
            <textarea
              value={profile.buyer_notes}
              onChange={e => setProfile(p => ({ ...p, buyer_notes: e.target.value }))}
              placeholder="e.g. prefers off-market, cash buyer, no REO..."
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[72px] resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            Save Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}