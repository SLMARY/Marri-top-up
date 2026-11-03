import React, { useState } from 'react';
import { Search, X, Loader2, CheckCircle2, AlertCircle, Download, FileText, Image as ImageIcon } from 'lucide-react';
import { downloadReceiptPdf, downloadReceiptPng, ReceiptData } from '../utils/receiptGenerator';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage, safeRenderText } from '../utils/errorUtils';

interface OrderLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessWhatsApp: string;
}

export const OrderLookupModal: React.FC<OrderLookupModalProps> = ({
  isOpen,
  onClose,
  businessWhatsApp,
}) => {
  const { token: authToken } = useAuth();
  const [orderQuery, setOrderQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingPng, setDownloadingPng] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const cleanId = orderQuery.trim().toUpperCase();
      const storedOrderToken =
        typeof window !== 'undefined'
          ? sessionStorage.getItem(`uchiha_order_token_${cleanId}`) || ''
          : '';
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
        // ignore non-json
      }
      if (!res.ok || !data || data.error) {
        throw new Error(
          extractErrorMessage(
            data?.error ?? data,
            'Transaction not found or you are not authorized to view this order.'
          )
        );
      }
      setResult(data);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Failed to locate order.'));
    } finally {
      setLoading(false);
    }
  };

  const buildReceiptData = (): ReceiptData | null => {
    if (!result) return null;
    const isSuccess = result.status === 'SUCCESSFUL';
    return {
      receiptNumber: isSuccess
        ? result.receiptNumber || `REC-2026-${result.orderId.replace(/[^0-9]/g, '').slice(-5) || '00000'}`
        : result.status,
      orderId: result.orderId,
      customerName: result.customerName,
      customerEmail: result.customerEmail,
      whatsappNumber: result.whatsappNumber,
      billingAddress: result.billingAddress,
      billingCity: result.billingCity,
      billingCountry: result.billingCountry,
      gameName: result.gameName,
      playerId: result.playerId,
      serverZone: result.serverZone,
      packageName: result.packageName || `${result.gameName} Top Up Credits`,
      amount: result.amount,
      currency: result.currency || 'LKR',
      paymentMethod: result.paymentMethod || 'Visa/Mastercard',
      paymentId: result.paymentId || (isSuccess ? `PAY-${result.orderId.slice(-4)}` : 'AWAITING IPN'),
      date: result.completedAt || result.createdAt,
      status: isSuccess ? 'SUCCESSFUL' : result.status || 'PENDING',
      businessName: 'UCHIHA MARRI TOP UP',
      country: result.billingCountry || 'Sri Lanka',
      paymentProvider: 'PayHere Sri Lanka',
      whatsappSupport: businessWhatsApp || '0742235836',
    };
  };

  const handleDownloadPdf = async () => {
    const data = buildReceiptData();
    if (!data) return;
    setDownloadingPdf(true);
    try {
      await downloadReceiptPdf(data);
    } catch (err) {
      console.error('Error generating PDF receipt:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadPng = async () => {
    const data = buildReceiptData();
    if (!data) return;
    setDownloadingPng(true);
    try {
      await downloadReceiptPng(data);
    } catch (err) {
      console.error('Error generating PNG receipt:', err);
    } finally {
      setDownloadingPng(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-red-500/30 bg-[#111118] p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-red-500" />
            <h3 className="font-display font-bold text-lg text-white">
              Verify Order & Download Receipt
            </h3>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer text-zinc-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input form */}
        <form onSubmit={handleSearch} className="space-y-3">
          <label className="block text-xs font-semibold text-zinc-300">
            Enter your Transaction / Order ID:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              required
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              placeholder="e.g. UMT-892140-5219"
              className="flex-1 rounded-lg border border-zinc-800 bg-[#161622] px-3.5 py-2.5 text-sm font-mono text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-500 disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </button>
          </div>
          <p className="text-[11px] text-zinc-400">
            You received your Order ID on screen immediately after initiating your top-up.
          </p>
        </form>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-950/60 border border-red-500/40 p-3 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{safeRenderText(error)}</span>
          </div>
        )}

        {/* Search Result Card */}
        {result && (
          <div className="rounded-xl border border-zinc-800 bg-[#161622] p-4 text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="font-mono font-bold text-white text-sm">{result.orderId}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  result.status === 'SUCCESSFUL'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                    : 'bg-zinc-800 text-zinc-300'
                }`}
              >
                {result.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-zinc-300">
              <div>
                <span className="text-zinc-500 block text-[10px]">Customer:</span>
                <span className="font-semibold text-white">{result.customerName}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">Game & UID:</span>
                <span className="font-semibold text-white">
                  {result.gameName} ({result.playerId})
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">Amount Paid:</span>
                <span className="font-mono font-bold text-red-400">
                  Rs. {Number(result.amount).toLocaleString()} LKR
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">Payment Method:</span>
                <span className="font-semibold text-white uppercase">{result.paymentMethod}</span>
              </div>
            </div>

            {/* Receipt Download Buttons & Full Receipt Link */}
            {result.status === 'SUCCESSFUL' ? (
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleDownloadPdf}
                    disabled={downloadingPdf}
                    className="cursor-pointer flex items-center justify-center gap-1.5 rounded-lg bg-red-600/25 border border-red-500/40 py-2 px-3 text-[11px] font-bold text-red-300 hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                  >
                    {downloadingPdf ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
                    <span>{downloadingPdf ? 'PDF...' : 'PDF Receipt'}</span>
                  </button>

                  <button
                    onClick={handleDownloadPng}
                    disabled={downloadingPng}
                    className="cursor-pointer flex items-center justify-center gap-1.5 rounded-lg bg-purple-600/25 border border-purple-500/40 py-2 px-3 text-[11px] font-bold text-purple-300 hover:bg-purple-600 hover:text-white transition-all disabled:opacity-50"
                  >
                    {downloadingPng ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3" />}
                    <span>{downloadingPng ? 'PNG...' : 'PNG Receipt'}</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    window.location.href = `/receipt?order_id=${encodeURIComponent(result.orderId)}`;
                  }}
                  className="w-full cursor-pointer text-center text-[11px] text-zinc-400 hover:text-white flex items-center justify-center gap-1 pt-1 transition-colors"
                >
                  <span>View Full Official Receipt Page</span>
                  <span>→</span>
                </button>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-300 text-center">
                Payment is currently {result.status}. Paid receipts are unlocked upon verified PayHere confirmation.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
