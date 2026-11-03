import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  User,
  ShoppingBag,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  LogOut,
  Save,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  MessageCircle,
  History,
  ArrowLeft,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ReceiptPreviewCard } from '../components/ReceiptPreviewCard';
import { ReceiptData, TransactionDetails } from '../types';

type DashboardTab =
  | 'profile'
  | 'orders'
  | 'history'
  | 'successful'
  | 'pending'
  | 'failed'
  | 'receipt';

interface DashboardPageProps {
  businessWhatsApp?: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  businessWhatsApp = '0742235836',
}) => {
  const { customer, token, isLoading, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = (searchParams.get('tab') as DashboardTab) || 'orders';
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);

  // Orders state
  const [orders, setOrders] = useState<TransactionDetails[]>([]);
  const [summary, setSummary] = useState({ total: 0, successful: 0, pending: 0, failed: 0 });
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<TransactionDetails | null>(null);

  // Profile form state
  const [fullName, setFullName] = useState(customer?.fullName || '');
  const [whatsappNumber, setWhatsappNumber] = useState(customer?.whatsappNumber || '');
  const [billingAddress, setBillingAddress] = useState(customer?.billingAddress || '');
  const [city, setCity] = useState(customer?.city || '');
  const [country, setCountry] = useState(customer?.country || 'Sri Lanka');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!customer) {
      navigate('/login');
      return;
    }
    setFullName(customer.fullName || '');
    setWhatsappNumber(customer.whatsappNumber || '');
    setBillingAddress(customer.billingAddress || '');
    setCity(customer.city || '');
    setCountry(customer.country || 'Sri Lanka');
  }, [customer, isLoading, navigate]);

  const fetchCustomerOrders = useCallback(async () => {
    if (!token) return;
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/customer/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        const loadedOrders: TransactionDetails[] = Array.isArray(data.orders) ? data.orders : [];
        setOrders(loadedOrders);
        setSummary(data.summary || { total: 0, successful: 0, pending: 0, failed: 0 });
        if (loadedOrders.length > 0) {
          setSelectedOrder((prev) => prev || loadedOrders[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load customer orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isLoading && token) {
      fetchCustomerOrders();
    }
  }, [isLoading, token, fetchCustomerOrders]);

  const handleTabChange = (tab: DashboardTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    setSavingProfile(true);

    const result = await updateProfile({
      fullName: fullName.trim(),
      whatsappNumber: whatsappNumber.trim(),
      billingAddress: billingAddress.trim(),
      city: city.trim(),
      country: country.trim() || 'Sri Lanka',
      currentPassword: currentPassword || undefined,
      newPassword: newPassword || undefined,
    });

    setSavingProfile(false);
    if (!result.success) {
      setProfileMessage({ type: 'error', text: result.error || 'Failed to update profile.' });
    } else {
      setCurrentPassword('');
      setNewPassword('');
      setProfileMessage({
        type: 'success',
        text: 'Your billing profile has been updated and will be used automatically on your next checkout!',
      });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="py-24 bg-[#08080a] min-h-[85vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        <p className="text-xs font-semibold text-zinc-400">Verifying your customer session...</p>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  // Filtered orders based on active tab
  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'successful') return order.status === 'SUCCESSFUL';
    if (activeTab === 'pending') return order.status === 'PENDING';
    if (activeTab === 'failed') return order.status === 'FAILED' || order.status === 'CANCELLED';
    return true;
  });

  const buildReceiptFromOrder = (order: TransactionDetails): ReceiptData => {
    const isPaid = order.status === 'SUCCESSFUL';
    return {
      receiptNumber: isPaid
        ? order.receiptNumber || `REC-2026-${order.orderId.replace(/[^0-9]/g, '').slice(-5) || '00000'}`
        : order.status,
      orderId: order.orderId,
      paymentId: order.paymentId || (isPaid ? `PAY-${order.orderId.slice(-4)}` : 'AWAITING IPN'),
      date: order.completedAt || order.createdAt || new Date().toISOString(),
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      whatsappNumber: order.whatsappNumber,
      billingAddress: order.billingAddress,
      billingCity: order.billingCity,
      billingCountry: order.billingCountry,
      gameName: order.gameName,
      playerId: order.playerId,
      serverZone: order.serverZone,
      packageName: order.packageName || `${order.gameName} Top Up Credits`,
      amount: order.amount,
      currency: order.currency || 'LKR',
      paymentMethod:
        order.paymentMethod === 'mastercard' ? 'Mastercard (PayHere)' : 'Visa Card (PayHere)',
      status: isPaid
        ? 'SUCCESSFUL'
        : order.status === 'CANCELLED'
        ? 'CANCELLED'
        : order.status === 'FAILED'
        ? 'FAILED'
        : 'PENDING',
      businessName: 'UCHIHA MARRI TOP UP',
      country: order.billingCountry || 'Sri Lanka',
      paymentProvider: 'PayHere Sri Lanka',
      whatsappSupport: businessWhatsApp || '0742235836',
    };
  };

  const rawWhatsApp = (businessWhatsApp || '0742235836').replace(/[^0-9]/g, '');
  const waTargetNumber = rawWhatsApp.startsWith('0')
    ? `94${rawWhatsApp.slice(1)}`
    : rawWhatsApp.startsWith('94')
    ? rawWhatsApp
    : `94742235836`;

  return (
    <div className="py-10 sm:py-16 bg-[#08080a] min-h-[85vh]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Top-Up Portal</span>
            </Link>
            <h1 className="font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Customer Account Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Welcome back, <span className="text-red-400 font-bold">{customer.fullName}</span> ({customer.email})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-red-950/60 hover:from-red-500 hover:to-rose-600 transition-all"
            >
              <span>+ New Game Top Up</span>
            </Link>
            <button
              onClick={handleLogout}
              className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-[#14141d] px-4 py-2.5 text-xs font-bold text-zinc-300 hover:text-red-400 hover:border-red-500/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => handleTabChange('orders')}
            className="cursor-pointer text-left rounded-xl border border-zinc-800 bg-[#101016] p-4 hover:border-zinc-700 transition-all"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
              Total Orders
            </span>
            <span className="font-display text-2xl font-black text-white font-mono mt-1 block">
              {summary.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('successful')}
            className="cursor-pointer text-left rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 hover:border-emerald-500/50 transition-all"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
              Successful Payments
            </span>
            <span className="font-display text-2xl font-black text-emerald-300 font-mono mt-1 block">
              {summary.successful}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('pending')}
            className="cursor-pointer text-left rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 hover:border-amber-500/50 transition-all"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
              Pending Payments
            </span>
            <span className="font-display text-2xl font-black text-amber-300 font-mono mt-1 block">
              {summary.pending}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('failed')}
            className="cursor-pointer text-left rounded-xl border border-red-500/30 bg-red-950/20 p-4 hover:border-red-500/50 transition-all"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 block">
              Failed / Cancelled
            </span>
            <span className="font-display text-2xl font-black text-red-300 font-mono mt-1 block">
              {summary.failed}
            </span>
          </button>
        </div>

        {/* Dashboard Layout: Sidebar Navigation + Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Navigation Menu */}
          <div className="rounded-2xl border border-zinc-800 bg-[#101016] p-3 space-y-1.5 h-fit">
            <button
              type="button"
              onClick={() => handleTabChange('profile')}
              className={`w-full cursor-pointer flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                activeTab === 'profile'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-950'
                  : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>My Profile & Saved Billing</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('orders')}
              className={`w-full cursor-pointer flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-950'
                  : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span>My Orders</span>
              </span>
              <span className="font-mono text-[11px] opacity-80">{summary.total}</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('history')}
              className={`w-full cursor-pointer flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-950'
                  : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <History className="w-4 h-4 shrink-0" />
              <span>Payment History</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('successful')}
              className={`w-full cursor-pointer flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                activeTab === 'successful'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-950'
                  : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Successful Payments</span>
              </span>
              <span className="font-mono text-[11px] opacity-80">{summary.successful}</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('pending')}
              className={`w-full cursor-pointer flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                activeTab === 'pending'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-950'
                  : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Pending Payments</span>
              </span>
              <span className="font-mono text-[11px] opacity-80">{summary.pending}</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('failed')}
              className={`w-full cursor-pointer flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                activeTab === 'failed'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-950'
                  : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>Failed Payments</span>
              </span>
              <span className="font-mono text-[11px] opacity-80">{summary.failed}</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('receipt')}
              className={`w-full cursor-pointer flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                activeTab === 'receipt'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-950'
                  : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 text-pink-400 shrink-0" />
              <span>Receipt / Order Details</span>
            </button>

            <div className="pt-2 mt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full cursor-pointer flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold text-red-400 hover:bg-red-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Right Main Panel */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' ? (
              <div className="rounded-2xl border border-zinc-800 bg-[#101016] p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div>
                    <h2 className="font-display text-xl font-black text-white uppercase">
                      My Profile & Saved Billing Information
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      These details are automatically used for 1-click PayHere checkout so you never have to re-type them.
                    </p>
                  </div>
                  <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                </div>

                {profileMessage && (
                  <div
                    className={`flex items-center gap-3 rounded-xl border p-4 text-xs ${
                      profileMessage.type === 'success'
                        ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
                        : 'bg-red-950/70 border-red-500/40 text-red-200'
                    }`}
                  >
                    {profileMessage.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                    )}
                    <span>{profileMessage.text}</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-lg border border-zinc-800 bg-[#161620] px-4 py-3 text-sm text-white focus:border-red-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Email Address (Account Login)
                      </label>
                      <input
                        type="email"
                        disabled
                        value={customer.email}
                        className="w-full rounded-lg border border-zinc-800/60 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-400 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        WhatsApp / Mobile Number <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        className="w-full rounded-lg border border-zinc-800 bg-[#161620] px-4 py-3 text-sm text-white focus:border-red-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Billing Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={billingAddress}
                        onChange={(e) => setBillingAddress(e.target.value)}
                        className="w-full rounded-lg border border-zinc-800 bg-[#161620] px-4 py-3 text-sm text-white focus:border-red-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        City <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full rounded-lg border border-zinc-800 bg-[#161620] px-4 py-3 text-sm text-white focus:border-red-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Country <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full rounded-lg border border-zinc-800 bg-[#161620] px-4 py-3 text-sm text-white focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Optional Password Change */}
                  <div className="pt-4 border-t border-zinc-800 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Change Password (Optional)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Leave blank to keep current password"
                          className="w-full rounded-lg border border-zinc-800 bg-[#161620] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                          New Strong Password
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 8 chars, upper, lower & number"
                          className="w-full rounded-lg border border-zinc-800 bg-[#161620] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-red-950 transition-all disabled:opacity-50"
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Profile & Billing Details</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : activeTab === 'receipt' ? (
              <div className="space-y-6">
                <div className="rounded-2xl border border-zinc-800 bg-[#101016] p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="font-display text-xl font-black text-white uppercase">
                        Receipt & Order Details
                      </h2>
                      <p className="text-xs text-zinc-400">
                        Select any of your orders below to inspect its verified receipt, download PDF/PNG, or contact WhatsApp support.
                      </p>
                    </div>
                    {orders.length > 0 && (
                      <select
                        value={selectedOrder?.orderId || ''}
                        onChange={(e) => {
                          const found = orders.find((o) => o.orderId === e.target.value);
                          if (found) setSelectedOrder(found);
                        }}
                        className="rounded-lg border border-zinc-700 bg-[#161620] px-3 py-2 text-xs font-mono text-white focus:border-red-500 focus:outline-none"
                      >
                        {orders.map((o) => (
                          <option key={o.orderId} value={o.orderId}>
                            {o.orderId} — {o.gameName} (Rs. {o.amount} LKR) [{o.status}]
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {selectedOrder ? (
                  <div className="space-y-4">
                    <ReceiptPreviewCard
                      receipt={buildReceiptFromOrder(selectedOrder)}
                      isPendingVerification={selectedOrder.status !== 'SUCCESSFUL'}
                    />
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-[#101016] p-4">
                      <Link
                        to={`/receipt?order_id=${encodeURIComponent(selectedOrder.orderId)}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300"
                      >
                        <span>Open Standalone Verification Page</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      {selectedOrder.status === 'SUCCESSFUL' && (
                        <a
                          href={`https://wa.me/${waTargetNumber}?text=${encodeURIComponent(
                            `*UCHIHA MARRI TOP UP — VERIFIED ORDER*\nCustomer Name: ${selectedOrder.customerName}\nOrder ID: ${selectedOrder.orderId}\nGame Name: ${selectedOrder.gameName}\nPlayer UID: ${selectedOrder.playerId}${selectedOrder.serverZone ? ` (Zone: ${selectedOrder.serverZone})` : ''}\nPackage: ${selectedOrder.packageName}\nPayment Status: ${selectedOrder.status}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Send Order Details on WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-zinc-800 bg-[#101016] p-12 text-center space-y-3">
                    <FileText className="w-10 h-10 text-zinc-600 mx-auto" />
                    <p className="text-sm font-bold text-white">No Order Selected</p>
                    <p className="text-xs text-zinc-400">
                      Place your first gaming top-up order to view and download official receipts here.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-800 bg-[#101016] p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div>
                    <h2 className="font-display text-xl font-black text-white uppercase">
                      {activeTab === 'orders'
                        ? 'My Orders'
                        : activeTab === 'history'
                        ? 'Complete Payment History'
                        : activeTab === 'successful'
                        ? 'Successful Payments'
                        : activeTab === 'pending'
                        ? 'Pending Payments'
                        : 'Failed & Cancelled Payments'}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Showing {filteredOrders.length} record{filteredOrders.length === 1 ? '' : 's'} linked to your customer account.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={fetchCustomerOrders}
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-xs font-bold text-zinc-200 hover:bg-zinc-700 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {loadingOrders ? (
                  <div className="py-12 text-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto" />
                    <p className="text-xs text-zinc-400">Loading your orders...</p>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="py-12 text-center space-y-4">
                    <ShoppingBag className="w-10 h-10 text-zinc-600 mx-auto" />
                    <div>
                      <p className="text-sm font-bold text-white">No matching orders found</p>
                      <p className="text-xs text-zinc-400 mt-1">
                        Ready to top up your favorite game? Your saved billing profile is ready for 1-click checkout.
                      </p>
                    </div>
                    <Link
                      to="/"
                      className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 px-5 py-2.5 text-xs font-bold uppercase text-white transition-colors"
                    >
                      Go to Top-Up Portal
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredOrders.map((order) => {
                      const isPaid = order.status === 'SUCCESSFUL';
                      const isPending = order.status === 'PENDING';
                      return (
                        <div
                          key={order.orderId}
                          className="rounded-xl border border-zinc-800 bg-[#14141c] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-700 transition-all"
                        >
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-bold text-white bg-zinc-900 border border-zinc-700 px-2.5 py-0.5 rounded">
                                {order.orderId}
                              </span>
                              <span
                                className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                                  isPaid
                                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                                    : isPending
                                    ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                                    : 'bg-red-950/60 border-red-500/40 text-red-300'
                                }`}
                              >
                                {order.status}
                              </span>
                              <span className="text-[11px] text-zinc-500">
                                {new Date(order.createdAt).toLocaleString('en-US')}
                              </span>
                            </div>

                            <div className="text-sm font-bold text-white">
                              {order.gameName} — <span className="text-red-400">{order.packageName}</span>
                            </div>

                            <div className="text-xs text-zinc-400 flex flex-wrap items-center gap-3">
                              <span>
                                Player UID: <strong className="font-mono text-zinc-200">{order.playerId}</strong>
                                {order.serverZone ? ` (Zone: ${order.serverZone})` : ''}
                              </span>
                              <span>•</span>
                              <span className="uppercase">Method: {order.paymentMethod}</span>
                              {order.paymentId && (
                                <>
                                  <span>•</span>
                                  <span className="font-mono text-emerald-400">Ref: {order.paymentId}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 border-zinc-800/80 pt-3 sm:pt-0">
                            <span className="font-display text-lg font-black text-red-400 font-mono">
                              Rs. {Number(order.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} LKR
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  handleTabChange('receipt');
                                }}
                                className="cursor-pointer rounded-lg bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-[11px] font-bold text-white transition-colors"
                              >
                                View Receipt
                              </button>
                              <Link
                                to={`/receipt?order_id=${encodeURIComponent(order.orderId)}`}
                                className="rounded-lg border border-red-500/40 bg-red-950/30 hover:bg-red-900/40 px-3 py-1.5 text-[11px] font-bold text-red-300 transition-colors"
                              >
                                Verify Status
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
