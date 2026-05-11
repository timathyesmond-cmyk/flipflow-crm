import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Camera, Save, Loader2, Phone, Mail, Building2, Globe } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileSection() {
  const queryClient = useQueryClient();
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ phone: '', company: '', website: '', bio: '', profile_photo: '' });

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  useEffect(() => {
    if (user) {
      setForm({
        phone: user.phone || '',
        company: user.company || '',
        website: user.website || '',
        bio: user.bio || '',
        profile_photo: user.profile_photo || '',
      });
    }
  }, [user]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, profile_photo: file_url }));
    await base44.auth.updateMe({ profile_photo: file_url });
    queryClient.invalidateQueries({ queryKey: ['me'] });
    setUploading(false);
    toast.success('Photo updated!');
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({ phone: form.phone, company: form.company, website: form.website, bio: form.bio });
    queryClient.invalidateQueries({ queryKey: ['me'] });
    setSaving(false);
    toast.success('Profile saved!');
  };

  if (isLoading) return <div className="flex justify-center py-10"><span className="w-5 h-5 border-2 border-muted border-t-foreground rounded-full animate-spin" /></div>;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <User className="w-4 h-4" /> Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
              {form.profile_photo ? (
                <img src={form.profile_photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow hover:bg-primary/90 transition-colors"
            >
              {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>
          <div>
            <p className="font-semibold">{user?.full_name || '—'}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <button onClick={() => fileRef.current?.click()} className="text-xs text-primary hover:underline mt-0.5">Change photo</button>
          </div>
        </div>

        {/* Contact fields */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone</Label>
            <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 (555) 000-0000" />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</Label>
            <Input value={user?.email || ''} disabled className="opacity-60" />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> Company</Label>
            <Input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="e.g. Acme Investments LLC" />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Website</Label>
            <Input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://yourwebsite.com" />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}