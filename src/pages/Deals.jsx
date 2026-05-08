import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, LayoutGrid, List, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StageColumn from '@/components/deals/StageColumn';
import DealCard from '@/components/deals/DealCard';
import DealFormDialog from '@/components/deals/DealFormDialog';

const stages = ['lead', 'contacted', 'under_contract', 'assigned', 'closed', 'dead'];

export default function Deals() {
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState('board');
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: () => base44.entities.Deal.list('-updated_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Deal.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setShowForm(false);
    },
  });

  const filtered = deals.filter(d => {
    const matchSearch = !search || d.property_address?.toLowerCase().includes(search.toLowerCase()) ||
      d.city?.toLowerCase().includes(search.toLowerCase()) ||
      d.seller_name?.toLowerCase().includes(search.toLowerCase());
    const matchStage = stageFilter === 'all' || d.stage === stageFilter;
    return matchSearch && matchStage;
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
        <Button className="gap-2" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> New Deal
        </Button>
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
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6">
          {stages.filter(s => stageFilter === 'all' || s === stageFilter).map(stage => (
            <StageColumn
              key={stage}
              stage={stage}
              deals={filtered.filter(d => d.stage === stage)}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(deal => (
            <DealCard key={deal.id} deal={deal} />
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-full text-center py-12">
              No deals found. Create your first deal to get started!
            </p>
          )}
        </div>
      )}

      <DealFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        onSave={data => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}