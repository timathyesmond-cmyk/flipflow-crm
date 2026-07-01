import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function TrialBanner({ daysRemaining }) {
  return (
    <div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-700 px-4 py-2.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <span className="font-semibold">
            {daysRemaining === 0 ? 'Your trial expires today' : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left in your free trial`}
          </span>
          {' '}— contact us to upgrade and keep your data.
        </p>
      </div>
      <a
        href="mailto:support@flipflowcrm.com?subject=FlipFlow%20Upgrade"
        className="text-xs font-semibold text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 underline underline-offset-2 whitespace-nowrap"
      >
        Upgrade now
      </a>
    </div>
  );
}