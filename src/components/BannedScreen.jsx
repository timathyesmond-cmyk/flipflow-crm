import React from 'react';
import { Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function BannedScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
            <Ban className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Account Suspended</h1>
          <p className="text-muted-foreground text-sm">
            Your FlipFlow account has been suspended. If you believe this is a mistake, contact{' '}
            <a href="mailto:support@flipflowcrm.com" className="underline hover:text-foreground">
              support@flipflowcrm.com
            </a>.
          </p>
        </div>
        <Button variant="outline" onClick={() => base44.auth.logout()}>
          Sign Out
        </Button>
      </div>
    </div>
  );
}