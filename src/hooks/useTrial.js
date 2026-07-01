import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

export function useTrial(user) {
  const [trialStatus, setTrialStatus] = useState('loading');
  const [daysRemaining, setDaysRemaining] = useState(null);

  useEffect(() => {
    if (!user) return;

    if (user.role === 'admin' || user.gifted_membership === true) {
      setTrialStatus('active');
      setDaysRemaining(null);
      return;
    }

    let cancelled = false;

    const fetchTrialStatus = async () => {
      try {
        const res = await base44.functions.invoke('getTrialStatus', {});
        if (cancelled) return;

        const data = res.data || {};
        setDaysRemaining(data.daysRemaining ?? null);
        setTrialStatus(data.trialStatus === 'active' ? 'active' : 'expired');
      } catch (err) {
        console.error('Failed to fetch trial status:', err);
        if (!cancelled) setTrialStatus('expired');
      }
    };

    fetchTrialStatus();

    return () => { cancelled = true; };
  }, [user?.id, user?.email, user?.role, user?.gifted_membership]);

  return { trialStatus, daysRemaining };
}