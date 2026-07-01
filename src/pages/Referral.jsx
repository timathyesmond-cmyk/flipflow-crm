import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Gift, Users, Trophy, Share2, Twitter, Mail, MessageSquare, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { APP_URL } from '@/lib/utils';

function generateReferralCode(email) {
  return btoa(email).replace(/=/g, '');
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  subscribed: 'bg-emerald-100 text-emerald-800',
  reward_granted: 'bg-purple-100 text-purple-800',
};

const STATUS_LABELS = {
  pending: 'Signed Up',
  subscribed: 'Subscribed ✓',
  reward_granted: 'Reward Given',
};

export default function Referral() {
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const referralCode = user ? generateReferralCode(user.email) : '';
  const referralLink = user ? `${APP_URL}/?ref=${referralCode}` : '';

  const { data: referrals = [] } = useQuery({
    queryKey: ['referrals', user?.email],
    enabled: !!user?.email,
    queryFn: () => base44.entities.Referral.filter({ referrer_email: user.email }),
  });

  const pendingRewards = referrals.filter(r => r.status === 'subscribed').length;
  const totalConverted = referrals.filter(r => r.status === 'subscribed' || r.status === 'reward_granted').length;
  const rewardsGranted = referrals.filter(r => r.status === 'reward_granted').length;

  const copyText = async (text, key) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(null), 2000);
  };

  const shareOptions = user ? [
    {
      key: 'link',
      icon: ExternalLink,
      label: 'Referral Link',
      color: 'bg-slate-100 text-slate-700',
      text: referralLink,
      display: referralLink,
    },
    {
      key: 'tweet',
      icon: Twitter,
      label: 'Tweet / X',
      color: 'bg-sky-100 text-sky-700',
      text: `I've been using FlipFlow to manage my wholesale real estate deals — pipeline, calculators, contracts, and more. Get started free: ${referralLink}`,
      display: `I've been using FlipFlow to manage my wholesale real estate deals...`,
    },
    {
      key: 'sms',
      icon: MessageSquare,
      label: 'Text Message',
      color: 'bg-emerald-100 text-emerald-700',
      text: `Hey! Check out FlipFlow — it's a CRM built for wholesalers. I use it to track deals, run numbers, and generate contracts. 7-day free trial: ${referralLink}`,
      display: `Hey! Check out FlipFlow — it's a CRM built for wholesalers...`,
    },
    {
      key: 'email',
      icon: Mail,
      label: 'Email Copy',
      color: 'bg-amber-100 text-amber-700',
      text: `Subject: Tool I've been using for wholesale deals\n\nHey,\n\nIf you're wholesaling real estate, you should check out FlipFlow. I've been using it to manage my pipeline, calculate offers (MAO, Sub-To, Seller Finance), and even generate contracts as PDFs.\n\nThey have a 7-day free trial — no credit card needed:\n${referralLink}\n\nLet me know if you give it a shot!`,
      display: `Subject: Tool I've been using for wholesale deals...`,
    },
  ] : [];

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Gift className="w-6 h-6 text-amber-500" /> Referral Program
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Earn <span className="font-semibold text-foreground">1 free month</span> for every person you refer who subscribes to a paid plan.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Referred', value: referrals.length, icon: Users, color: 'text-blue-500' },
          { label: 'Converted', value: totalConverted, icon: Trophy, color: 'text-emerald-500' },
          { label: 'Rewards Pending', value: pendingRewards, icon: Gift, color: 'text-amber-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-3 text-center">
              <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reward Info */}
      {pendingRewards > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex gap-3">
          <Gift className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-amber-800 dark:text-amber-300">
              You have {pendingRewards} reward{pendingRewards > 1 ? 's' : ''} pending!
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              Contact us at <a href="mailto:support@flipflowcrm.com" className="underline">support@flipflowcrm.com</a> to claim your free month{pendingRewards > 1 ? 's' : ''}.
            </p>
          </div>
        </div>
      )}

      {/* Share Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Share2 className="w-4 h-4" /> Share Your Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {shareOptions.map(opt => {
            const Icon = opt.icon;
            const isCopied = copied === opt.key;
            return (
              <div key={opt.key} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${opt.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-muted-foreground mb-0.5">{opt.label}</div>
                  <div className="text-xs text-foreground/70 truncate">{opt.display}</div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 gap-1.5"
                  onClick={() => copyText(opt.text, opt.key)}
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {isCopied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Referral History */}
      {referrals.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Your Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {referrals.map(r => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <div className="text-sm font-medium">{r.referred_email || 'Pending signup'}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.status === 'reward_granted' ? `+${r.reward_months || 1} month reward granted` : 'Referred'}
                    </div>
                  </div>
                  <Badge className={`text-xs ${STATUS_COLORS[r.status]}`}>
                    {STATUS_LABELS[r.status]}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* How it works */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground">How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm">
            {[
              'Copy your unique referral link above.',
              'Share it with other wholesalers via text, email, or social.',
              'When they sign up and subscribe to any paid plan, you earn 1 free month.',
              'Email us to claim your reward — we\'ll add it to your account within 24 hours.',
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <span className="text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}