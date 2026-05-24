import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Ban, CheckCircle, Crown, MapPin, Phone, Mail, Gift, X, ExternalLink, ChevronDown, ChevronUp, Building2, DollarSign, Calendar, FileText, User, Zap, Star, Send, Shield } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const ADMIN_EMAIL = 'timathyesmond@gmail.com';

const stageColors = {
  lead: 'bg-muted text-muted-foreground',
  contacted: 'bg-blue-100 text-blue-700',
  under_contract: 'bg-amber-100 text-amber-700',
  assigned: 'bg-purple-100 text-purple-700',
  closed: 'bg-emerald-100 text-emerald-700',
  dead: 'bg-red-100 text-red-600',
};

function DealRow({ deal }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-lg border border-border bg-muted/30 overflow-hidden">
      <div
        className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-muted/60 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex-1 min-w-0">
          <p className="font-medium text-xs truncate">{deal.property_address}</p>
          <p className="text-[11px] text-muted-foreground">{deal.city}{deal.state ? `, ${deal.state}` : ''}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {deal.assignment_fee > 0 && (
            <span className="text-xs text-emerald-600 font-semibold">${deal.assignment_fee.toLocaleString()}</span>
          )}
          <Badge className={cn("text-[10px] capitalize", stageColors[deal.stage])}>{deal.stage?.replace('_', ' ')}</Badge>
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-border/50 space-y-3 text-xs">
          {/* Financials */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Asking Price', value: deal.asking_price },
              { label: 'Offer Price', value: deal.offer_price },
              { label: 'ARV', value: deal.arv },
              { label: 'Repair Est.', value: deal.repair_estimate },
              { label: 'Buyer Price', value: deal.buyer_price },
              { label: 'Assignment Fee', value: deal.assignment_fee },
            ].map(f => f.value > 0 && (
              <div key={f.label} className="bg-card rounded p-2">
                <p className="text-[10px] text-muted-foreground">{f.label}</p>
                <p className="font-semibold text-emerald-700">${f.value.toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Property details */}
          <div className="flex flex-wrap gap-2">
            {deal.property_type && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] capitalize">{deal.property_type.replace('_', ' ')}</span>}
            {deal.deal_type && <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[10px] capitalize">{deal.deal_type.replace('_', ' ')}</span>}
            {deal.bedrooms && <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-[10px]">{deal.bedrooms} bed</span>}
            {deal.bathrooms && <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-[10px]">{deal.bathrooms} bath</span>}
            {deal.sqft && <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-[10px]">{deal.sqft.toLocaleString()} sqft</span>}
          </div>

          {/* Seller & Buyer */}
          {(deal.seller_name || deal.seller_phone || deal.seller_email) && (
            <div className="bg-amber-50 rounded p-2 space-y-0.5">
              <p className="text-[10px] font-semibold text-amber-700 mb-1">Seller</p>
              {deal.seller_name && <p className="font-medium">{deal.seller_name}</p>}
              {deal.seller_phone && <a href={`tel:${deal.seller_phone}`} className="text-muted-foreground hover:text-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{deal.seller_phone}</a>}
              {deal.seller_email && <a href={`mailto:${deal.seller_email}`} className="text-muted-foreground hover:text-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{deal.seller_email}</a>}
            </div>
          )}
          {(deal.buyer_name || deal.buyer_phone || deal.buyer_email) && (
            <div className="bg-blue-50 rounded p-2 space-y-0.5">
              <p className="text-[10px] font-semibold text-blue-700 mb-1">Buyer</p>
              {deal.buyer_name && <p className="font-medium">{deal.buyer_name}</p>}
              {deal.buyer_phone && <a href={`tel:${deal.buyer_phone}`} className="text-muted-foreground hover:text-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{deal.buyer_phone}</a>}
              {deal.buyer_email && <a href={`mailto:${deal.buyer_email}`} className="text-muted-foreground hover:text-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{deal.buyer_email}</a>}
            </div>
          )}

          {/* Dates */}
          <div className="flex flex-wrap gap-2">
            {deal.contract_date && <span className="text-[10px] text-muted-foreground">📄 Contract: {new Date(deal.contract_date).toLocaleDateString()}</span>}
            {deal.closing_date && <span className="text-[10px] text-muted-foreground">🔑 Closing: {new Date(deal.closing_date).toLocaleDateString()}</span>}
            {deal.follow_up_date && <span className="text-[10px] text-amber-600">🔔 Follow-up: {new Date(deal.follow_up_date).toLocaleDateString()}</span>}
          </div>

          {/* Notes */}
          {deal.notes && (
            <div className="bg-muted/50 rounded p-2">
              <p className="text-[10px] text-muted-foreground mb-0.5">Notes</p>
              <p className="text-xs">{deal.notes}</p>
            </div>
          )}

          <Link
            to={`/deals/${deal.id}`}
            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
          >
            <ExternalLink className="w-3 h-3" /> Open Full Deal
          </Link>
        </div>
      )}
    </div>
  );
}

function ContactRow({ contact }) {
  const [expanded, setExpanded] = useState(false);
  const typeColors = {
    buyer: 'bg-blue-100 text-blue-700',
    seller: 'bg-amber-100 text-amber-700',
    agent: 'bg-purple-100 text-purple-700',
    contractor: 'bg-emerald-100 text-emerald-700',
    other: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="rounded-lg border border-border bg-muted/30 overflow-hidden">
      <div
        className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-muted/60 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex-1 min-w-0">
          <p className="font-medium text-xs">{contact.name}</p>
          {contact.company && <p className="text-[11px] text-muted-foreground">{contact.company}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <Badge className={cn("text-[10px] capitalize", typeColors[contact.type])}>{contact.type}</Badge>
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-border/50 space-y-2 text-xs">
          {contact.phone && (
            <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <Phone className="w-3 h-3" /> {contact.phone}
            </a>
          )}
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <Mail className="w-3 h-3" /> {contact.email}
            </a>
          )}
          {contact.company && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="w-3 h-3" /> {contact.company}
            </div>
          )}
          {contact.notes && (
            <div className="bg-muted/50 rounded p-2 mt-1">
              <p className="text-[10px] text-muted-foreground mb-0.5">Notes</p>
              <p>{contact.notes}</p>
            </div>
          )}
          {contact.type === 'buyer' && (
            <>
              {contact.buyer_locations?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {contact.buyer_locations.map(l => <span key={l} className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">📍 {l}</span>)}
                </div>
              )}
              {contact.buyer_property_types?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {contact.buyer_property_types.map(t => <span key={t} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full capitalize">{t.replace('_', ' ')}</span>)}
                </div>
              )}
              <div className="flex flex-wrap gap-3 text-muted-foreground">
                {contact.buyer_max_price > 0 && <span>Max Price: <strong className="text-foreground">${contact.buyer_max_price.toLocaleString()}</strong></span>}
                {contact.buyer_min_beds > 0 && <span>Min Beds: <strong className="text-foreground">{contact.buyer_min_beds}</strong></span>}
                {contact.buyer_min_arv > 0 && <span>Min ARV: <strong className="text-foreground">${contact.buyer_min_arv.toLocaleString()}</strong></span>}
              </div>
              {contact.buyer_notes && <p className="text-muted-foreground italic">{contact.buyer_notes}</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
}

const TIER_LABELS = { basic: 'Basic ($14.99)', wholesale: 'Wholesale ($24.99)', pro: 'Pro ($49.99)' };
const TIER_ICONS = { basic: Zap, wholesale: Star, pro: Crown };

export default function UserDetailDrawer({ user, open, onOpenChange, onUserUpdated }) {
  const queryClient = useQueryClient();
  const [banReason, setBanReason] = useState('');
  const [giftNote, setGiftNote] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSending, setEmailSending] = useState(false);

  const { data: deals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ['admin-user-deals', user?.email],
    queryFn: () => base44.entities.Deal.filter({ created_by: user.email }),
    enabled: open && !!user,
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['admin-user-subscription', user?.email],
    queryFn: () => base44.entities.UserSubscription.filter({ user_email: user.email }),
    enabled: open && !!user,
  });
  const userSub = subscriptions[0] || null;

  const tierMutation = useMutation({
    mutationFn: async (tier) => {
      if (userSub) {
        if (tier === 'none') {
          return base44.entities.UserSubscription.update(userSub.id, { status: 'canceled' });
        }
        return base44.entities.UserSubscription.update(userSub.id, { tier, status: 'active' });
      } else if (tier !== 'none') {
        return base44.entities.UserSubscription.create({ user_email: user.email, tier, status: 'active', amount: tier === 'basic' ? 14.99 : tier === 'wholesale' ? 24.99 : 49.99 });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-subscription', user.email] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Subscription access updated');
      onUserUpdated?.();
    },
  });

  const sendEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) return;
    setEmailSending(true);
    try {
      await base44.integrations.Core.SendEmail({ to: user.email, subject: emailSubject, body: emailBody });
      toast.success('Email sent successfully');
      setEmailSubject('');
      setEmailBody('');
    } catch (e) {
      toast.error('Failed to send email');
    }
    setEmailSending(false);
  };

  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['admin-user-contacts', user?.email],
    queryFn: () => base44.entities.Contact.filter({ created_by: user.email }),
    enabled: open && !!user,
  });

  const banMutation = useMutation({
    mutationFn: ({ isBanned, reason }) =>
      base44.entities.User.update(user.id, {
        is_banned: isBanned,
        ban_reason: isBanned ? reason : '',
      }),
    onSuccess: (_, { isBanned }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(isBanned ? `${user.full_name || user.email} has been banned` : 'User has been unbanned');
      onUserUpdated?.();
      setBanReason('');
    },
  });

  const roleMutation = useMutation({
    mutationFn: (role) => base44.entities.User.update(user.id, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Role updated');
      onUserUpdated?.();
    },
  });

  const giftMutation = useMutation({
    mutationFn: ({ gift, note }) =>
      base44.entities.User.update(user.id, {
        gifted_membership: gift,
        gifted_membership_note: gift ? note : '',
        gifted_membership_date: gift ? format(new Date(), 'yyyy-MM-dd') : '',
      }),
    onSuccess: (_, { gift }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(gift ? '🎁 Free membership gifted!' : 'Membership gift revoked');
      onUserUpdated?.();
      setGiftNote('');
    },
  });

  if (!user) return null;

  const isBanned = user.is_banned === true;
  const hasGiftedMembership = user.gifted_membership === true;
  const totalProfit = deals
    .filter(d => d.stage === 'closed' && d.assignment_fee)
    .reduce((sum, d) => sum + (d.assignment_fee || 0), 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold",
              isBanned ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary"
            )}>
              {user.full_name?.[0] || user.email?.[0] || '?'}
            </div>
            <div className="text-left">
              <p className="text-base font-semibold">{user.full_name || 'No Name'}</p>
              <p className="text-sm text-muted-foreground font-normal">{user.email}</p>
            </div>
          </SheetTitle>
        </SheetHeader>

        {/* Subscription tier badge */}
        {userSub && userSub.status === 'active' && (
          <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
            {(() => { const Icon = TIER_ICONS[userSub.tier] || Zap; return <Icon className="w-4 h-4 text-amber-600" />; })()}
            <span className="text-xs font-semibold text-amber-700">{TIER_LABELS[userSub.tier] || userSub.tier} — Active</span>
          </div>
        )}

        {/* Status badges */}
        <div className="flex flex-wrap gap-2 mb-5">
          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
            {user.role === 'admin' ? '👑 Admin' : '👤 User'}
          </Badge>
          {isBanned && <Badge className="bg-red-100 text-red-700">🚫 Banned</Badge>}
          {hasGiftedMembership && <Badge className="bg-emerald-100 text-emerald-700">🎁 Free Member</Badge>}
          {user.email === ADMIN_EMAIL && <Badge className="bg-purple-100 text-purple-700">⭐ Super Admin</Badge>}
          {user.created_date && (
            <Badge variant="outline" className="text-xs">
              Joined {new Date(user.created_date).toLocaleDateString()}
            </Badge>
          )}
        </div>

        {/* Gifted membership display */}
        {hasGiftedMembership && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-emerald-700 mb-0.5">🎁 Free Membership Active</p>
              {user.gifted_membership_date && (
                <p className="text-xs text-emerald-600">Gifted on {new Date(user.gifted_membership_date).toLocaleDateString()}</p>
              )}
              {user.gifted_membership_note && (
                <p className="text-xs text-emerald-600 mt-0.5 italic">"{user.gifted_membership_note}"</p>
              )}
            </div>
            <button
              onClick={() => giftMutation.mutate({ gift: false })}
              className="text-xs text-emerald-700 hover:text-red-600 flex items-center gap-1 flex-shrink-0"
              title="Revoke gift"
            >
              <X className="w-3.5 h-3.5" /> Revoke
            </button>
          </div>
        )}

        {/* Ban reason display */}
        {isBanned && user.ban_reason && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-xs font-semibold text-red-700 mb-1">Ban Reason</p>
            <p className="text-sm text-red-600">{user.ban_reason}</p>
          </div>
        )}

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-muted/40 rounded-lg p-3 text-center">
            <p className="text-xl font-bold">{deals.length}</p>
            <p className="text-xs text-muted-foreground">Deals</p>
          </div>
          <div className="bg-muted/40 rounded-lg p-3 text-center">
            <p className="text-xl font-bold">{contacts.length}</p>
            <p className="text-xs text-muted-foreground">Contacts</p>
          </div>
          <div className="bg-muted/40 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-emerald-600">
              {totalProfit > 0 ? `$${(totalProfit / 1000).toFixed(0)}k` : '$0'}
            </p>
            <p className="text-xs text-muted-foreground">Closed Fees</p>
          </div>
        </div>

        {/* Change Access Tier */}
        {user.email !== ADMIN_EMAIL && (
          <div className="mb-5">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" /> Subscription Access
            </h3>
            <div className="flex items-center gap-2">
              <Select
                defaultValue={userSub?.status === 'active' ? userSub.tier : 'none'}
                key={`${userSub?.id}-${userSub?.tier}-${userSub?.status}`}
                onValueChange={(val) => tierMutation.mutate(val)}
                disabled={tierMutation.isPending}
              >
                <SelectTrigger className="w-48 h-8 text-xs">
                  <SelectValue placeholder="Set tier..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Access</SelectItem>
                  <SelectItem value="basic">Basic ($14.99/mo)</SelectItem>
                  <SelectItem value="wholesale">Wholesale ($24.99/mo)</SelectItem>
                  <SelectItem value="pro">Pro ($49.99/mo)</SelectItem>
                </SelectContent>
              </Select>
              {tierMutation.isPending && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            </div>
          </div>
        )}

        {/* Send Email */}
        <div className="mb-5">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" /> Email User
          </h3>
          <div className="space-y-2">
            <Input
              placeholder="Subject"
              value={emailSubject}
              onChange={e => setEmailSubject(e.target.value)}
              className="h-8 text-xs"
            />
            <Textarea
              placeholder="Write your message..."
              value={emailBody}
              onChange={e => setEmailBody(e.target.value)}
              rows={3}
            />
            <Button
              size="sm"
              className="gap-1.5 h-8"
              onClick={sendEmail}
              disabled={emailSending || !emailSubject.trim() || !emailBody.trim()}
            >
              {emailSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Send Email
            </Button>
          </div>
        </div>

        {/* Actions */}
        {user.email !== ADMIN_EMAIL && (
          <div className="flex flex-wrap gap-2 mb-6">
            {/* Role toggle */}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => roleMutation.mutate(user.role === 'admin' ? 'user' : 'admin')}
              disabled={roleMutation.isPending}
            >
              <Crown className="w-3.5 h-3.5" />
              {user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
            </Button>

            {/* Gift Membership */}
            {!hasGiftedMembership ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 text-emerald-600 border-emerald-300 hover:bg-emerald-50">
                    <Gift className="w-3.5 h-3.5" /> Gift Membership
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Gift free membership to {user.full_name || user.email}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will mark this user as having a gifted free membership. Add an optional note below.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="my-2 space-y-1.5">
                    <Label className="text-sm">Note (optional)</Label>
                    <Textarea
                      placeholder="e.g. Gifted for beta testing, referral reward..."
                      value={giftNote}
                      onChange={e => setGiftNote(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={() => giftMutation.mutate({ gift: true, note: giftNote })}
                    >
                      🎁 Gift Membership
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}

            {/* Ban / Unban */}
            {isBanned ? (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                onClick={() => banMutation.mutate({ isBanned: false })}
                disabled={banMutation.isPending}
              >
                <CheckCircle className="w-3.5 h-3.5" /> Unban User
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 text-red-600 border-red-300 hover:bg-red-50">
                    <Ban className="w-3.5 h-3.5" /> Ban User
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Ban {user.full_name || user.email}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This user will be flagged as banned. Provide a reason below.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="my-2 space-y-1.5">
                    <Label className="text-sm">Reason (optional)</Label>
                    <Textarea
                      placeholder="e.g. Violated terms of service..."
                      value={banReason}
                      onChange={e => setBanReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => banMutation.mutate({ isBanned: true, reason: banReason })}
                    >
                      Ban User
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}

        {/* Deals */}
        <div className="mb-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" /> Deals ({deals.length})
          </h3>
          {dealsLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : deals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No deals yet.</p>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {deals.map(deal => (
                <DealRow key={deal.id} deal={deal} />
              ))}
            </div>
          )}
        </div>

        {/* Contacts */}
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" /> Contacts ({contacts.length})
          </h3>
          {contactsLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No contacts yet.</p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {contacts.map(c => (
                <ContactRow key={c.id} contact={c} />
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}