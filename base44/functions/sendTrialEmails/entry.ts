import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const DAY_MS = 24 * 60 * 60 * 1000;

const EMAILS = {
  2: {
    subject: "How to import your leads into FlipFlow",
    body: `Hi {{name}},

Welcome to FlipFlow! You're 2 days in — great time to hit the ground running.

Here's how to get your leads in fast:

1. Go to the Deals page and click "Add Deal"
2. Fill in the property address and seller info
3. Use the stage pipeline to track where each deal stands

💡 Pro tip: Use the "Import" button on the Deals page to bulk-upload leads from a CSV file. This saves hours if you're coming from a spreadsheet.

Once your leads are in, the Dashboard gives you a live view of your whole pipeline.

Keep building that list — deals are a numbers game!

The FlipFlow Team`,
  },
  4: {
    subject: "Common wholesaling mistakes our users avoid",
    body: `Hi {{name}},

You're 4 days into your FlipFlow trial — here are the top mistakes new wholesalers make (and how to avoid them):

❌ Mistake #1: Not running the numbers before making an offer
✅ Fix: Use the built-in MAO Calculator before every deal. It takes 60 seconds.

❌ Mistake #2: Forgetting to follow up with sellers
✅ Fix: Set a follow-up date on every deal. FlipFlow will remind you automatically.

❌ Mistake #3: No cash buyer list before going under contract
✅ Fix: Add buyers to your Contacts now — tag them as "cash buyers" so you can reach them fast.

❌ Mistake #4: Losing deals to paperwork delays
✅ Fix: Use the Contract Generator in the Calculator tab to produce assignment contracts in seconds.

You've got all the tools — go close something this week 💪

The FlipFlow Team`,
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Verify admin or scheduled call
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = Date.now();
    const users = await base44.asServiceRole.entities.User.list();

    let sent = 0;
    const errors = [];

    for (const u of users) {
      if (!u.email || !u.created_date) continue;

      const ageDays = (now - new Date(u.created_date).getTime()) / DAY_MS;
      const name = u.full_name?.split(' ')[0] || 'there';

      let emailDay = null;
      if (ageDays >= 1.5 && ageDays < 2.5) emailDay = 2;
      else if (ageDays >= 3.5 && ageDays < 4.5) emailDay = 4;

      if (!emailDay) continue;

      const tpl = EMAILS[emailDay];
      const body = tpl.body.replace(/{{name}}/g, name);

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: u.email,
          subject: tpl.subject,
          body,
        });
        console.log(`Sent day-${emailDay} email to ${u.email}`);
        sent++;
      } catch (err) {
        console.error(`Failed to send to ${u.email}:`, err.message);
        errors.push({ email: u.email, error: err.message });
      }
    }

    return Response.json({ sent, errors });
  } catch (error) {
    console.error('sendTrialEmails error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});