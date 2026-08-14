import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Plus, Lightbulb, ThumbsUp, Loader2, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import SuggestionFormDialog from '@/components/suggestions/SuggestionFormDialog';

const categoryLabels = {
  feature: 'New Feature',
  improvement: 'Improvement',
  bug_fix: 'Bug Fix',
  ui_ux: 'UI / UX',
  other: 'Other',
};

const categoryColors = {
  feature: 'bg-blue-100 text-blue-700',
  improvement: 'bg-purple-100 text-purple-700',
  bug_fix: 'bg-red-100 text-red-700',
  ui_ux: 'bg-amber-100 text-amber-700',
  other: 'bg-muted text-muted-foreground',
};

const statusColors = {
  pending: 'bg-slate-100 text-slate-600',
  under_review: 'bg-blue-100 text-blue-700',
  planned: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  declined: 'bg-red-100 text-red-600',
};

const statusLabels = {
  pending: 'Pending',
  under_review: 'Under Review',
  planned: 'Planned',
  completed: 'Completed',
  declined: 'Declined',
};

export default function Suggestions() {
  const [showForm, setShowForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['suggestions'],
    queryFn: () => base44.entities.Suggestion.list('-upvotes'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Suggestion.create({
      ...data,
      upvotes: 0,
      upvoted_by: [],
      submitter_name: user?.full_name || '',
      submitter_email: user?.email || '',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
      setShowForm(false);
    },
  });

  const upvoteMutation = useMutation({
    mutationFn: ({ suggestion }) => {
      const email = user?.email || 'anonymous';
      const alreadyVoted = suggestion.upvoted_by?.includes(email);
      const newUpvotedBy = alreadyVoted
        ? suggestion.upvoted_by.filter(e => e !== email)
        : [...(suggestion.upvoted_by || []), email];
      return base44.entities.Suggestion.update(suggestion.id, {
        upvotes: newUpvotedBy.length,
        upvoted_by: newUpvotedBy,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suggestions'] }),
  });

  const filtered = categoryFilter === 'all'
    ? suggestions
    : suggestions.filter(s => s.category === categoryFilter);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-amber-500" /> Suggestions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Vote on ideas or submit your own to help shape the future of FlipFlow.
          </p>
        </div>
        <Button className="gap-2 self-start sm:self-auto" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> Submit Idea
        </Button>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'feature', 'improvement', 'bug_fix', 'ui_ux', 'other'].map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={cn(
              'text-xs px-3 py-1.5 rounded-full border transition-colors font-medium',
              categoryFilter === cat
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
            )}
          >
            {cat === 'all' ? 'All' : categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Suggestions list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Lightbulb className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No suggestions yet. Be the first to submit an idea!</p>
          </div>
        ) : (
          filtered.map(suggestion => {
            const hasVoted = suggestion.upvoted_by?.includes(user?.email || '');
            return (
              <div
                key={suggestion.id}
                className="bg-card border border-border/60 rounded-xl p-4 flex gap-4 hover:shadow-sm transition-shadow"
              >
                {/* Upvote */}
                <button
                  onClick={() => upvoteMutation.mutate({ suggestion })}
                  className={cn(
                    'flex flex-col items-center gap-0.5 min-w-[44px] px-2 py-2 rounded-lg border transition-all',
                    hasVoted
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : 'bg-muted/40 border-border text-muted-foreground hover:border-primary/40 hover:text-primary'
                  )}
                >
                  <ChevronUp className="w-4 h-4" />
                  <span className="text-xs font-bold">{suggestion.upvotes || 0}</span>
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="text-sm font-semibold">{suggestion.title}</p>
                    <Badge className={cn('text-[10px]', categoryColors[suggestion.category])}>
                      {categoryLabels[suggestion.category] || suggestion.category}
                    </Badge>
                    <Badge className={cn('text-[10px]', statusColors[suggestion.status])}>
                      {statusLabels[suggestion.status] || suggestion.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{suggestion.description}</p>
                  {suggestion.submitter_name && (
                    <p className="text-[10px] text-muted-foreground mt-2 opacity-60">
                      Submitted by {suggestion.submitter_name}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <SuggestionFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        onSave={data => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}