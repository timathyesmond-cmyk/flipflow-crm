import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft, Pencil, Trash2, MapPin, DollarSign, User, Phone, Mail,
  Calendar, Home, Ruler, BedDouble, Bath, Loader2, AlertTriangle, Bell, FileDown
} from 'lucide-react';
import { generateDealPDF } from '@/utils/generateDealPDF';
import { toast } from 'sonner';
import { addDays, format } from 'date-fns';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import DealFormDialog from '@/components/deals/DealFormDialog';
import ActivityFeed from '@/components/deals/ActivityFeed';
import DealTimeline from '@/components/deals/DealTimeline';
import FollowUpEmailDialog from '@/components/deals/FollowUpEmailDialog';
import TaskReminderCard from '@/components/deals/TaskReminderCard';

const stageConfig = {
  lead: { label: 'Lead', color: 'bg-muted text-muted-foreground' },
  contacted: { label: 'Contacted', color: 'bg-primary/10 text-primary' },
  under_contract: { label: 'Under Contract', color: 'bg-amber-100 text-amber-700' },
  assigned: { label: 'Assigned', color: 'bg-blue-100 text-blue-700' },
  closed: { label: 'Closed', color: 'bg-emerald-100 text-emerald-700' },
  dead: { label: 'Dead', color: 'bg-red-100 text-red-600' },
};

const dealTypeLabels = { assignment: 'Assignment', double_close: 'Double Close', novation: 'Novation' };
const sourceLabels = {
  driving_for_dollars: 'Driving for Dollars', direct_mail: 'Direct Mail', cold_calling: 'Cold Calling',
  referral: 'Referral', mls: 'MLS', auction: 'Auction', online_marketing: 'Online Marketing', other: 'Other'
};
const propTypeLabels = {
  single_family: 'Single Family', multi_family: 'Multi Family', townhouse: 'Townhouse',
  condo: 'Condo', land: 'Land', commercial: 'Commercial', other: 'Other'
};

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function FinancialItem({ label, value, highlight }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-semibold", highlight && "text-emerald-600")}>
        ${value.toLocaleString()}
      </span>
    </div>
  );
}

