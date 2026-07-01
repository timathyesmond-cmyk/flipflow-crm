import { createClientFromRequest } from 'npm:@base44/sdk@0.8.35';

const DAY_MS = 24 * 60 * 60 * 1000;

const brandHtml = (name, headline, bodyContent) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e3a5f 0%,#2d5282 100%);padding:32px 40px;text-align:center;">
            <table cellpadding="0" cellspacing="0" align="center">
              <tr>
                <td style="background:rgba(255,255,255,0.15);border-radius:10px;padding:10px 14px;">
                  <span style="font-size:22px;font-weight:800;color:#f6ad55;letter-spacing:-0.5px;">&#127968; FlipFlow</span>
                </td>
              </tr>
            </table>
            <p style="margin:12px 0 0;color:rgba(255,255,255,0.7);font-size:11px;letter-spacing:2px;text-transform:uppercase;">Wholesale CRM</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 8px;font-size:13px;color:#64748b;font-weight:500;">Hi ${name},</p>
            <h1 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#1e3a5f;line-height:1.3;">${headline}</h1>
            ${bodyContent}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#1e3a5f;">&#127968; FlipFlow Wholesale CRM</p>
            <p style="margin:0;font-size:11px;color:#94a3b8;">You're receiving this because you signed up for a free trial.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
`;

const tip = (emoji, title, text) =>
  `<table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:14px;">
    <tr>
      <td style="background:#f0f7ff;border-left:4px solid #3b82f6;border-radius:0 8px 8px 0;padding:14px 16px;">
        <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#1e3a5f;">${emoji} ${title}</p>
        <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">${text}</p>
      </td>
    </tr>
  </table>`;

const mistakeTip = (wrong, fix) =>
  `<table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:14px;">
    <tr>
      <td style="background:#fff8f0;border-radius:8px;padding:14px 16px;">
        <p style="margin:0 0 6px;font-size:13px;color:#dc2626;">&#10060; ${wrong}</p>
        <p style="margin:0;font-size:13px;color:#16a34a;">&#9989; ${fix}</p>
      </td>
    </tr>
  </table>`;

const btn = (label, url) =>
  `<a href="${url}" style="display:inline-block;margin-top:8px;padding:12px 28px;background:linear-gradient(135deg,#c97a1a,#f6ad55);color:#1e3a5f;font-weight:700;font-size:14px;border-radius:8px;text-decoration:none;">${label}</a>`;

const EMAILS = {
  2: {
    subject: "🏠 How to import your leads into FlipFlow",
    buildBody: (name) => brandHtml(name, "Get your leads in — fast.",
      `<p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.7;">You're 2 days in. Here's the fastest way to load your pipeline:</p>
      ${tip('1️⃣', 'Add a deal manually', 'Go to <strong>Deals</strong> and click <strong>"+ Add Deal"</strong>. Fill in the address, seller info, and pick a stage.')}
      ${tip('2️⃣', 'Bulk import from a spreadsheet', 'Use the <strong>Import</strong> button on the Deals page to upload a CSV and load all your leads at once — huge time-saver.')}
      ${tip('3️⃣', 'Use the pipeline board', 'Drag deals across stages — Lead → Contacted → Under Contract → Closed. Your Dashboard updates in real time.')}
      <p style="margin:20px 0 0;font-size:13px;color:#64748b;">The more deals in your pipeline, the better your Dashboard analytics get. Start adding today!</p>
      <div style="text-align:center;margin-top:28px;">${btn('Open My Deals →', 'https://flipflowcrm.com/deals')}</div>
      <p style="margin:24px 0 0;font-size:13px;color:#64748b;">Happy wholesaling,<br><strong style="color:#1e3a5f;">The FlipFlow Team</strong></p>`
    ),
  },
  4: {
    subject: "⚠️ Common wholesaling mistakes — and how to avoid them",
    buildBody: (name) => brandHtml(name, "Mistakes that cost new wholesalers deals (avoid these).",
      `<p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.7;">You're 4 days in — here are the most common traps new wholesalers fall into, and how FlipFlow helps you sidestep them:</p>
      ${mistakeTip('Not running the numbers before making an offer', 'Use the built-in <strong>MAO Calculator</strong> — takes 60 seconds per deal.')}
      ${mistakeTip('Forgetting to follow up with sellers', 'Set a <strong>Follow-Up Date</strong> on every deal. FlipFlow sends you reminders automatically.')}
      ${mistakeTip('No cash buyer list before going under contract', 'Add buyers in <strong>Contacts</strong> tagged as cash buyers so you can blast them the second you have a deal.')}
      ${mistakeTip('Losing deals to slow paperwork', 'Use the <strong>Contract Generator</strong> in the Calculator tab — produce assignment contracts in seconds.')}
      <p style="margin:20px 0 0;font-size:14px;color:#475569;line-height:1.7;">You have all the tools — go close something this week 💪</p>
      <div style="text-align:center;margin-top:28px;">${btn('Open FlipFlow →', 'https://flipflowcrm.com/')}</div>
      <p style="margin:24px 0 0;font-size:13px;color:#64748b;">Rooting for you,<br><strong style="color:#1e3a5f;">The FlipFlow Team</strong></p>`
    ),
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
      const body = tpl.buildBody(name);

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: u.email,
          subject: tpl.subject,
          body,
          from_name: 'FlipFlow CRM',
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