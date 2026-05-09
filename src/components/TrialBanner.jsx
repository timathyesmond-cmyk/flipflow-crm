import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function TrialBanner({ daysRemaining }) {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <p className="text-sm text-amber-800">
          <span className="font-semibold">
            {daysRemaining === 0 ? 'Your trial expires today' : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left in your free trial`}
          </span>
          {' '}— contact us to upgrade and keep your data.
        </p>
      </div>
      <a
        href="mailto:support@example.com?subject=DealFlow%20Upgrade"
        className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline underline-offset-2 whitespace-nowrap"
      >
        Upgrade now
      </a>
    </div>
  );
}