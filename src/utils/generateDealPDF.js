import jsPDF from 'jspdf';
import { format } from 'date-fns';

const propTypeLabels = {
  single_family: 'Single Family', multi_family: 'Multi Family', townhouse: 'Townhouse',
  condo: 'Condo', land: 'Land', commercial: 'Commercial', other: 'Other'
};
const dealTypeLabels = { assignment: 'Assignment', double_close: 'Double Close', novation: 'Novation' };

function fmt(val) {
  return val != null && val !== '' ? String(val) : '—';
}
function fmtMoney(val) {
  return val != null && val !== '' ? `$${Number(val).toLocaleString()}` : '—';
}
function fmtDate(val) {
  if (!val) return '—';
  try { return format(new Date(val), 'MMM d, yyyy'); } catch { return val; }
}

export function generateDealPDF(deal) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });

  const W = doc.internal.pageSize.getWidth();
  const margin = 48;
  let y = margin;

  // ── Header bar ──────────────────────────────────────────────────────────
  doc.setFillColor(26, 42, 74); // dark navy
  doc.rect(0, 0, W, 72, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(deal.property_address || 'Property Summary', margin, 30);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const location = [deal.city, deal.state, deal.zip].filter(Boolean).join(', ');
  doc.text(location || '', margin, 50);

  const stageLabelMap = {
    lead: 'Lead', contacted: 'Contacted', under_contract: 'Under Contract',
    assigned: 'Assigned', closed: 'Closed', dead: 'Dead'
  };
  const stageText = stageLabelMap[deal.stage] || deal.stage || '';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Stage: ${stageText}`, W - margin, 50, { align: 'right' });

  y = 96;

  // ── Section helper ───────────────────────────────────────────────────────
  const sectionTitle = (title) => {
    doc.setFillColor(240, 242, 248);
    doc.rect(margin, y, W - margin * 2, 20, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(26, 42, 74);
    doc.text(title, margin + 8, y + 14);
    y += 26;
  };

  const row = (label, value, rightLabel, rightValue) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(label, margin + 8, y);
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.text(fmt(value), margin + 130, y);

    if (rightLabel) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(rightLabel, W / 2 + 8, y);
      doc.setTextColor(30, 30, 30);
      doc.setFont('helvetica', 'bold');
      doc.text(fmt(rightValue), W / 2 + 130, y);
    }
    y += 18;
  };

  const moneyRow = (label, value, rightLabel, rightValue) => {
    row(label, fmtMoney(value), rightLabel, rightValue != null ? fmtMoney(rightValue) : undefined);
  };

  // ── Property Details ─────────────────────────────────────────────────────
  sectionTitle('Property Details');
  row('Property Type', propTypeLabels[deal.property_type], 'Deal Type', dealTypeLabels[deal.deal_type]);
  row('Bedrooms', deal.bedrooms, 'Bathrooms', deal.bathrooms);
  row('Square Feet', deal.sqft ? deal.sqft.toLocaleString() + ' sqft' : null, 'Priority', deal.priority ? deal.priority.charAt(0).toUpperCase() + deal.priority.slice(1) : null);
  row('Contract Date', fmtDate(deal.contract_date), 'Closing Date', fmtDate(deal.closing_date));
  y += 6;

  // ── Financials ────────────────────────────────────────────────────────────
  sectionTitle('Financials');
  moneyRow('Asking Price', deal.asking_price, 'Offer Price', deal.offer_price);
  moneyRow('ARV', deal.arv, 'Repair Estimate', deal.repair_estimate);
  moneyRow('Buyer Price', deal.buyer_price, 'Assignment Fee', deal.assignment_fee);

  if (deal.assignment_fee) {
    y += 4;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, W - margin, y);
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(26, 42, 74);
    doc.text('Est. Profit (Asking − Offer):', margin + 8, y);
    const profit = (deal.asking_price || 0) - (deal.offer_price || 0);
    doc.setTextColor(profit >= 0 ? 16 : 200, profit >= 0 ? 140 : 30, profit >= 0 ? 80 : 30);
    doc.text(`${profit >= 0 ? '+' : ''}$${profit.toLocaleString()}`, W - margin - 8, y, { align: 'right' });
    y += 10;
  }
  y += 6;

  // ── Notes ─────────────────────────────────────────────────────────────────
  if (deal.notes) {
    sectionTitle('Notes');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    const lines = doc.splitTextToSize(deal.notes, W - margin * 2 - 16);
    doc.text(lines, margin + 8, y);
    y += lines.length * 14 + 6;
  }

  // ── Footer ─────────────────────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(240, 242, 248);
  doc.rect(0, pageH - 30, W, 30, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated ${format(new Date(), 'MMM d, yyyy')}`, margin, pageH - 12);
  doc.text('Wholesale Deal Summary', W - margin, pageH - 12, { align: 'right' });

  // ── Save ──────────────────────────────────────────────────────────────────
  const filename = `${(deal.property_address || 'deal').replace(/[^a-z0-9]/gi, '_')}_summary.pdf`;
  doc.save(filename);
}