import React from 'react';
import { XCircle, RefreshCw, MessageCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { safeRenderText } from '../utils/errorUtils';

interface FailedViewProps {
  errorDetails?: {
    orderId?: string;
    customerName?: string;
    gameName?: string;
    playerId?: string;
    amount?: number;
    reason?: unknown;
  };
  onTryAgain: () => void;
  businessWhatsApp: string;
}

export const FailedView: React.FC<FailedViewProps> = ({
  errorDetails,
  onTryAgain,
  businessWhatsApp,
}) => {
  const cleanPhone = (businessWhatsApp || '0742235836').replace(/[^0-9]/g, '');
  const safeReason = safeRenderText(
    errorDetails?.reason,
    'We were unable to process your payment through the PayHere gateway. No charges were deducted from your account.'
  );
  const safeOrderId = safeRenderText(errorDetails?.orderId, 'N/A');
  const safeGameName = safeRenderText(errorDetails?.gameName, '');

  const message = `Hello Uchiha Marri Top Up, my payment failed.
Order ID: ${safeOrderId}
Amount: Rs. ${errorDetails?.amount || 0} LKR
Reason: ${safeReason}
Could you please assist me?`;

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  return (
    <div className="py-12 lg:py-20 bg-[#09090d] min-h-[80vh] flex items-center justify-center">
      <div className="mx-auto max-w-xl px-4 sm:px-6 w-full">
        {/* Failed Card Container */}
        <div className="relative rounded-2xl border border-red-500/40 bg-[#121014] shadow-2xl overflow-hidden p-6 sm:p-10 text-center">
          {/* Top Red Accent Glow */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700" />

          {/* Animated Failed Badge */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-950/70 border-2 border-red-500 text-red-500 shadow-lg shadow-red-950/60">
            <XCircle className="h-12 w-12" />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-red-950/50 border border-red-500/30 px-3.5 py-1 text-xs font-bold text-red-400 uppercase tracking-widest mb-3">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>TRANSACTION DECLINED / CANCELED</span>
          </div>

          {/* Prompt exact text requirement: "PAYMENT FAILED!" */}
          <h1 className="font-display text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
            PAYMENT FAILED!
          </h1>
          <p className="mt-2 text-sm text-zinc-300 max-w-md mx-auto">
            {safeReason}
          </p>

          {/* Details breakdown */}
          {errorDetails && (
            <div className="mt-6 rounded-xl border border-zinc-800 bg-[#17141b] p-4 text-xs text-left space-y-2">
              {errorDetails.orderId && (
                <div className="flex justify-between">
                  <span className="text-zinc-400">Order ID:</span>
                  <span className="font-mono text-white font-bold">{safeOrderId}</span>
                </div>
              )}
              {safeGameName && (
                <div className="flex justify-between">
                  <span className="text-zinc-400">Game Target:</span>
                  <span className="text-white font-bold">{safeGameName}</span>
                </div>
              )}
              {errorDetails.amount && (
                <div className="flex justify-between">
                  <span className="text-zinc-400">Attempted Amount:</span>
                  <span className="font-mono text-red-400 font-bold">
                    Rs. {Number(errorDetails.amount).toLocaleString()} LKR
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Common reasons tip */}
          <div className="mt-6 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-left text-xs text-zinc-400 space-y-1.5">
            <p className="font-bold text-white mb-1">Common reasons for payment issues:</p>
            <p>• Online e-commerce or international transactions might be locked on your card.</p>
            <p>• 3D-Secure SMS OTP was missed or expired during bank verification.</p>
            <p>• Insufficient account balance in your bank account.</p>
          </div>

          {/* Action Buttons: Try Again & WhatsApp Support */}
          <div className="mt-8 space-y-3">
            {/* Try Again Button */}
            <button
              onClick={onTryAgain}
              className="w-full cursor-pointer flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 py-3.5 px-6 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/60 hover:from-red-500 hover:to-rose-600 transition-all active:scale-[0.99]"
            >
              <RefreshCw className="w-4 h-4 text-white" />
              <span>Try Again</span>
            </button>

            {/* WhatsApp Support Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/50 py-3.5 px-6 text-sm font-bold text-emerald-300 hover:bg-emerald-900/50 hover:border-emerald-400 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Contact WhatsApp Support for Manual Top-Up</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
