import { createClientFromRequest } from 'npm:@base44/sdk@0.8.35';

const TRIAL_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

async function findUserRecord(base44, authUser) {
  if (authUser.id) {
    const byId = await base44.asServiceRole.entities.User.filter({ id: authUser.id });
    if (byId.length > 0) return byId[0];
  }
  if (authUser.email) {
    const byEmail = await base44.asServiceRole.entities.User.filter({ email: authUser.email });
    if (byEmail.length > 0) return byEmail[0];
  }
  return null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const authUser = await base44.auth.me();
    if (!authUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (authUser.role === 'admin' || authUser.gifted_membership === true) {
      return Response.json({
        trialStatus: 'active',
        daysRemaining: null,
        exempt: true,
      });
    }

    let record = await findUserRecord(base44, authUser);
    let trialEndsAt = record?.trial_ends_at;

    if (!trialEndsAt) {
      const now = new Date();
      // Anchor trial to account creation — not client-writable trial_start_date
      const anchor = record?.created_date
        ? new Date(record.created_date)
        : authUser.created_date
          ? new Date(authUser.created_date)
          : now;
      const start = anchor.toISOString();
      const ends = new Date(anchor.getTime() + TRIAL_DAYS * DAY_MS).toISOString();
      const updatePayload = {
        trial_start_date: start,
        trial_ends_at: ends,
      };

      const recordId = record?.id || authUser.id;
      if (recordId) {
        try {
          await base44.asServiceRole.entities.User.update(recordId, updatePayload);
        } catch (err) {
          console.error('getTrialStatus: failed to persist trial dates:', err.message);
        }
      }

      trialEndsAt = ends;
    }

    const remainingMs = new Date(trialEndsAt).getTime() - Date.now();
    const daysRemaining = Math.max(0, Math.ceil(remainingMs / DAY_MS));

    return Response.json({
      trialStatus: daysRemaining > 0 ? 'active' : 'expired',
      daysRemaining,
      trialEndsAt,
    });
  } catch (error) {
    console.error('getTrialStatus error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});