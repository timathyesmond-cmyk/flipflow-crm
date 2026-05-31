import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ADMIN_EMAIL = 'timathyesmond@gmail.com';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const deal = payload.data;
    const address = deal?.property_address || 'Unknown Address';
    const city = deal?.city ? `, ${deal.city}` : '';
    const state = deal?.state ? `, ${deal.state}` : '';
    const seller = deal?.seller_name || 'N/A';
    const offerPrice = deal?.offer_price ? `$${Number(deal.offer_price).toLocaleString()}` : 'N/A';
    const arv = deal?.arv ? `$${Number(deal.arv).toLocaleString()}` : 'N/A';
    const assignmentFee = deal?.assignment_fee ? `$${Number(deal.assignment_fee).toLocaleString()}` : 'N/A';
    const closingDate = deal?.closing_date || 'TBD';

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: ADMIN_EMAIL,
      from_name: 'FlipFlow CRM',
      subject: `🔥 Deal Under Contract: ${address}${city}`,
      body: `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#1e3a5f 0%,#2d5282 100%);padding:32px 40px;text-align:center;">
<table cellpadding="0" cellspacing="0" align="center"><tr>
<td style="background:rgba(255,255,255,0.15);border-radius:10px;padding:10px 14px;">
<span style="font-size:22px;font-weight:800;color:#f6ad55;">&#127968; FlipFlow</span>
</td></tr></table>
<p style="margin:12px 0 0;color:rgba(255,255,255,0.7);font-size:11px;letter-spacing:2px;text-transform:uppercase;">Deal Alert</p>
</td></tr>
<tr><td style="padding:32px 40px;">
<div style="display:inline-block;background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:6px 14px;margin-bottom:20px;">
<span style="font-size:13px;font-weight:700;color:#92400e;">🔥 UNDER CONTRACT</span>
</div>
<h2 style="margin:0 0 6px;font-size:22px;color:#1e3a5f;">${address}${city}${state}</h2>
<p style="margin:0 0 24px;font-size:14px;color:#64748b;">A deal just moved into the Under Contract stage.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
${[
  ['Seller', seller],
  ['Offer Price', offerPrice],
  ['ARV', arv],
  ['Assignment Fee', assignmentFee],
  ['Closing Date', closingDate],
].map(([label, value], i) => `<tr style="background:${i % 2 === 0 ? '#f8fafc' : '#fff'};">
<td style="padding:12px 16px;font-size:13px;color:#64748b;font-weight:600;width:40%;">${label}</td>
<td style="padding:12px 16px;font-size:13px;color:#1e293b;font-weight:700;">${value}</td>
</tr>`).join('')}
</table>
<p style="margin:24px 0 0;font-size:13px;color:#94a3b8;">Log in to FlipFlow to view the full deal details and take action.</p>
</td></tr>
<tr><td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
<p style="margin:0;font-size:13px;font-weight:600;color:#1e3a5f;">&#127968; FlipFlow Wholesale CRM</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`,
    });

    console.log(`Under Contract alert sent for deal: ${address}`);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Alert error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});