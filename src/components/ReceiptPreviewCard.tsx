import React, { useState } from 'react';
import {
  Download,
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Gamepad2,
  User,
  CreditCard,
  Loader2,
  Clock,
  AlertCircle,
  MessageCircle,
  XCircle,
} from 'lucide-react';
import { ReceiptData } from '../types';
import { downloadReceiptPdf, downloadReceiptPng, formatReceiptDate } from '../utils/receiptGenerator';
import logoImg from '../assets/images/uchiha_marri_official_logo.jpeg';

interface ReceiptPreviewCardProps {
  receipt: ReceiptData;
  isPendingVerification?: boolean;
}

export const ReceiptPreviewCard: React.FC<ReceiptPreviewCardProps> = ({
  receipt,
  isPendingVerification = false,
}) => {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingPng, setDownloadingPng] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const isPaid =
    (receipt.status === 'PAID' || receipt.status === 'SUCCESSFUL') && !isPendingVerification;
  const isCancelled = receipt.status === 'CANCELLED';
  const isFailed = receipt.status === 'FAILED';

  const displayStatus = isPaid
    ? 'Successful'
    : isCancelled
    ? 'Cancelled'
    : isFailed
    ? 'Failed'
    : 'Pending';

  const packageLabel = receipt.packageName || `${receipt.gameName} Top Up Credits`;
  const formattedDate = formatReceiptDate(receipt.date);
  const formattedAmount = `Rs. ${Number(receipt.amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} LKR`;

  // Target WhatsApp number: 0742235836 (formatted with Sri Lanka country code 94 for wa.me link)
  const rawWhatsApp = (receipt.whatsappSupport || '0742235836').replace(/[^0-9]/g, '');
  const waTargetNumber = rawWhatsApp.startsWith('0')
    ? `94${rawWhatsApp.slice(1)}`
    : rawWhatsApp.startsWith('94')
    ? rawWhatsApp
    : `94742235836`;

  const whatsappReceiptMessage = [
    '*UCHIHA MARRI TOP UP — PAYMENT RECEIPT*',
    `Order ID: ${receipt.orderId}`,
    `Customer Name: ${receipt.customerName}`,
    `Game Name: ${receipt.gameName}`,
    `Player ID: ${receipt.playerId}${receipt.serverZone ? ` (Zone: ${receipt.serverZone})` : ''}`,
    `Package: ${packageLabel}`,
    `Payment Amount: ${formattedAmount}`,
    `Payment Status: ${displayStatus}`,
    `Payment Date: ${formattedDate}`,
  ].join('\n');

  const whatsappShareUrl = `https://wa.me/${waTargetNumber}?text=${encodeURIComponent(
    whatsappReceiptMessage
  )}`;

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(receipt.orderId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    setDownloadError(null);
    try {
      await downloadReceiptPdf(receipt);
    } catch (err: any) {
      console.error('Failed to generate PDF:', err);
      setDownloadError('Could not generate PDF receipt. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadPng = async () => {
    setDownloadingPng(true);
    setDownloadError(null);
    try {
      await downloadReceiptPng(receipt);
    } catch (err: any) {
      console.error('Failed to generate PNG:', err);
      setDownloadError('Could not generate PNG image. Please try again.');
    } finally {
      setDownloadingPng(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Receipt Paper Card */}
      <div className="relative rounded-2xl border border-purple-500/30 bg-[#0d0d16] p-6 sm:p-8 shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Glowing Top Gaming Edge (Crimson to Purple to Rose) */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-purple-600 to-pink-500" />

        {/* Ambient Corner Glows */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Bar: Business Logo + Business Name + Official Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
          <div className="flex items-center gap-3.5">
            <img
              src={logoImg}
              alt="UCHIHA MARRI TOP UP"
              className="h-14 w-14 rounded-xl border-2 border-red-500/50 object-cover shadow-md shadow-red-950/80"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg sm:text-xl font-black uppercase tracking-wider text-white">
                  UCHIHA MARRI TOP UP
                </span>
              </div>
              <span className="block text-xs font-bold tracking-widest text-pink-400 uppercase">
                OFFICIAL PAYMENT RECEIPT
              </span>
              <span className="text-[11px] text-zinc-400">
                Fast, Safe & Reliable Gaming Top Ups • Sri Lanka (LKR)
              </span>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1">
            {isPaid ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SUCCESSFUL • VERIFIED</span>
              </span>
            ) : isCancelled ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-950/60 border border-red-500/40 text-red-300">
                <XCircle className="w-3.5 h-3.5" />
                <span>CANCELLED</span>
              </span>
            ) : isFailed ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-950/60 border border-red-500/40 text-red-300">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>FAILED</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-950/60 border border-amber-500/40 text-amber-300">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>PENDING VERIFICATION</span>
              </span>
            )}
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
              {receipt.country || 'Sri Lanka'} • PayHere Gateway
            </span>
          </div>
        </div>

        {/* Metadata Grid (Order ID, Payment Status, Payment Date, Receipt No) */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-zinc-800/80 bg-[#141420] p-3 text-left">
            <div className="flex items-center justify-between">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Order ID
              </span>
              <button
                onClick={handleCopyOrderId}
                className="cursor-pointer text-zinc-400 hover:text-white"
                title="Copy Order ID"
              >
                {copiedId ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
            <span className="font-mono text-xs sm:text-sm font-bold text-white block truncate">
              {receipt.orderId}
            </span>
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-[#141420] p-3 text-left">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Payment Status
            </span>
            <span
              className={`font-mono text-xs sm:text-sm font-bold block truncate ${
                isPaid
                  ? 'text-emerald-400'
                  : isCancelled || isFailed
                  ? 'text-red-400'
                  : 'text-amber-300'
              }`}
            >
              {displayStatus}
            </span>
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-[#141420] p-3 text-left">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Payment Date
            </span>
            <span className="text-[11px] font-medium text-zinc-300 block truncate">
              {formattedDate}
            </span>
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-[#141420] p-3 text-left">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Receipt No
            </span>
            <span className="font-mono text-xs sm:text-sm font-bold text-pink-400 block truncate">
              {isPaid ? receipt.receiptNumber || 'VERIFIED' : displayStatus.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Customer & Game Account Details Section */}
        <div className="mt-5 rounded-xl border border-red-500/20 bg-[#141420]/90 p-4 sm:p-5 text-left space-y-3">
          <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-2">
            <User className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Customer & In-Game UID Details
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-zinc-500 block text-[11px]">Customer Name:</span>
              <span className="font-bold text-white text-sm">{receipt.customerName}</span>
            </div>

            <div>
              <span className="text-zinc-500 block text-[11px]">WhatsApp / Contact:</span>
              <span className="font-mono font-bold text-zinc-200 text-sm">
                {receipt.whatsappNumber}
              </span>
            </div>

            <div>
              <span className="text-zinc-500 block text-[11px]">Game Name:</span>
              <span className="font-bold text-red-400 text-sm flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>{receipt.gameName}</span>
              </span>
            </div>

            <div>
              <span className="text-zinc-500 block text-[11px]">Player ID:</span>
              <span className="font-mono font-bold text-white text-sm">
                {receipt.playerId}
                {receipt.serverZone ? ` (Zone: ${receipt.serverZone})` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Item Breakdown & Payment Amount */}
        <div className="mt-5 rounded-xl border border-purple-500/20 bg-[#141420]/90 p-4 sm:p-5 text-left space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 text-xs font-bold uppercase tracking-wider text-zinc-300">
            <span className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-400" />
              <span>Package & Payment Summary</span>
            </span>
            <span className="text-purple-300">PayHere Gateway</span>
          </div>

          <div className="flex items-center justify-between py-1 text-xs">
            <div>
              <span className="text-zinc-500 block text-[11px]">Package:</span>
              <span className="font-bold text-white text-sm block">{packageLabel}</span>
              <span className="text-[11px] text-zinc-400">
                Payment Method: {receipt.paymentMethod}
              </span>
            </div>
            <div className="text-right">
              <span className="text-zinc-500 block text-[11px]">Payment Status:</span>
              <span
                className={`font-mono font-bold text-sm block ${
                  isPaid
                    ? 'text-emerald-400'
                    : isCancelled || isFailed
                    ? 'text-red-400'
                    : 'text-amber-300'
                }`}
              >
                {displayStatus}
              </span>
              <span className="text-[10px] text-zinc-500">Currency: LKR</span>
            </div>
          </div>

          {/* Payment Amount Row */}
          <div className="border-t border-zinc-800 pt-3 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
              Payment Amount:
            </span>
            <span className="font-display font-black text-xl sm:text-2xl text-red-400 font-mono">
              {formattedAmount}
            </span>
          </div>
        </div>

        {/* Bottom Section: Authentic Rotated "PAID" Stamp or Status Notice */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {isPaid ? (
            <div className="relative inline-block transform -rotate-12 transition-transform duration-300 hover:rotate-0 my-2">
              <div className="rounded-xl border-4 border-emerald-500/90 bg-emerald-950/40 px-5 py-2.5 text-center shadow-lg shadow-emerald-950/70 border-double">
                <span className="block text-[9px] font-black uppercase tracking-widest text-emerald-400">
                  ★ OFFICIAL PAID STAMP ★
                </span>
                <span className="font-display text-2xl font-black uppercase tracking-wider text-emerald-300 leading-none block my-0.5">
                  PAID
                </span>
                <span className="block text-[8px] font-bold text-emerald-400/90 tracking-tight">
                  VERIFIED BY PAYHERE • {receipt.orderId.slice(-9)}
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-amber-950/40 border border-amber-500/40 p-3 text-xs text-amber-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                Status: <strong>{displayStatus}</strong>. Official PAID stamp unlocks automatically
                once PayHere server notification confirms payment.
              </span>
            </div>
          )}

          {/* Delivery Note */}
          <div className="text-right text-[11px] text-zinc-400 max-w-xs space-y-1">
            <p className="flex items-center sm:justify-end gap-1.5 font-semibold text-zinc-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>UID Delivery: 5 - 15 minutes</span>
            </p>
            <p className="text-zinc-500 text-[10px]">
              Secured by PayHere Sri Lanka. Keep this receipt as proof of purchase.
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert if download fails */}
      {downloadError && (
        <div className="flex items-center gap-2 rounded-xl bg-red-950/60 border border-red-500/40 p-3 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{downloadError}</span>
        </div>
      )}

      {/* Primary Action Buttons: DOWNLOAD RECEIPT & SEND RECEIPT VIA WHATSAPP (Unlocked ONLY after server-side verification) */}
      {isPaid ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {/* Button 1: DOWNLOAD RECEIPT */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="cursor-pointer group flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 py-3.5 px-5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-xl shadow-red-950/60 hover:from-red-500 hover:to-rose-600 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloadingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Download className="w-4 h-4 text-white transition-transform group-hover:-translate-y-0.5" />
              )}
              <span>{downloadingPdf ? 'GENERATING RECEIPT...' : 'DOWNLOAD RECEIPT'}</span>
            </button>

            {/* Button 2: SEND RECEIPT VIA WHATSAPP (0742235836) */}
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer group flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 py-3.5 px-5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-xl shadow-emerald-950/60 hover:from-emerald-500 hover:to-green-600 transition-all active:scale-[0.99]"
            >
              <MessageCircle className="w-4 h-4 text-white transition-transform group-hover:scale-110" />
              <span>SEND RECEIPT VIA WHATSAPP</span>
            </a>
          </div>

          {/* Optional PNG Image Download Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left px-1">
            <p className="text-[11px] text-zinc-400">
              Clicking <strong>SEND RECEIPT VIA WHATSAPP</strong> opens WhatsApp (0742235836) with your
              verified receipt details pre-filled.
            </p>
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={downloadingPng}
              className="cursor-pointer shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
            >
              {downloadingPng ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5" />
              )}
              <span>{downloadingPng ? 'Saving PNG...' : 'Download as PNG Image'}</span>
            </button>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 p-4 text-xs text-amber-200 text-center">
          Official PDF/PNG receipt downloads and verified WhatsApp order confirmation unlock automatically once PayHere server notification verifies your payment as <strong>Successful</strong>.
        </div>
      )}
    </div>
  );
};

