import { jsPDF } from 'jspdf';
import { ReceiptData } from '../types';
import logoImg from '../assets/images/uchiha_marri_official_logo.jpeg';

export type { ReceiptData };

// Format ISO date into Sri Lanka / local readable format
export function formatReceiptDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return new Date().toLocaleString();
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

// Preload the official logo image onto an HTMLImageElement
function loadLogoImage(): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // If primary path fails, try public asset directly
      img.src = '/assets/aistudio/WhatsApp_Image_2026-11-01_at_6.52.30_PM_b29919ee.jpeg';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load logo image'));
    };
    img.src = logoImg;
  });
}

/**
 * High-Resolution Canvas Renderer for Official Receipt
 * Draws the receipt with dark gaming theme, crimson & purple glowing accents,
 * customer & game UID details, item breakdown, and an authentic rotated PAID stamp.
 */
export async function renderReceiptToCanvas(data: ReceiptData): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  // High-DPI canvas (1200 x 1700 px) for crisp 2x retina display and download
  const width = 1200;
  const height = 1700;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  // 1. Deep Obsidian / Midnight Dark Gradient Background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#07070b');
  bgGrad.addColorStop(0.5, '#0d0d16');
  bgGrad.addColorStop(1, '#110a18');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle radial ambient glow (Purple & Crimson neon energy)
  const radGrad1 = ctx.createRadialGradient(200, 150, 20, 200, 150, 450);
  radGrad1.addColorStop(0, 'rgba(220, 38, 38, 0.18)');
  radGrad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radGrad1;
  ctx.fillRect(0, 0, width, height);

  const radGrad2 = ctx.createRadialGradient(width - 200, 400, 20, width - 200, 400, 500);
  radGrad2.addColorStop(0, 'rgba(168, 85, 247, 0.14)');
  radGrad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radGrad2;
  ctx.fillRect(0, 0, width, height);

  // Decorative border
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, width - 56, height - 56);

  ctx.strokeStyle = 'rgba(168, 85, 247, 0.2)';
  ctx.lineWidth = 1;
  ctx.strokeRect(36, 36, width - 72, height - 72);

  // 2. Glowing Top Header Bar (Red -> Purple -> Rose)
  const headerGrad = ctx.createLinearGradient(0, 0, width, 0);
  headerGrad.addColorStop(0, '#dc2626');
  headerGrad.addColorStop(0.5, '#9333ea');
  headerGrad.addColorStop(1, '#ec4899');
  ctx.fillStyle = headerGrad;
  ctx.fillRect(28, 28, width - 56, 10);

  // 3. Header Section (Logo + Business Wordmark)
  let logo: HTMLImageElement | null = null;
  try {
    logo = await loadLogoImage();
  } catch (e) {
    console.warn('Could not load logo for canvas, drawing stylized emblem instead', e);
  }

  const logoX = 70;
  const logoY = 70;
  const logoSize = 120;

  if (logo) {
    ctx.save();
    // Rounded corner clip for logo
    ctx.beginPath();
    ctx.roundRect(logoX, logoY, logoSize, logoSize, 20);
    ctx.clip();
    ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
    ctx.restore();

    // Glowing border around logo
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(logoX, logoY, logoSize, logoSize, 20);
    ctx.stroke();
  } else {
    // Fallback stylized shield
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.roundRect(logoX, logoY, logoSize, logoSize, 20);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('UM', logoX + logoSize / 2, logoY + 70);
  }

  // Business Name
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 42px Outfit, sans-serif';
  ctx.fillText('UCHIHA MARRI TOP UP', logoX + logoSize + 28, logoY + 48);

  // Document Title & Tagline
  ctx.fillStyle = '#f43f5e';
  ctx.font = 'bold 20px Outfit, sans-serif';
  ctx.fillText('OFFICIAL ELECTRONIC PAYMENT RECEIPT', logoX + logoSize + 28, logoY + 80);

  ctx.fillStyle = '#a1a1aa';
  ctx.font = '14px Plus Jakarta Sans, sans-serif';
  ctx.fillText('FAST, SAFE & RELIABLE GAMING TOP UPS • SRI LANKA (LKR)', logoX + logoSize + 28, logoY + 108);

  const isPaid = data.status === 'PAID' || data.status === 'SUCCESSFUL';
  const statusDisplay = isPaid
    ? 'SUCCESSFUL'
    : data.status === 'CANCELLED'
    ? 'CANCELLED'
    : data.status === 'FAILED'
    ? 'FAILED'
    : 'PENDING';

  // Right-side Verification Pill Badge
  const badgeW = 240;
  const badgeH = 46;
  const badgeX = width - 70 - badgeW;
  const badgeY = logoY + 12;

  ctx.fillStyle = isPaid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)';
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 10);
  ctx.fill();
  ctx.strokeStyle = isPaid ? 'rgba(16, 185, 129, 0.6)' : 'rgba(245, 158, 11, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = isPaid ? '#34d399' : '#fbbf24';
  ctx.font = 'bold 15px Outfit, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(isPaid ? '✓ PAYHERE VERIFIED' : `STATUS: ${statusDisplay}`, badgeX + badgeW / 2, badgeY + 28);

  // Separator
  let curY = 225;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(70, curY);
  ctx.lineTo(width - 70, curY);
  ctx.stroke();

  // 4. Receipt Metadata Bar (4 Column Cards)
  curY += 25;
  const metaBoxW = (width - 140 - 36) / 4;
  const metaBoxH = 88;

  const metaItems = [
    { label: 'ORDER ID', val: data.orderId, color: '#ffffff' },
    { label: 'PAYMENT STATUS', val: statusDisplay, color: isPaid ? '#34d399' : '#fbbf24' },
    { label: 'RECEIPT NUMBER', val: data.receiptNumber || 'PENDING', color: '#ec4899' },
    { label: 'PAYMENT DATE', val: formatReceiptDate(data.date), color: '#a1a1aa' },
  ];

  metaItems.forEach((item, idx) => {
    const x = 70 + idx * (metaBoxW + 12);
    ctx.fillStyle = 'rgba(24, 24, 34, 0.85)';
    ctx.beginPath();
    ctx.roundRect(x, curY, metaBoxW, metaBoxH, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#71717a';
    ctx.font = 'bold 11px Outfit, sans-serif';
    ctx.fillText(item.label, x + 16, curY + 28);

    ctx.fillStyle = item.color;
    ctx.font = 'bold 14px "JetBrains Mono", monospace';
    // Truncate if long
    let displayVal = item.val;
    if (displayVal.length > 24) displayVal = displayVal.slice(0, 22) + '...';
    ctx.fillText(displayVal, x + 16, curY + 58);
  });

  // 5. Customer & In-Game UID Details Card
  curY += metaBoxH + 35;

  ctx.fillStyle = '#ef4444';
  ctx.font = '900 18px Outfit, sans-serif';
  ctx.fillText('1. CUSTOMER & IN-GAME UID DETAILS', 70, curY);

  curY += 15;
  const infoCardH = 200;
  ctx.fillStyle = 'rgba(19, 19, 29, 0.9)';
  ctx.beginPath();
  ctx.roundRect(70, curY, width - 140, infoCardH, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Grid of details
  const col1X = 100;
  const col2X = 640;

  const renderField = (label: string, value: string, x: number, y: number, highlight = false) => {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '13px Plus Jakarta Sans, sans-serif';
    ctx.fillText(label, x, y);

    ctx.fillStyle = highlight ? '#f43f5e' : '#ffffff';
    ctx.font = highlight ? 'bold 17px Outfit, sans-serif' : 'bold 16px "JetBrains Mono", sans-serif';
    ctx.fillText(value, x, y + 26);
  };

  renderField('Customer Name:', data.customerName, col1X, curY + 40);
  renderField('WhatsApp / Contact Number:', data.whatsappNumber, col2X, curY + 40);

  renderField('Game Name:', data.gameName, col1X, curY + 105, true);
  const uidText = data.serverZone ? `${data.playerId} (Zone: ${data.serverZone})` : data.playerId;
  renderField('Player ID:', uidText, col2X, curY + 105);

  renderField('Customer Email:', data.customerEmail || `${data.whatsappNumber.replace(/[^0-9]/g, '')}@uchihatopup.lk`, col1X, curY + 168);
  renderField('Top-Up Delivery Type:', 'Direct In-Game UID Auto Credit', col2X, curY + 168);

  // 6. Order & Package Breakdown Table
  curY += infoCardH + 40;
  ctx.fillStyle = '#a855f7';
  ctx.font = '900 18px Outfit, sans-serif';
  ctx.fillText('2. PURCHASED PACKAGE & PAYMENT BREAKDOWN', 70, curY);

  curY += 16;
  const tableW = width - 140;

  // Table Header
  ctx.fillStyle = 'rgba(32, 24, 48, 0.9)';
  ctx.beginPath();
  ctx.roundRect(70, curY, tableW, 46, 8);
  ctx.fill();

  ctx.fillStyle = '#d4d4d8';
  ctx.font = 'bold 13px Outfit, sans-serif';
  ctx.fillText('PACKAGE DESCRIPTION', 95, curY + 28);
  ctx.fillText('PAYMENT METHOD', 620, curY + 28);
  ctx.textAlign = 'right';
  ctx.fillText('PAYMENT AMOUNT (LKR)', width - 95, curY + 28);

  // Table Row
  curY += 46;
  ctx.fillStyle = 'rgba(17, 17, 26, 0.85)';
  ctx.beginPath();
  ctx.roundRect(70, curY, tableW, 85, 8);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 17px Outfit, sans-serif';
  const pkgName = data.packageName || `${data.gameName} Top Up Credits`;
  ctx.fillText(pkgName, 95, curY + 36);

  ctx.fillStyle = '#71717a';
  ctx.font = '13px Plus Jakarta Sans, sans-serif';
  ctx.fillText(`Player ID: ${data.playerId} • Status: ${statusDisplay}`, 95, curY + 62);

  ctx.fillStyle = '#e4e4e7';
  ctx.font = 'bold 15px Plus Jakarta Sans, sans-serif';
  const methodLabel = data.paymentMethod.toLowerCase().includes('mastercard')
    ? 'Mastercard (PayHere)'
    : 'Visa Card (PayHere)';
  ctx.fillText(methodLabel, 620, curY + 48);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px "JetBrains Mono", monospace';
  const formattedAmt = `Rs. ${Number(data.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  ctx.fillText(formattedAmt, width - 95, curY + 48);

  // 7. Total Summary Box
  curY += 85 + 24;
  const sumW = 420;
  const sumH = 110;
  const sumX = width - 70 - sumW;

  const totalGrad = ctx.createLinearGradient(sumX, curY, sumX + sumW, curY + sumH);
  totalGrad.addColorStop(0, 'rgba(38, 14, 30, 0.95)');
  totalGrad.addColorStop(1, 'rgba(48, 16, 24, 0.95)');
  ctx.fillStyle = totalGrad;
  ctx.beginPath();
  ctx.roundRect(sumX, curY, sumW, sumH, 14);
  ctx.fill();
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#a1a1aa';
  ctx.font = 'bold 12px Outfit, sans-serif';
  ctx.fillText('PAYMENT AMOUNT IN SRI LANKAN RUPEES (LKR)', sumX + 26, curY + 35);

  ctx.fillStyle = '#ef4444';
  ctx.font = '900 32px Outfit, sans-serif';
  ctx.fillText(formattedAmt, sumX + 26, curY + 80);

  // 8. Rotated Official Payment Status Stamp
  // Drawn on left side opposite the total box
  const stampX = 240;
  const stampY = curY + 50;
  const stampColor = isPaid ? '#10b981' : '#f59e0b';

  ctx.save();
  ctx.translate(stampX, stampY);
  ctx.rotate((-12 * Math.PI) / 180); // -12 degrees authentic angle

  // Outer stamp border
  ctx.strokeStyle = stampColor;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(-160, -55, 320, 110, 14);
  ctx.stroke();

  // Inner dashed stamp border
  ctx.strokeStyle = isPaid ? 'rgba(16, 185, 129, 0.5)' : 'rgba(245, 158, 11, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.roundRect(-152, -47, 304, 94, 10);
  ctx.stroke();
  ctx.setLineDash([]);

  // Stamp Text
  ctx.textAlign = 'center';
  ctx.fillStyle = stampColor;
  ctx.font = 'bold 11px Outfit, sans-serif';
  ctx.fillText('★ OFFICIAL PAYMENT STATUS ★', 0, -28);

  ctx.font = isPaid ? '900 44px Outfit, sans-serif' : '900 32px Outfit, sans-serif';
  ctx.fillText(isPaid ? 'PAID' : statusDisplay, 0, 15);

  ctx.font = 'bold 11px Outfit, sans-serif';
  ctx.fillText(`PAYHERE • ${data.orderId.slice(-9)}`, 0, 36);

  ctx.restore();

  // 9. Delivery Notice & Security Guarantee Box
  curY += sumH + 35;
  const noticeH = 150;
  ctx.fillStyle = 'rgba(18, 18, 28, 0.9)';
  ctx.beginPath();
  ctx.roundRect(70, curY, width - 140, noticeH, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.25)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px Outfit, sans-serif';
  ctx.fillText('DELIVERY INSTRUCTIONS & CUSTOMER GUARANTEE', 98, curY + 36);

  ctx.fillStyle = '#a1a1aa';
  ctx.font = '13.5px Plus Jakarta Sans, sans-serif';
  ctx.fillText('• 100% Safe Top Up: Your payment was verified securely by PayHere Sri Lanka payment gateway.', 98, curY + 68);
  ctx.fillText('• Estimated Delivery Time: Gaming credits are directly credited to your player UID within 5 - 15 minutes.', 98, curY + 96);
  ctx.fillText(`• Instant WhatsApp Priority Support: For direct delivery verification, message 0742235836 on WhatsApp.`, 98, curY + 124);

  // 10. Footer Branding Bar
  const footerY = height - 70;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#71717a';
  ctx.font = '12px Plus Jakarta Sans, sans-serif';
  ctx.fillText('UCHIHA MARRI TOP UP • Sri Lanka Gaming Top-Up Platform • Secured by PayHere Gateway', 70, footerY);

  ctx.textAlign = 'right';
  ctx.fillText(`Generated: ${new Date().toUTCString()}`, width - 70, footerY);

  return canvas;
}

/**
 * Download high-resolution PNG receipt
 */
export async function downloadReceiptPng(data: ReceiptData): Promise<void> {
  const canvas = await renderReceiptToCanvas(data);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to generate PNG blob from canvas'));
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanId = (data.orderId || 'ORDER').replace(/[^a-zA-Z0-9-]/g, '_');
      a.download = `Uchiha_Marri_Receipt_${cleanId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 3000);
      resolve();
    }, 'image/png');
  });
}

/**
 * Generate A4 PDF with high-fidelity receipt
 */
export async function generateReceiptPdf(data: ReceiptData): Promise<jsPDF> {
  const canvas = await renderReceiptToCanvas(data);
  const imgData = canvas.toDataURL('image/png', 0.95);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Draw the high-fidelity receipt canvas directly onto the full A4 page
  doc.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);

  return doc;
}

/**
 * Download PDF receipt
 */
export async function downloadReceiptPdf(data: ReceiptData): Promise<void> {
  const doc = await generateReceiptPdf(data);
  const cleanId = (data.orderId || 'ORDER').replace(/[^a-zA-Z0-9-]/g, '_');
  doc.save(`Uchiha_Marri_Receipt_${cleanId}.pdf`);
}

// Backward-compatibility alias
export const downloadReceipt = downloadReceiptPdf;
