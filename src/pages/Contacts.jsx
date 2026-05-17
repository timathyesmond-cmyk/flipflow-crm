import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Phone, Mail, Building2, Loader2, Trash2, Pencil, User, Upload, UserCheck, Sparkles, ToggleLeft, ToggleRight, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import ContactFormDialog from '@/components/contacts/ContactFormDialog';
import BuyerProfileDialog from '@/components/contacts/BuyerProfileDialog';
import ImportDialog from '@/components/ImportDialog';
import MatchingDealsDialog from '@/components/contacts/MatchingDealsDialog';
import SendTextDialog from '@/components/sms/SendTextDialog';

const CONTACT_FIELDS = [
  { key: 'name', required: true }, { key: 'type' }, { key: 'phone' },
  { key: 'email' }, { key: 'company' }, { key: 'notes' },
];
const CONTACT_SAMPLE = { name: 'John Smith', type: 'buyer', phone: '555-1234', email: 'john@example.com', company: 'ABC LLC', notes: '' };

const typeColors = {
  buyer: 'bg-blue-100 text-blue-700',
  seller: 'bg-amber-100 text-amber-700',
  agent: 'bg-purple-100 text-purple-700',
  contractor: 'bg-emerald-100 text-emerald-700',
  other: 'bg-muted text-muted-foreground',
};

