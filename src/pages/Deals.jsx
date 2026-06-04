import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext } from '@hello-pangea/dnd';
import { Plus, Search, LayoutGrid, List, Loader2, Upload, Trash2, CheckSquare, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import StageColumn from '@/components/deals/StageColumn';
import DealCard from '@/components/deals/DealCard';
import DealFormDialog from '@/components/deals/DealFormDialog';
import ImportDialog from '@/components/ImportDialog';
import { useAuth } from '@/lib/AuthContext';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';

const DEAL_FIELDS = [
  { key: 'property_address', required: true }, { key: 'city' }, { key: 'state' }, { key: 'zip' },
  { key: 'stage' }, { key: 'deal_type' }, { key: 'asking_price', type: 'number' },
  { key: 'offer_price', type: 'number' }, { key: 'arv', type: 'number' },
  { key: 'repair_estimate', type: 'number' }, { key: 'assignment_fee', type: 'number' },
  { key: 'seller_name' }, { key: 'seller_phone' }, { key: 'seller_email' },
  { key: 'buyer_name' }, { key: 'buyer_phone' }, { key: 'buyer_email' },
  { key: 'lead_source' }, { key: 'notes' },
];
const DEAL_SAMPLE = {
  property_address: '123 Main St', city: 'Miami', state: 'FL', zip: '33101',
  stage: 'lead', deal_type: 'assignment', asking_price: 200000,
  offer_price: 150000, arv: 280000, repair_estimate: 30000, assignment_fee: 10000,
  seller_name: 'Jane Doe', seller_phone: '555-5678', seller_email: 'jane@example.com',
  buyer_name: '', buyer_phone: '', buyer_email: '', lead_source: 'cold_calling', notes: '',
};

const stages = ['lead', 'contacted', 'under_contract', 'assigned', 'closed', 'dead'];

export default function Deals() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [view, setView] = useState('board');
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [dealTypeFilter, setDealTypeFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const queryClient = useQueryClient();

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['deals', user?.id],
    queryFn: () => base44.entities.Deal.filter({ created_by_id: user.id }, '-updated_date'),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Deal.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setShowForm(false);
    },
  });

  const stageMutation = useMutation({
    mutationFn: ({ id, stage }) => base44.entities.Deal.update(id, { stage }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deals'] }),
  });

  const bulkStageMutation = useMutation({
    mutationFn: async ({ ids, stage }) => {
      await Promise.all([...ids].map(id => base44.entities.Deal.update(id, { stage })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setSelectedIds(new Set());
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => {
      await Promise.all([...ids].map(id => base44.entities.Deal.delete(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setSelectedIds(new Set());
    },
  });

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(d => d.id)));
    }
  };

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;
    stageMutation.mutate({ id: draggableId, stage: destination.droppableId });
  };

  const cities = [...new Set(deals.map(d => d.city).filter(Boolean))].sort();

  const exportCSV = () => {
    const cols = ['property_address','city','state','zip','stage','deal_type','asking_price','offer_price','arv','repair_estimate','assignment_fee','seller_name','seller_phone','seller_email','buyer_name','buyer_phone','buyer_email','lead_source','notes'];
    const rows = [cols.join(','), ...filtered.map(d => cols.map(c => JSON.stringify(d[c] ?? '')).join(','))];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `deals-export-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const filtered = deals.filter(d => {
    const matchSearch = !search || d.property_address?.toLowerCase().includes(search.toLowerCase()) ||
      d.city?.toLowerCase().includes(search.toLowerCase()) ||
      d.seller_name?.toLowerCase().includes(search.toLowerCase());
    const matchStage = stageFilter === 'all' || d.stage === stageFilter;
    const matchType = dealTypeFilter === 'all' || d.deal_type === dealTypeFilter;
    const matchCity = cityFilter === 'all' || d.city === cityFilter;
    return matchSearch && matchStage && matchType && matchCity;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Deals</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{deals.length} total deal{deals.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={exportCSV}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setShowImport(true)}>
            <Upload className="w-4 h-4" /> Import
          </Button>
          <Button className="gap-2" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" /> New Deal
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search deals..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="under_contract">Under Contract</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="dead">Dead</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dealTypeFilter} onValueChange={setDealTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="assignment">Assignment</SelectItem>
            <SelectItem value="double_close">Double Close</SelectItem>
            <SelectItem value="novation">Novation</SelectItem>
          </SelectContent>
        </Select>
        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map(city => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex border rounded-lg overflow-hidden">
          <button
            onClick={() => setView('board')}
            className={`p-2 ${view === 'board' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground'} transition-colors`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 ${view === 'list' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground'} transition-colors`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Board view */}
      {view === 'board' ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6">
            {stages.filter(s => stageFilter === 'all' || s === stageFilter).map(stage => (
              <StageColumn
                key={stage}
                stage={stage}
                deals={filtered.filter(d => d.stage === stage)}
              />
            ))}
          </div>
        </DragDropContext>
      ) : (
        <div className="space-y-3">
          {/* Bulk action bar */}
          {filtered.length > 0 && (
            <div className="flex items-center gap-3 py-2 px-1">
              <Checkbox
                checked={selectedIds.size === filtered.length && filtered.length > 0}
                onCheckedChange={toggleSelectAll}
                id="select-all"
              />
              <label htmlFor="select-all" className="text-sm text-muted-foreground cursor-pointer select-none">
                {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
              </label>
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2 ml-2">
                  <Select onValueChange={(stage) => bulkStageMutation.mutate({ ids: selectedIds, stage })}>
                    <SelectTrigger className="h-8 w-44 text-xs">
                      <SelectValue placeholder="Change stage…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="under_contract">Under Contract</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="dead">Dead</SelectItem>
                    </SelectContent>
                  </Select>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 text-destructive hover:text-destructive gap-1.5">
                        <Trash2 className="w-3.5 h-3.5" /> Delete ({selectedIds.size})
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedIds.size} deal{selectedIds.size !== 1 ? 's' : ''}?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently remove the selected deals and cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => bulkDeleteMutation.mutate(selectedIds)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(deal => (
              <DealCard
                key={deal.id}
                deal={deal}
                selectable
                selected={selectedIds.has(deal.id)}
                onSelect={toggleSelect}
              />
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-full text-center py-12">
                No deals found. Create your first deal to get started!
              </p>
            )}
          </div>
        </div>
      )}

      <ImportDialog
        open={showImport}
        onOpenChange={setShowImport}
        entityName="Deal"
        fields={DEAL_FIELDS}
        sampleRow={DEAL_SAMPLE}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['deals'] })}
      />

      <DealFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        onSave={data => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}