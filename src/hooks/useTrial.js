import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const TRIAL_DAYS = 7;

export function useTrial(user) {
  const [trialStatus, setTrialStatus] = useState('loading'); // 'loading' | 'active' | 'expired'
  const [daysRemaining, setDaysRemaining] = useState(null);

  useEffect(() => {
    if (!user) return;

    // Admins and gifted members are never gated
    if (user.role === 'admin' || user.gifted_membership === true) {
      setTrialStatus('active');
      return;
    }

    const initTrial = async () => {
      let trialStart = user.trial_start_date;

      // First-time user: stamp the trial start date
      if (!trialStart) {
        const today = new Date().toISOString();
        await base44.auth.updateMe({ trial_start_date: today });
        trialStart = today;
      }

      const start = new Date(trialStart);
      const now = new Date();
      const diffMs = now - start;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      const remaining = Math.max(0, Math.ceil(TRIAL_DAYS - diffDays));

      setDaysRemaining(remaining);
      setTrialStatus(remaining > 0 ? 'active' : 'expired');
    };

    initTrial();
  }, [user]);

  return { trialStatus, daysRemaining };
}