export default function DealDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showEdit, setShowEdit] = useState(false);
  const [emailTarget, setEmailTarget] = useState(null); // { name, email, type }

  const { data: deal, isLoading } = useQuery({
    queryKey: ['deal', id],
    queryFn: async () => {
      const deals = await base44.entities.Deal.filter({ id });
      return deals[0];
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Deal.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deal', id] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      if (showEdit) {
        base44.entities.Activity.create({
          deal_id: id,
          type: 'other',
          description: 'Deal details were updated',
        }).then(() => queryClient.invalidateQueries({ queryKey: ['activities', id] }));
      }
      setShowEdit(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Deal.delete(id),
    onSuccess: () => navigate('/deals'),
  });

  const handleStageChange = (newStage) => {
    const updates = { stage: newStage };

    if (newStage === 'under_contract') {
      const followUpDate = format(addDays(new Date(), 3), 'yyyy-MM-dd');
      updates.follow_up_date = followUpDate;
      toast.success(`Follow-up reminder set for ${format(addDays(new Date(), 3), 'MMM d, yyyy')}`, {
        description: 'You\'ll see the reminder on this deal.',
        icon: '🔔',
      });
    }

    updateMutation.mutate(updates);
    base44.entities.Activity.create({
      deal_id: id,
      type: 'stage_change',
      description: `Stage changed to ${stageConfig[newStage]?.label || newStage}`
        + (newStage === 'under_contract' ? ` — follow-up reminder set for ${format(addDays(new Date(), 3), 'MMM d, yyyy')}` : '')
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertTriangle className="w-10 h-10 text-muted-foreground" />
        <p className="text-muted-foreground">Deal not found</p>
        <Link to="/deals"><Button variant="outline">Back to Deals</Button></Link>
      </div>
    );
  }

  const stage = stageConfig[deal.stage] || stageConfig.lead;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link to="/deals">
            <Button variant="ghost" size="icon" className="mt-0.5">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight">{deal.property_address}</h1>
              <Badge className={cn("text-xs", stage.color)}>{stage.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {deal.city}{deal.state ? `, ${deal.state}` : ''} {deal.zip || ''}
            </p>
          </div>
        </div>
        <div className="flex gap-2 ml-10 sm:ml-0">
          <Select value={deal.stage} onValueChange={handleStageChange}>
            <SelectTrigger className="w-40 h-9 text-xs">
              <SelectValue placeholder="Change stage" />
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
          <Button variant="outline" size="sm" onClick={() => generateDealPDF(deal)}>
            <FileDown className="w-3.5 h-3.5 mr-1" /> PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
            <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this deal?</AlertDialogTitle>
                <AlertDialogDescription>This will permanently remove this deal and all its data.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteMutation.mutate()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Follow-up reminder banner */}
      {deal.follow_up_date && (
        <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Follow-up Reminder</p>
              <p className="text-xs text-amber-700">
                {new Date(deal.follow_up_date) < new Date()
                  ? `Overdue — was scheduled for ${format(new Date(deal.follow_up_date), 'MMM d, yyyy')}`
                  : `Due ${format(new Date(deal.follow_up_date), 'EEEE, MMM d, yyyy')}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => updateMutation.mutate({ follow_up_date: null })}
            className="text-xs text-amber-600 hover:text-amber-800 font-medium underline underline-offset-2 flex-shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Content grid */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Property Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <InfoRow icon={Home} label="Type" value={propTypeLabels[deal.property_type]} />
              <InfoRow icon={BedDouble} label="Beds" value={deal.bedrooms} />
              <InfoRow icon={Bath} label="Baths" value={deal.bathrooms} />
              <InfoRow icon={Ruler} label="Sqft" value={deal.sqft?.toLocaleString()} />
              <InfoRow icon={MapPin} label="Source" value={sourceLabels[deal.lead_source]} />
              <InfoRow icon={Calendar} label="Deal Type" value={dealTypeLabels[deal.deal_type]} />
              {deal.contract_date && <InfoRow icon={Calendar} label="Contract" value={format(new Date(deal.contract_date), 'MMM d, yyyy')} />}
              {deal.closing_date && <InfoRow icon={Calendar} label="Closing" value={format(new Date(deal.closing_date), 'MMM d, yyyy')} />}
              {deal.follow_up_date && <InfoRow icon={Bell} label="Follow-up" value={format(new Date(deal.follow_up_date), 'MMM d, yyyy')} />}
            </CardContent>
          </Card>

          {/* Contacts */}
          <div className="grid sm:grid-cols-2 gap-4">
            {(deal.seller_name || deal.seller_phone || deal.seller_email) && (
              <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm">Seller</CardTitle>
                  {deal.seller_email && (
                    <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setEmailTarget({ name: deal.seller_name, email: deal.seller_email, type: 'Seller' })}>
                      <Mail className="w-3.5 h-3.5" /> Email
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-2">
                  <InfoRow icon={User} label="Name" value={deal.seller_name} />
                  <InfoRow icon={Phone} label="Phone" value={deal.seller_phone} />
                  <InfoRow icon={Mail} label="Email" value={deal.seller_email} />
                </CardContent>
              </Card>
            )}
            {(deal.buyer_name || deal.buyer_phone || deal.buyer_email) && (
              <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm">Buyer</CardTitle>
                  {deal.buyer_email && (
                    <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setEmailTarget({ name: deal.buyer_name, email: deal.buyer_email, type: 'Buyer' })}>
                      <Mail className="w-3.5 h-3.5" /> Email
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-2">
                  <InfoRow icon={User} label="Name" value={deal.buyer_name} />
                  <InfoRow icon={Phone} label="Phone" value={deal.buyer_phone} />
                  <InfoRow icon={Mail} label="Email" value={deal.buyer_email} />
                </CardContent>
              </Card>
            )}
          </div>

          {deal.notes && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm">Notes</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{deal.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Financials */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Financials</CardTitle>
            </CardHeader>
            <CardContent>
              <FinancialItem label="Asking Price" value={deal.asking_price} />
              <FinancialItem label="Offer Price" value={deal.offer_price} />
              <FinancialItem label="ARV" value={deal.arv} />
              <FinancialItem label="Repair Estimate" value={deal.repair_estimate} />
              <FinancialItem label="Buyer Price" value={deal.buyer_price} />
              <FinancialItem label="Assignment Fee" value={deal.assignment_fee} highlight />
              {!deal.asking_price && !deal.offer_price && !deal.arv && !deal.assignment_fee && (
                <p className="text-sm text-muted-foreground text-center py-4">No financial data yet</p>
              )}
              {deal.arv > 0 && deal.offer_price > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-foreground">Est. Profit</span>
                    <span className={cn(
                      "text-sm font-bold",
                      (deal.arv - deal.offer_price) >= 0 ? "text-emerald-600" : "text-destructive"
                    )}>
                      {(deal.arv - deal.offer_price) >= 0 ? '+' : ''}
                      ${(deal.arv - deal.offer_price).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">ARV − Offer price</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Task Reminder */}
          <TaskReminderCard
            deal={deal}
            onSave={(data) => {
              updateMutation.mutate(data);
              if (data.follow_up_date) {
                base44.entities.Activity.create({
                  deal_id: id,
                  type: 'other',
                  description: `Follow-up reminder set for ${format(new Date(data.follow_up_date), 'MMM d, yyyy')}${data.follow_up_note ? ` — "${data.follow_up_note}"` : ''}`,
                }).then(() => queryClient.invalidateQueries({ queryKey: ['activities', id] }));
              }
            }}
            isSaving={updateMutation.isPending}
          />

          {/* Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFeed dealId={id} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Timeline */}
      <div className="border border-border rounded-2xl p-5">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-secondary inline-block" />
          Deal History
        </h2>
        <DealTimeline dealId={id} />
      </div>

      <DealFormDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        deal={deal}
        onSave={data => updateMutation.mutate(data)}
        isLoading={updateMutation.isPending}
      />

      {emailTarget && (
        <FollowUpEmailDialog
          open={!!emailTarget}
          onOpenChange={(open) => { if (!open) setEmailTarget(null); }}
          deal={deal}
          contactName={emailTarget.name}
          contactEmail={emailTarget.email}
          contactType={emailTarget.type}
        />
      )}
    </div>
  );
}