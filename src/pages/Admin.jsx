import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Users, Trash2, Loader2, Mail, Crown, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ADMIN_EMAIL = 'timathyesmond@gmail.com';

export default function Admin() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(user => {
      setCurrentUser(user);
      if (user?.email !== ADMIN_EMAIL) {
        navigate('/');
      }
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

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }) => base44.entities.User.update(id, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User role updated');
    },
  });

  if (checking || isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!currentUser || currentUser.email !== ADMIN_EMAIL) return null;

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-500' },
    { label: 'Total Deals', value: deals.length, icon: Shield, color: 'text-emerald-500' },
    { label: 'Total Contacts', value: contacts.length, icon: Mail, color: 'text-amber-500' },
    { label: 'Admins', value: users.filter(u => u.role === 'admin').length, icon: Crown, color: 'text-purple-500' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Restricted access — {ADMIN_EMAIL}</p>
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

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="w-4 h-4" /> All Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {user.full_name?.[0] || user.email?.[0] || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user.full_name || '—'}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                    {user.role || 'user'}
                  </Badge>
                  {user.email !== ADMIN_EMAIL && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => updateRoleMutation.mutate({
                        id: user.id,
                        role: user.role === 'admin' ? 'user' : 'admin'
                      })}
                    >
                      {user.role === 'admin' ? <Ban className="w-3 h-3 mr-1" /> : <Crown className="w-3 h-3 mr-1" />}
                      {user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                    </Button>
                  )}
                  {user.email === ADMIN_EMAIL && (
                    <span className="text-xs text-muted-foreground italic">You</span>
                  )}
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No users found.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}