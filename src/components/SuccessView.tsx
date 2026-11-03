import React, { useState } from 'react';
import {
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  Check,
  Copy,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ReceiptPreviewCard } from './ReceiptPreviewCard';
import { ReceiptData } from '../types';

interface SuccessViewProps {
  transaction: any;
  onNewTopUp: () => void;
  businessWhatsApp: string;
}

export const SuccessView: React.FC<SuccessViewProps> = ({
  transaction,
  onNewTopUp,
  businessWhatsApp,
}) => {
  const [copied, setCopied] = useState(false);

  const orderId = transaction.orderId || 'UMT-LIVE-VERIFIED';
  const customerName = transaction.customerName || 'Customer';
  const amount = transaction.amount || 0;
  const gameName = transaction.gameName || 'Game Credits';
  const playerId = transaction.playerId || 'N/A';
  const serverZone = transaction.serverZone;
  const paymentMethod = transaction.paymentMethod || 'Visa/Mastercard';
  const paymentId = transaction.paymentId || `PAY-${orderId.slice(-4)}`;
  const date = transaction.completedAt || transaction.createdAt || new Date().toISOString();
  const packageName = transaction.packageName || `${gameName} Top Up Credits`;
  const receiptNumber =
    transaction.receiptNumber ||
    `REC-2026-${orderId.replace(/[^0-9]/g, '').slice(-5) || '00000'}`;

  const receiptData: ReceiptData = {
    receiptNumber,
    orderId,
    paymentId,
    date,
    customerName,
    customerEmail: transaction.customerEmail,
    whatsappNumber: transaction.whatsappNumber || '0742235836',
    billingAddress: transaction.billingAddress,
    billingCity: transaction.billingCity,
    billingCountry: transaction.billingCountry,
    gameName,
    playerId,
    serverZone,
    packageName,
    amount,
    currency: 'LKR',
    paymentMethod: paymentMethod.toLowerCase().includes('mastercard') ? 'Mastercard (PayHere)' : 'Visa Card (PayHere)',
    status: 'SUCCESSFUL',
    businessName: 'UCHIHA MARRI TOP UP',
    country: transaction.billingCountry || 'Sri Lanka',
    paymentProvider: 'PayHere Sri Lanka',
    whatsappSupport: businessWhatsApp || '0742235836',
  };

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rawWhatsApp = (businessWhatsApp || '0742235836').replace(/[^0-9]/g, '');
  const waTargetNumber = rawWhatsApp.startsWith('0')
    ? `94${rawWhatsApp.slice(1)}`
    : rawWhatsApp.startsWith('94')
    ? rawWhatsApp
    : `94742235836`;

  const whatsappConfirmationText = `*UCHIHA MARRI TOP UP — PAYMENT RECEIPT*
Order ID: ${orderId}
Customer Name: ${customerName}
Game Name: ${gameName}
Player ID: ${playerId}${serverZone ? ` (Zone: ${serverZone})` : ''}
Package: ${packageName}
Payment Amount: Rs. ${Number(amount).toFixed(2)} LKR
Payment Status: Successful
Payment Date: ${new Date(date).toLocaleString('en-US')}`;

  const whatsappUrl = `https://wa.me/${waTargetNumber}?text=${encodeURIComponent(
    whatsappConfirmationText
  )}`;

  return (
    <div className="py-10 sm:py-16 bg-[#09090d] min-h-[85vh] flex items-center justify-center">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 w-full space-y-8">
        {/* Top Success Banner */}
        <div className="relative rounded-2xl border border-emerald-500/30 bg-[#101017] shadow-2xl overflow-hidden p-6 sm:p-8 text-center">
          {/* Top Emerald Accent Glow */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

          {/* Animated Success Badge */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-950/70 border-2 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-950/60">
            <CheckCircle2 className="h-10 w-10 animate-in zoom-in-75 duration-300" />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-950/40 border border-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PAYHERE VERIFIED TRANSACTION</span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            PAYMENT SUCCESSFUL!
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-300 max-w-md mx-auto">
            Thank you for choosing <span className="text-red-400 font-bold">UCHIHA MARRI TOP UP</span>. Your payment in Sri Lankan Rupees has been securely received!
          </p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-xs text-zinc-400 font-mono">Order ID: {orderId}</span>
            <button
              onClick={handleCopyOrderId}
              className="cursor-pointer flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-300 font-medium transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Live Interactive Receipt Preview Card with Dual PDF and PNG download buttons */}
        <ReceiptPreviewCard
          receipt={receiptData}
          isPendingVerification={false}
        />

        {/* Actions & WhatsApp Support */}
        <div className="space-y-3 pt-2">
          {/* Direct WhatsApp Confirmation Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/50 py-3.5 px-6 text-sm font-bold text-emerald-300 hover:bg-emerald-900/50 hover:border-emerald-400 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>Notify Admin on WhatsApp for Instant Delivery</span>
          </a>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              onClick={onNewTopUp}
              className="cursor-pointer text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              ← Make Another Game Top Up
            </button>

            <Link
              to={`/receipt?order_id=${encodeURIComponent(orderId)}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
            >
              <span>View Permanent Receipt Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
