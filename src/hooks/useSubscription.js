import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Returns the current user's active subscription tier.
 * Admins and gifted members always return tier='pro'.
 */
export function useSubscription(user) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    // Privileged users bypass subscription checks
    if (user.role === 'admin' || user.gifted_membership === true) {
      setLoading(false);
      return;
    }

    base44.entities.UserSubscription
      .filter({ user_email: user.email, status: 'active' }, '-created_date', 1)
      .then(records => {
        setSubscription(records[0] || null);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, [user?.email]);

  const isPrivileged = user?.role === 'admin' || user?.gifted_membership === true;
  const tier = isPrivileged ? 'pro' : (subscription?.tier || null);

  return { subscription, tier, loading: isPrivileged ? false : loading };
}