import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Shield, Users, Loader2, Mail, Crown, Search, Ban, CheckCircle } from 'lucide-react';
import DispoQueue from '@/components/admin/DispoQueue';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import UserDetailDrawer from '@/components/admin/UserDetailDrawer';

const ADMIN_EMAIL = 'timathyesmond@gmail.com';

export default function Admin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(user => {
      setCurrentUser(user);
      if (user?.email !== ADMIN_EMAIL) navigate('/');
      setChecking(false);
    }).catch(() => navigate('/'));
  }, []);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list(),
    enabled: !!currentUser && currentUser.email === ADMIN_EMAIL,
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['admin-deals'],
    queryFn: () => base44.entities.Deal.list(),
    enabled: !!currentUser && currentUser.email === ADMIN_EMAIL,
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['admin-contacts'],
    queryFn: () => base44.entities.Contact.list(),
    enabled: !!currentUser && currentUser.email === ADMIN_EMAIL,
  });

  if (checking || isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!currentUser || currentUser.email !== ADMIN_EMAIL) return null;

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return !q || u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  const bannedCount = users.filter(u => u.is_banned).length;

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-500' },
    { label: 'Total Deals', value: deals.length, icon: Shield, color: 'text-emerald-500' },
    { label: 'Total Contacts', value: contacts.length, icon: Mail, color: 'text-amber-500' },
    { label: 'Banned', value: bannedCount, icon: Ban, color: 'text-red-500' },
  ];

  const selectedUser = users.find(u => u.id === selectedUserId) || null;

  const openUser = (user) => {
    setSelectedUserId(user.id);
    setDrawerOpen(true);
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Super admin access — {ADMIN_EMAIL}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <s.icon className={cn("w-5 h-5", s.color)} />
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search users by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Users list */}
      <div className="space-y-2">
        {filtered.map(user => {
          const isBanned = user.is_banned === true;
          const userDeals = deals.filter(d => d.created_by === user.email);
          const userContacts = contacts.filter(c => c.created_by === user.email);

          return (
            <div
              key={user.id}
              onClick={() => openUser(user)}
              className={cn(
                "flex items-center justify-between px-4 py-3.5 rounded-xl border cursor-pointer transition-all hover:shadow-md",
                isBanned
                  ? "bg-red-50 border-red-200 hover:border-red-300"
                  : "bg-card border-border hover:border-primary/40"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
                  isBanned ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary"
                )}>
                  {user.full_name?.[0] || user.email?.[0] || '?'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold">{user.full_name || 'No Name'}</p>
                    {user.role === 'admin' && (
                      <Badge className="text-[10px] bg-purple-100 text-purple-700">👑 Admin</Badge>
                    )}
                    {isBanned && (
                      <Badge className="text-[10px] bg-red-100 text-red-700">🚫 Banned</Badge>
                    )}
                    {user.email === ADMIN_EMAIL && (
                      <Badge className="text-[10px] bg-amber-100 text-amber-700">⭐ You</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="hidden sm:flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" /> {userDeals.length} deals
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> {userContacts.length} contacts
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-primary"
                  onClick={e => { e.stopPropagation(); openUser(user); }}
                >
                  View Profile →
                </Button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No users found.</p>
          </div>
        )}
      </div>

      {/* Dispo Queue */}
      <div className="border-t pt-6">
        <DispoQueue />
      </div>

      {/* User detail drawer */}
      <UserDetailDrawer
        user={selectedUser}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onUserUpdated={() => {
          queryClient.invalidateQueries({ queryKey: ['admin-users'] });
          if (selectedUser) {
            queryClient.invalidateQueries({ queryKey: ['admin-user-deals', selectedUser.email] });
            queryClient.invalidateQueries({ queryKey: ['admin-user-contacts', selectedUser.email] });
          }
        }}
      />
    </div>
  );
}