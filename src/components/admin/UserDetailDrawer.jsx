import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Ban, CheckCircle, Crown, MapPin, Phone, Mail, Gift, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
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

export default function UserDetailDrawer({ user, open, onOpenChange, onUserUpdated }) {
  const queryClient = useQueryClient();
  const [banReason, setBanReason] = useState('');
  const [giftNote, setGiftNote] = useState('');

  const { data: deals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ['admin-user-deals', user?.email],
    queryFn: () => base44.entities.Deal.filter({ created_by: user.email }),
    enabled: open && !!user,
  });

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
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" /> Deals ({deals.length})
          </h3>
          {dealsLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : deals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No deals yet.</p>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {deals.map(deal => (
                <div key={deal.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40 text-sm">
                  <div>
                    <p className="font-medium text-xs">{deal.property_address}</p>
                    <p className="text-xs text-muted-foreground">{deal.city}{deal.state ? `, ${deal.state}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {deal.assignment_fee > 0 && (
                      <span className="text-xs text-emerald-600 font-medium">${deal.assignment_fee.toLocaleString()}</span>
                    )}
                    <Badge className={cn("text-[10px]", stageColors[deal.stage])}>{deal.stage}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contacts */}
        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" /> Contacts ({contacts.length})
          </h3>
          {contactsLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No contacts yet.</p>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {contacts.map(c => (
                <div key={c.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40 text-sm">
                  <div>
                    <p className="font-medium text-xs">{c.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{c.type}</p>
                  </div>
                  {c.phone && (
                    <a href={`tel:${c.phone}`} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {c.phone}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}