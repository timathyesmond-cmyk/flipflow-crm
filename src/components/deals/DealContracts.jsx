import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Trash2, Link as LinkIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const contractLabels = {
  purchase_agreement: { label: 'Purchase Agreement', color: 'bg-blue-100 text-blue-700' },
  assignment_contract: { label: 'Assignment Contract', color: 'bg-purple-100 text-purple-700' },
  joint_venture: { label: 'Joint Venture', color: 'bg-emerald-100 text-emerald-700' },
};

export default function DealContracts({ dealId }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['contracts', dealId],
    queryFn: () => base44.entities.GeneratedContract.filter({ deal_id: dealId }, '-created_date'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.GeneratedContract.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contracts', dealId] }),
  });

  const contractTabMap = {
    purchase_agreement: 'purchase',
    assignment_contract: 'assignment',
    joint_venture: 'jv',
  };

  const handleGoToCalculator = (contractType) => {
    navigate(`/calculator?tab=contracts&sub=${contractTabMap[contractType]}`);
  };

  if (isLoading) return null;

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="w-4 h-4" /> Generated Contracts
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground gap-1.5"
          onClick={() => navigate('/calculator')}
        >
          <LinkIcon className="w-3 h-3" /> Open Calculator
        </Button>
      </CardHeader>
      <CardContent>
        {contracts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No contracts generated yet. Use the <button className="underline underline-offset-2 hover:text-foreground" onClick={() => navigate('/calculator')}>Deal Calculator</button> to create one.
          </p>
        ) : (
          <div className="space-y-2">
            {contracts.map((c) => {
              const config = contractLabels[c.contract_type] || { label: c.contract_type, color: 'bg-muted text-muted-foreground' };
              return (
                <div key={c.id} className="flex items-start justify-between gap-3 py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`text-xs ${config.color}`}>{config.label}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(c.created_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      {c.parties && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{c.parties}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-muted-foreground gap-1"
                      onClick={() => handleGoToCalculator(c.contract_type)}
                    >
                      Open
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteMutation.mutate(c.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}