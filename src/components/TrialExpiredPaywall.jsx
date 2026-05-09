import React from 'react';
import { Lock, CheckCircle2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const FEATURES = [
  'Unlimited deal tracking & pipeline management',
  'Buyer & seller contact management',
  'Activity timeline & history',
  'Follow-up email templates',
  'PDF deal summaries',
  'Kanban board with drag & drop',
];

export default function TrialExpiredPaywall({ daysUsed }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Your free trial has ended</h1>
          <p className="text-muted-foreground text-sm">
            You've used your 7-day free trial. Upgrade to keep full access to DealFlow CRM and all your data.
          </p>
        </div>

        {/* Features list */}
        <div className="bg-card border border-border rounded-2xl p-5 text-left space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">What's included</p>
          {FEATURES.map(f => (
            <div key={f} className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-foreground">{f}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <a href="mailto:support@example.com?subject=DealFlow%20Upgrade">
            <Button className="w-full gap-2" size="lg">
              <Mail className="w-4 h-4" />
              Contact Us to Upgrade
            </Button>
          </a>
          <button
            onClick={() => base44.auth.logout()}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}