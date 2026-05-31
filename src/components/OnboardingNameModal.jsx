import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { HandCoins } from 'lucide-react';

export default function OnboardingNameModal({ user, onComplete }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName.trim()) return;
    setLoading(true);

    const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ');
    await base44.auth.updateMe({ full_name: fullName });

    // Send welcome email
    await base44.integrations.Core.SendEmail({
      to: user.email,
      from_name: 'FlipFlow CRM',
      subject: `Welcome to FlipFlow, ${firstName.trim()}! 🏠`,
      body: `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#1e3a5f 0%,#2d5282 100%);padding:32px 40px;text-align:center;">
<table cellpadding="0" cellspacing="0" align="center"><tr>
<td style="background:rgba(255,255,255,0.15);border-radius:10px;padding:10px 14px;">
<span style="font-size:22px;font-weight:800;color:#f6ad55;">&#127968; FlipFlow</span>
</td></tr></table>
<p style="margin:12px 0 0;color:rgba(255,255,255,0.7);font-size:11px;letter-spacing:2px;text-transform:uppercase;">Wholesale CRM</p>
</td></tr>
<tr><td style="padding:40px 40px 32px;">
<p style="margin:0 0 8px;font-size:13px;color:#64748b;font-weight:500;">Hi ${firstName.trim()},</p>
<h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#1e3a5f;line-height:1.3;">Welcome to FlipFlow! 🎉</h1>
<p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.7;">You've got <strong>7 days free</strong> to explore everything — no credit card needed. Here's what to do first:</p>
<table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:14px;">
<tr><td style="background:#f0f7ff;border-left:4px solid #3b82f6;border-radius:0 8px 8px 0;padding:14px 16px;">
<p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#1e3a5f;">1️⃣ Add your first deal</p>
<p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">Head to <strong>Deals</strong> and click <strong>"+ Add Deal"</strong> to start building your pipeline.</p>
</td></tr></table>
<table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:14px;">
<tr><td style="background:#f0f7ff;border-left:4px solid #3b82f6;border-radius:0 8px 8px 0;padding:14px 16px;">
<p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#1e3a5f;">2️⃣ Run your numbers</p>
<p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">Use the <strong>MAO Calculator</strong> to instantly know your max offer on any property.</p>
</td></tr></table>
<table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;">
<tr><td style="background:#f0f7ff;border-left:4px solid #3b82f6;border-radius:0 8px 8px 0;padding:14px 16px;">
<p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#1e3a5f;">3️⃣ Build your buyer list</p>
<p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">Add cash buyers in <strong>Contacts</strong> so you're ready to assign the second you're under contract.</p>
</td></tr></table>
<div style="text-align:center;margin-top:8px;">
<a href="https://flipflowcrm.base44.app/" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#c97a1a,#f6ad55);color:#1e3a5f;font-weight:700;font-size:14px;border-radius:8px;text-decoration:none;">Open FlipFlow →</a>
</div>
<p style="margin:28px 0 0;font-size:13px;color:#64748b;">Rooting for your first deal,<br><strong style="color:#1e3a5f;">The FlipFlow Team</strong></p>
</td></tr>
<tr><td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center;">
<p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#1e3a5f;">&#127968; FlipFlow Wholesale CRM</p>
<p style="margin:0;font-size:11px;color:#94a3b8;">You're receiving this because you signed up for a free trial.</p>
</td></tr>
</table></td></tr></table>
</body></html>`,
    }).catch(() => {}); // don't block on email failure

    onComplete(fullName);
    setLoading(false);
  };

  return (
    <Dialog open>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <HandCoins className="w-4 h-4 text-amber-500" />
            </div>
            <span className="font-bold text-amber-600 text-sm">Welcome to FlipFlow!</span>
          </div>
          <DialogTitle className="text-xl">What's your name?</DialogTitle>
          <DialogDescription>
            We'll use this to personalize your experience and emails.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                placeholder="e.g. Marcus"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="e.g. Johnson"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading || !firstName.trim()}>
            {loading ? 'Getting started...' : "Let's go →"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}