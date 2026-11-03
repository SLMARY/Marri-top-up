import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  Share2,
  MessageCircle,
  Check,
  Search,
  Loader2,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
import { ReceiptPreviewCard } from '../components/ReceiptPreviewCard';
import { ReceiptData, TransactionDetails } from '../types';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage, safeRenderText } from '../utils/errorUtils';

interface ReceiptPageProps {
  businessWhatsApp?: string;
}

export const ReceiptPage: React.FC<ReceiptPageProps> = ({
  businessWhatsApp = '0742235836',
}) => {
  const { token: authToken } = useAuth();
  const [searchParams] = useSearchParams();
  const params = useParams<{ orderId?: string }>();
  const navigate = useNavigate();

  const orderIdParam = searchParams.get('order_id') || params.orderId || '';
  const statusParam = searchParams.get('status');
  const urlOrderToken = searchParams.get('token') || '';

  const [orderQuery, setOrderQuery] = useState(orderIdParam);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  // Fetch verified order details from backend (/api/payhere/verify) with owner/token authorization
  const fetchOrder = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const cleanId = id.trim().toUpperCase();
      if (urlOrderToken) {
        try {
          sessionStorage.setItem(`uchiha_order_token_${cleanId}`, urlOrderToken);
        } catch {
          // ignore
        }
      }
      const storedOrderToken =
        urlOrderToken ||
        (typeof window !== 'undefined'
          ? sessionStorage.getItem(`uchiha_order_token_${cleanId}`) || ''
          : '');

      const headers: Record<string, string> = { Accept: 'application/json' };
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }
      if (storedOrderToken) {
        headers['X-Order-Token'] = storedOrderToken;
      }

      const tokenQuery = storedOrderToken ? `&token=${encodeURIComponent(storedOrderToken)}` : '';
      const res = await fetch(
        `/api/payhere/verify?order_id=${encodeURIComponent(cleanId)}${tokenQuery}`,
        { headers }
      );
      const text = await res.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        // non-json response
      }

      if (!res.ok || !data || data.error) {
        throw new Error(
          extractErrorMessage(
            data?.error ?? data?.failureReason ?? data,
            'Order not found or you are not authorized to access this receipt.'
          )
        );
      }

      setTransaction(data);
    } catch (err: unknown) {
      console.error('Failed to load transaction:', err);
      setError(extractErrorMessage(err, 'Unable to retrieve order details.'));
      setTransaction(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderIdParam) {
      setOrderQuery(orderIdParam);
      fetchOrder(orderIdParam);
    }
  }, [orderIdParam, authToken]);

  // Real-time polling if payment is still pending (and not explicitly cancelled via cancel_url)
  useEffect(() => {
    if (
      transaction &&
      transaction.status === 'PENDING' &&
      statusParam !== 'cancelled' &&
      pollCount < 10
    ) {
      const timer = setTimeout(() => {
        setPollCount((prev) => prev + 1);
        fetchOrder(transaction.orderId);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [transaction, pollCount, statusParam]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;
    navigate(`/receipt?order_id=${encodeURIComponent(orderQuery.trim().toUpperCase())}`);
    fetchOrder(orderQuery.trim());
  };

  const handleCopyLink = () => {
    const fullUrl = window.location.href;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const isPaid = transaction?.status === 'SUCCESSFUL';
  const isCancelled =
    transaction?.status === 'CANCELLED' ||
    (transaction?.status === 'PENDING' && statusParam === 'cancelled');
  const isFailed = transaction?.status === 'FAILED';
  const isPending = transaction?.status === 'PENDING' && !isCancelled;

  const effectiveStatus: 'SUCCESSFUL' | 'PENDING' | 'FAILED' | 'CANCELLED' = isPaid
    ? 'SUCCESSFUL'
    : isCancelled
    ? 'CANCELLED'
    : isFailed
    ? 'FAILED'
    : 'PENDING';

  const rawWhatsApp = (businessWhatsApp || '0742235836').replace(/[^0-9]/g, '');
  const waTargetNumber = rawWhatsApp.startsWith('0')
    ? `94${rawWhatsApp.slice(1)}`
    : rawWhatsApp.startsWith('94')
    ? rawWhatsApp
    : `94742235836`;

  const whatsappUrl = transaction
    ? `https://wa.me/${waTargetNumber}?text=${encodeURIComponent(
        `*UCHIHA MARRI TOP UP — ORDER SUPPORT*\nOrder ID: ${transaction.orderId}\nCustomer Name: ${transaction.customerName}\nGame Name: ${transaction.gameName}\nPlayer ID: ${transaction.playerId}${transaction.serverZone ? ` (Zone: ${transaction.serverZone})` : ''}\nPackage: ${transaction.packageName || `${transaction.gameName} Top Up Credits`}\nPayment Amount: Rs. ${Number(transaction.amount).toFixed(2)} LKR\nPayment Status: ${effectiveStatus}`
      )}`
    : `https://wa.me/${waTargetNumber}`;

  // Build receipt payload
  const receiptData: ReceiptData | null = transaction
    ? {
        receiptNumber: isPaid
          ? transaction.receiptNumber ||
            `REC-2026-${transaction.orderId.replace(/[^0-9]/g, '').slice(-5) || '00000'}`
          : effectiveStatus,
        orderId: transaction.orderId,
        paymentId: transaction.paymentId || (isPaid ? `PAY-${transaction.orderId.slice(-4)}` : 'AWAITING IPN'),
        date: transaction.completedAt || transaction.createdAt || new Date().toISOString(),
        customerName: transaction.customerName,
        customerEmail: transaction.customerEmail,
        whatsappNumber: transaction.whatsappNumber,
        billingAddress: transaction.billingAddress,
        billingCity: transaction.billingCity,
        billingCountry: transaction.billingCountry,
        gameName: transaction.gameName,
        playerId: transaction.playerId,
        serverZone: transaction.serverZone,
        packageName: transaction.packageName || `${transaction.gameName} Top Up Credits`,
        amount: transaction.amount,
        currency: 'LKR',
        paymentMethod:
          transaction.paymentMethod === 'mastercard' ? 'Mastercard (PayHere)' : 'Visa Card (PayHere)',
        status: isPaid ? 'SUCCESSFUL' : isCancelled ? 'CANCELLED' : isFailed ? 'FAILED' : 'PENDING',
        businessName: 'UCHIHA MARRI TOP UP',
        country: transaction.billingCountry || 'Sri Lanka',
        paymentProvider: 'PayHere Sri Lanka',
        whatsappSupport: businessWhatsApp || '0742235836',
      }
    : null;

  return (
    <div className="py-10 sm:py-16 bg-[#08080a] min-h-[85vh] text-zinc-100 selection:bg-red-600 selection:text-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
          <span className="text-[11px] text-zinc-500 uppercase tracking-wider">
            UCHIHA MARRI TOP UP • SECURE RECEIPT PORTAL
          </span>
        </div>

        {/* State 1: Loading Order Details */}
        {loading && (
          <div className="rounded-2xl border border-zinc-800 bg-[#101017] p-12 text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-red-500 mx-auto" />
            <h2 className="text-lg font-bold text-white">Verifying Transaction with PayHere...</h2>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Querying server-side payment records and confirming gateway status.
            </p>
          </div>
        )}

        {/* State 2: No Order Selected / Order Lookup Form */}
        {!loading && !transaction && (
          <div className="rounded-2xl border border-red-500/30 bg-[#101017] p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6 shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-950/50 border border-red-500/40 text-red-400">
              <Search className="w-8 h-8" />
            </div>

            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-black uppercase text-white">
                Find Your Payment Receipt
              </h1>
              <p className="mt-2 text-xs text-zinc-400">
                Enter your Order Reference ID (e.g.{' '}
                <span className="font-mono text-red-400">UMT-892140-5219</span>) to view, verify,
                and download your official receipt.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-950/60 border border-red-500/40 p-3 text-xs text-red-300 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{safeRenderText(error)}</span>
              </div>
            )}

            <form onSubmit={handleManualSearch} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  placeholder="Enter Order ID (e.g. UMT-892140-5219)"
                  className="flex-1 rounded-xl border border-zinc-800 bg-[#161622] px-4 py-3 font-mono text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="cursor-pointer rounded-xl bg-red-600 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-500 transition-colors"
                >
                  Locate Receipt
                </button>
              </div>
              <p className="text-[11px] text-zinc-500 text-left">
                Tip: Your Order ID was generated before redirecting to PayHere.
              </p>
            </form>
          </div>
        )}

        {/* State 3: Transaction Loaded */}
        {!loading && transaction && receiptData && (
          <div className="space-y-8">
            {/* Top Banner based on server verification status */}
            {isPaid ? (
              <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/70 via-[#101018] to-emerald-950/70 p-6 sm:p-8 text-center space-y-3 shadow-2xl">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-950 border-2 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-950">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
                  PAYMENT SUCCESSFUL!
                </h1>
                <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto font-medium">
                  Thank you for choosing <span className="text-red-400 font-bold">UCHIHA MARRI TOP UP</span>. Your payment has been verified via PayHere server notification and top-up credits are being dispatched to your player UID!
                </p>
              </div>
            ) : isPending ? (
              <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/70 via-[#101018] to-amber-950/70 p-6 sm:p-8 text-center space-y-3 shadow-2xl">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-950 border-2 border-amber-500 text-amber-300 shadow-lg shadow-amber-950">
                  <Clock className="w-8 h-8 animate-pulse" />
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-black uppercase text-amber-200 tracking-tight">
                  PAYMENT PENDING VERIFICATION
                </h1>
                <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto">
                  Your order status is currently <span className="font-bold text-amber-300">Pending</span>. Orders are marked Successful only after PayHere sends a verified server notification to our backend.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => fetchOrder(transaction.orderId)}
                    className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-500 hover:text-black transition-colors"
                  >
                    <span>Refresh Verification Status</span>
                  </button>
                </div>
              </div>
            ) : isCancelled ? (
              <div className="rounded-2xl border border-red-500/40 bg-gradient-to-r from-red-950/70 via-[#101018] to-red-950/70 p-6 sm:p-8 text-center space-y-3 shadow-2xl">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-950 border-2 border-red-500 text-red-400 shadow-lg shadow-red-950">
                  <XCircle className="w-8 h-8" />
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
                  PAYMENT CANCELLED
                </h1>
                <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto">
                  {safeRenderText(
                    transaction.failureReason,
                    'Your payment checkout was cancelled before completion on PayHere.'
                  )}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-xs font-bold uppercase text-white hover:bg-red-500 transition-colors"
                  >
                    Try Again on Homepage
                  </Link>
                  <button
                    onClick={() => fetchOrder(transaction.orderId)}
                    className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold hover:bg-zinc-700 transition-colors"
                  >
                    <span>Re-check Status</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-red-500/40 bg-gradient-to-r from-red-950/70 via-[#101018] to-red-950/70 p-6 sm:p-8 text-center space-y-3 shadow-2xl">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-950 border-2 border-red-500 text-red-400 shadow-lg shadow-red-950">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
                  PAYMENT FAILED
                </h1>
                <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto">
                  {safeRenderText(
                    transaction.failureReason,
                    'Your payment transaction was declined by the bank or failed on PayHere checkout.'
                  )}
                </p>
                <div className="pt-2">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-xs font-bold uppercase text-white hover:bg-red-500 transition-colors"
                  >
                    Try Again on Homepage
                  </Link>
                </div>
              </div>
            )}

            {/* The Live Receipt Preview Card (includes DOWNLOAD RECEIPT & SEND RECEIPT VIA WHATSAPP buttons) */}
            <ReceiptPreviewCard
              receipt={receiptData}
              isPendingVerification={!isPaid}
            />

            {/* Additional Actions: WhatsApp Support & Share Receipt Link */}
            <div className="rounded-2xl border border-zinc-800 bg-[#12121c] p-5 sm:p-6 space-y-4">
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                Order Actions & Confirmation Link
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* WhatsApp Support Button */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/50 py-3 px-4 font-bold text-emerald-300 hover:bg-emerald-900/50 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Contact Admin on WhatsApp (0742235836)</span>
                </a>

                {/* Permanent Bookmark / Share Order Link */}
                <button
                  onClick={handleCopyLink}
                  className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 py-3 px-4 font-bold text-zinc-200 hover:bg-zinc-700 transition-colors"
                >
                  {copiedLink ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Share2 className="w-4 h-4 text-zinc-400" />
                  )}
                  <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Permanent Receipt Link'}</span>
                </button>
              </div>

              <div className="text-center pt-2">
                <Link
                  to="/"
                  className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                >
                  ← Return to Home Top Up Portal
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