export default function Contacts() {
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editing, setEditing] = useState(null);
  const [buyerProfile, setBuyerProfile] = useState(null);
  const [matchingDealsContact, setMatchingDealsContact] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [propTypeFilter, setPropTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [buyerStatusFilter, setBuyerStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [textContact, setTextContact] = useState(null);
  const queryClient = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list('-updated_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Contact.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Contact.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Contact.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  });

  const buyerProfileMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Contact.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setBuyerProfile(null);
    },
  });

  const filtered = contacts.filter(c => {
    const matchSearch = !search || c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) || c.company?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || c.type === typeFilter;
    const matchPropType = propTypeFilter === 'all' || c.buyer_property_types?.includes(propTypeFilter);
    const matchLocation = !locationFilter || c.buyer_locations?.some(loc => loc.toLowerCase().includes(locationFilter.toLowerCase()));
    const matchBuyerStatus = buyerStatusFilter === 'all' || c.type !== 'buyer' ||
      (buyerStatusFilter === 'active' ? c.is_active !== false : c.is_active === false);
    return matchSearch && matchType && matchPropType && matchLocation && matchBuyerStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{contacts.length} contact{contacts.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setShowImport(true)}>
            <Upload className="w-4 h-4" /> Import
          </Button>
          <Button className="gap-2" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" /> Add Contact
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="buyer">Buyers</SelectItem>
            <SelectItem value="seller">Sellers</SelectItem>
            <SelectItem value="agent">Agents</SelectItem>
            <SelectItem value="contractor">Contractors</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Select value={propTypeFilter} onValueChange={setPropTypeFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Property Types</SelectItem>
            <SelectItem value="single_family">Single Family</SelectItem>
            <SelectItem value="multi_family">Multi Family</SelectItem>
            <SelectItem value="townhouse">Townhouse</SelectItem>
            <SelectItem value="condo">Condo</SelectItem>
            <SelectItem value="land">Land</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative min-w-[160px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Filter by location..." value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className="pl-9" />
        </div>
        <div className="flex items-center gap-1 border rounded-lg overflow-hidden">
          {['all', 'active', 'inactive'].map(opt => (
            <button
              key={opt}
              onClick={() => setBuyerStatusFilter(opt)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                buyerStatusFilter === opt ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground'
              )}
            >
              {opt === 'all' ? 'All Buyers' : opt === 'active' ? '🟢 Active' : '⚫ Inactive'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(contact => (
          <div key={contact.id} className="bg-card rounded-xl border border-border/60 p-4 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/5 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary/60" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{contact.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge variant="secondary" className={cn("text-[10px]", typeColors[contact.type])}>
                      {contact.type}
                    </Badge>
                    {contact.type === 'buyer' && (
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", contact.is_active === false ? 'bg-muted text-muted-foreground' : 'bg-emerald-100 text-emerald-700')}>
                        {contact.is_active === false ? 'Inactive' : 'Active'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {contact.type === 'buyer' && (
                  <button
                    onClick={() => updateMutation.mutate({ id: contact.id, data: { is_active: contact.is_active === false ? true : false } })}
                    className="p-1.5 rounded-md hover:bg-muted"
                    title={contact.is_active === false ? 'Mark as Active' : 'Mark as Inactive'}
                  >
                    {contact.is_active === false
                      ? <ToggleLeft className="w-3 h-3 text-muted-foreground" />
                      : <ToggleRight className="w-3 h-3 text-emerald-500" />
                    }
                  </button>
                )}
                {contact.type === 'buyer' && (
                  <button onClick={() => setMatchingDealsContact(contact)} className="p-1.5 rounded-md hover:bg-muted" title="View Matching Deals">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                  </button>
                )}
                {contact.type === 'buyer' && (
                  <button onClick={() => setBuyerProfile(contact)} className="p-1.5 rounded-md hover:bg-muted" title="Buyer Profile">
                    <UserCheck className="w-3 h-3 text-blue-500" />
                  </button>
                )}
                {contact.phone && (
                  <button onClick={() => setTextContact(contact)} className="p-1.5 rounded-md hover:bg-muted" title="Send Text">
                    <MessageSquare className="w-3 h-3 text-emerald-500" />
                  </button>
                )}
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}?subject=${encodeURIComponent(
                      contact.type === 'seller'
                        ? 'Following Up on Your Property'
                        : 'New Deal Opportunity for You'
                    )}&body=${encodeURIComponent(
                      contact.type === 'seller'
                        ? `Hi ${contact.name},\n\nI wanted to follow up regarding your property. I'm interested in making a fair cash offer and would love to connect at your convenience.\n\nPlease feel free to reach out anytime.\n\nBest regards`
                        : `Hi ${contact.name},\n\nI have a new deal opportunity that I think would be a great fit for your buying criteria. I'd love to share the details with you.\n\nLet me know if you're interested and I'll send over the full property info.\n\nBest regards`
                    )}`}
                    className="p-1.5 rounded-md hover:bg-muted"
                    title="Send Email"
                  >
                    <Mail className="w-3 h-3 text-primary" />
                  </a>
                )}
                <button onClick={() => setEditing(contact)} className="p-1.5 rounded-md hover:bg-muted">
                  <Pencil className="w-3 h-3 text-muted-foreground" />
                </button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="p-1.5 rounded-md hover:bg-muted">
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete contact?</AlertDialogTitle>
                      <AlertDialogDescription>This will permanently remove {contact.name}.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteMutation.mutate(contact.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="flex items-center gap-2 hover:text-foreground">
                  <Phone className="w-3 h-3" /> {contact.phone}
                </a>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="flex items-center gap-2 hover:text-foreground">
                  <Mail className="w-3 h-3" /> {contact.email}
                </a>
              )}
              {contact.company && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-3 h-3" /> {contact.company}
                </div>
              )}
            </div>
            {contact.type === 'buyer' && (contact.buyer_property_types?.length > 0 || contact.buyer_locations?.length > 0) && (
              <div className="mt-3 pt-3 border-t border-border/50 space-y-1.5">
                {contact.buyer_property_types?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {contact.buyer_property_types.slice(0, 3).map(pt => (
                      <span key={pt} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full capitalize">
                        {pt.replace('_', ' ')}
                      </span>
                    ))}
                    {contact.buyer_property_types.length > 3 && (
                      <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">+{contact.buyer_property_types.length - 3}</span>
                    )}
                  </div>
                )}
                {contact.buyer_locations?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {contact.buyer_locations.slice(0, 2).map(loc => (
                      <span key={loc} className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">
                        📍 {loc}
                      </span>
                    ))}
                    {contact.buyer_locations.length > 2 && (
                      <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">+{contact.buyer_locations.length - 2}</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full text-center py-12">
            No contacts found. Add your first contact!
          </p>
        )}
      </div>

      <ImportDialog
        open={showImport}
        onOpenChange={setShowImport}
        entityName="Contact"
        fields={CONTACT_FIELDS}
        sampleRow={CONTACT_SAMPLE}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['contacts'] })}
      />

      <ContactFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        onSave={data => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />

      <ContactFormDialog
        open={!!editing}
        onOpenChange={(open) => { if (!open) setEditing(null); }}
        contact={editing}
        onSave={data => updateMutation.mutate({ id: editing.id, data })}
        isLoading={updateMutation.isPending}
      />

      {matchingDealsContact && (
        <MatchingDealsDialog
          open={!!matchingDealsContact}
          onOpenChange={(open) => { if (!open) setMatchingDealsContact(null); }}
          contact={matchingDealsContact}
        />
      )}

      {textContact && (
        <SendTextDialog
          open={!!textContact}
          onOpenChange={(open) => { if (!open) setTextContact(null); }}
          toName={textContact.name}
          toPhone={textContact.phone}
          vars={{ name: textContact.name }}
        />
      )}

      {buyerProfile && (
        <BuyerProfileDialog
          open={!!buyerProfile}
          onOpenChange={(open) => { if (!open) setBuyerProfile(null); }}
          contact={buyerProfile}
          onSave={data => buyerProfileMutation.mutate({ id: buyerProfile.id, data })}
          isLoading={buyerProfileMutation.isPending}
        />
      )}
    </div>
  );
}