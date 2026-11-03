import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  ShieldCheck,
  Flame,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Lock,
  Loader2,
  Gamepad2,
  ExternalLink,
  Crown,
  Sparkles,
  Swords,
  Crosshair,
  UserCheck,
  Edit3,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { SUPPORTED_GAMES, QUICK_AMOUNTS } from '../data/games';
import {
  MEMBERSHIP_PACKAGES,
  DIAMOND_PACKAGES,
  MLBB_DIAMOND_PACKAGES,
  BLOODSTRIKE_PACKAGES,
} from '../data/packages';
import {
  MembershipPackage,
  DiamondPackage,
  MlbbDiamondPackage,
  BloodStrikePackage,
} from '../types';
import { FreeFireUidVerifier, VerifiedPlayerAccount } from './FreeFireUidVerifier';
import { useAuth } from '../context/AuthContext';
import securityBadgeImg from '../assets/images/payment_security_shield_1793641924972.jpg';

declare global {
  interface Window {
    payhere?: any;
  }
}

interface PaymentFormProps {
  onPaymentSuccess: (transaction: any) => void;
  onPaymentFailure: (errorDetails: any) => void;
  isSandboxMode: boolean;
  preselectedPackageId?: string;
  preselectedAmount?: number;
  selectedGameId?: string;
  onSelectGameId?: (gameId: string) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  onPaymentSuccess,
  onPaymentFailure,
  isSandboxMode,
  preselectedPackageId,
  preselectedAmount,
  selectedGameId: externalSelectedGameId,
  onSelectGameId,
}) => {
  const { customer, token, updateProfile } = useAuth();

  // Game Selection State (supports external control from game catalog or navbar)
  const [internalSelectedGameId, setInternalSelectedGameId] = useState(SUPPORTED_GAMES[0].id);
  const activeSelectedGameId = externalSelectedGameId !== undefined ? externalSelectedGameId : internalSelectedGameId;

  const handleGameSelect = (gameId: string) => {
    setInternalSelectedGameId(gameId);
    if (onSelectGameId) {
      onSelectGameId(gameId);
    }
  };

  const isMlbb = activeSelectedGameId === 'mobile_legends';
  const isBloodStrike = activeSelectedGameId === 'bloodstrike';

  // Package Selection State (Default: Weekly Membership 570 LKR)
  const [packageCategory, setPackageCategory] = useState<'memberships' | 'diamonds' | 'custom'>('memberships');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('weekly_membership');
  const [selectedPackageName, setSelectedPackageName] = useState<string>('Weekly Membership');

  // Form fields (For guests, or inline profile edit for logged-in customers)
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customGameName, setCustomGameName] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [serverZone, setServerZone] = useState('');
  const [verifiedFfAccount, setVerifiedFfAccount] = useState<VerifiedPlayerAccount | null>(null);
  const [amount, setAmount] = useState<number | string>(570);
  const [paymentMethod, setPaymentMethod] = useState<'visa' | 'mastercard'>('visa');

  // Inline billing review/edit toggle for logged-in customers
  const [isEditingSavedBilling, setIsEditingSavedBilling] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editCountry, setEditCountry] = useState('Sri Lanka');
  const [savingBilling, setSavingBilling] = useState(false);

  useEffect(() => {
    if (customer) {
      setEditFullName(customer.fullName);
      setEditWhatsapp(customer.whatsappNumber);
      setEditAddress(customer.billingAddress);
      setEditCity(customer.city);
      setEditCountry(customer.country || 'Sri Lanka');
    }
  }, [customer]);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSandboxCards, setShowSandboxCards] = useState(false);

  // Sync if preselected from external list
  useEffect(() => {
    if (preselectedPackageId) {
      const mem = MEMBERSHIP_PACKAGES.find((m) => m.id === preselectedPackageId);
      if (mem) {
        setPackageCategory('memberships');
        setSelectedPackageId(mem.id);
        setSelectedPackageName(mem.name);
        setAmount(mem.price);
      }
    } else if (preselectedAmount) {
      setAmount(preselectedAmount);
    }
  }, [preselectedPackageId, preselectedAmount]);

  // When game switches between Mobile Legends, Blood Strike, Free Fire, or other games
  useEffect(() => {
    if (isMlbb) {
      if (!selectedPackageId.startsWith('mlbb_')) {
        const defaultMlbb = MLBB_DIAMOND_PACKAGES[0]; // 61 Diamonds - LKR 220
        setSelectedPackageId(defaultMlbb.id);
        setSelectedPackageName(`MLBB ${defaultMlbb.name} (${defaultMlbb.baseDiamonds} + ${defaultMlbb.bonusDiamonds} Bonus)`);
        setAmount(defaultMlbb.price);
      }
    } else if (isBloodStrike) {
      if (!selectedPackageId.startsWith('bs_')) {
        const defaultBs = BLOODSTRIKE_PACKAGES[0]; // Strike Pass Elite - Rs. 1,230
        setSelectedPackageId(defaultBs.id);
        setSelectedPackageName(`Blood Strike - ${defaultBs.name}`);
        setAmount(defaultBs.price);
      }
    } else {
      if (selectedPackageId.startsWith('mlbb_') || selectedPackageId.startsWith('bs_')) {
        const mem = MEMBERSHIP_PACKAGES[1]; // Weekly Membership
        setSelectedPackageId(mem.id);
        setSelectedPackageName(mem.name);
        setAmount(mem.price);
        setPackageCategory('memberships');
      }
    }
  }, [isMlbb, isBloodStrike]);

  // Active game object
  const activeGame = SUPPORTED_GAMES.find((g) => g.id === activeSelectedGameId) || SUPPORTED_GAMES[0];
  const finalGameName = activeSelectedGameId === 'custom_game' ? customGameName || 'Custom Game' : activeGame.name;

  // Save inline billing changes for logged-in customer
  const handleSaveInlineBilling = async () => {
    setSavingBilling(true);
    const res = await updateProfile({
      fullName: editFullName.trim(),
      whatsappNumber: editWhatsapp.trim(),
      billingAddress: editAddress.trim(),
      city: editCity.trim(),
      country: editCountry.trim() || 'Sri Lanka',
    });
    setSavingBilling(false);
    if (res.success) {
      setIsEditingSavedBilling(false);
    } else {
      setErrorMessage(res.error || 'Could not update billing profile.');
    }
  };

  // Validation following the customer journey
  const validateForm = (): boolean => {
    setErrorMessage(null);

    // Step 01: Selected Game
    if (activeSelectedGameId === 'custom_game' && !customGameName.trim()) {
      setErrorMessage('Please enter the name of your game in Step 01');
      return false;
    }

    // Step 02: Player ID / UID & Zone ID (when required)
    if (!playerId.trim()) {
      setErrorMessage(
        isMlbb
          ? 'Please enter your Mobile Legends: Bang Bang Player ID (e.g. 984102914)'
          : isBloodStrike
          ? 'Please enter your Blood Strike Player ID / UID (e.g. 1092847192)'
          : 'Please enter your Player ID / UID to receive game credits'
      );
      return false;
    }

    if (isMlbb) {
      const cleanZone = serverZone.trim();
      if (!cleanZone) {
        setErrorMessage('Please enter your Mobile Legends Zone ID / Server ID (4-5 digits, e.g. 2049)');
        return false;
      }
      if (!/^\d{4,5}$/.test(cleanZone)) {
        setErrorMessage('Invalid Zone ID: Mobile Legends Zone ID must be 4 or 5 numeric digits (e.g. 2049 or 12345)');
        return false;
      }
    }

    // Step 03: Package or Top-up Amount
    const numericAmount = parseFloat(amount.toString());
    if (isNaN(numericAmount) || numericAmount < 50) {
      setErrorMessage('Minimum payment amount is Rs. 50 LKR');
      return false;
    }

    // Step 04: Only validate manual contact inputs if customer is NOT logged in
    if (!customer) {
      if (!whatsappNumber.trim() || whatsappNumber.trim().length < 9) {
        setErrorMessage('Please enter a valid WhatsApp phone number (or Sign In to use your saved profile)');
        return false;
      }

      if (!customerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
        setErrorMessage('Please enter a valid Email Address (required by PayHere for payment confirmation)');
        return false;
      }
    }

    return true;
  };

  // Real-time numeric sanitizer and validation for MLBB Zone ID
  const handleZoneIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericOnly = e.target.value.replace(/[^0-9]/g, '').slice(0, 5);
    setServerZone(numericOnly);
    if (errorMessage && errorMessage.toLowerCase().includes('zone')) {
      setErrorMessage(null);
    }
  };

  // Real-time validation states
  const isMlbbZoneValid = isMlbb && /^\d{4,5}$/.test(serverZone);
  const isMlbbZoneIncomplete = isMlbb && serverZone.length > 0 && serverZone.length < 4;

  // Redirect state if automatic redirection needs a manual click fallback
  const [redirectPayload, setRedirectPayload] = useState<{
    url: string;
    params: Record<string, any>;
    orderId: string;
  } | null>(null);

  // Safe HTTP Fetch utility that guarantees no "Unexpected end of JSON input" errors
  const safeFetchJson = async (url: string, options?: RequestInit) => {
    try {
      const res = await fetch(url, options);
      const text = await res.text();
      let json: any = null;

      if (text && text.trim().length > 0) {
        try {
          json = JSON.parse(text);
        } catch {
          console.warn('[Checkout] Non-JSON response received:', text.slice(0, 120));
        }
      }

      return {
        ok: res.ok,
        status: res.status,
        statusText: res.statusText,
        json,
        rawText: text,
      };
    } catch (networkErr: any) {
      return {
        ok: false,
        status: 0,
        statusText: 'Network Error',
        json: null,
        rawText: '',
        networkError: networkErr?.message || 'Network request failed',
      };
    }
  };

  // Standard official PayHere HTML form redirection (top-level navigation)
  const submitPayHereCheckout = (url: string, params: Record<string, any>) => {
    const existingForm = document.getElementById('payhere_redirect_form');
    if (existingForm) {
      existingForm.remove();
    }

    const form = document.createElement('form');
    form.id = 'payhere_redirect_form';
    form.method = 'POST';
    form.action = url;
    form.target = '_top';
    form.style.display = 'none';

    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = typeof val === 'object' ? JSON.stringify(val) : String(val);
        form.appendChild(input);
      }
    }

    document.body.appendChild(form);

    console.log('[PayHere] Redirecting customer to official checkout:', url);
    form.submit();
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setRedirectPayload(null);

    const numericAmount = parseFloat(amount.toString());
    const resolvedPlayerName =
      customer?.fullName ||
      (activeSelectedGameId === 'free_fire' && verifiedFfAccount?.username
        ? verifiedFfAccount.username
        : `Player ${playerId.trim()}`);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const result = await safeFetchJson('/api/payhere/initiate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          customerId: customer?.id,
          customerName: resolvedPlayerName,
          whatsappNumber: customer ? customer.whatsappNumber : whatsappNumber.trim(),
          customerEmail: customer ? customer.email : customerEmail.trim(),
          billingAddress: customer ? customer.billingAddress : undefined,
          billingCity: customer ? customer.city : undefined,
          billingCountry: customer ? customer.country : undefined,
          gameName: finalGameName,
          playerId: playerId.trim(),
          serverZone: activeGame.hasZoneId ? serverZone.trim() || undefined : undefined,
          packageId: selectedPackageId,
          packageName: selectedPackageName || `${finalGameName} Top Up Credits (${numericAmount} LKR)`,
          amount: numericAmount,
          paymentMethod,
        }),
      });

      if (!result.ok || !result.json || !result.json.success) {
        const serverError =
          result.json?.error ||
          result.json?.details ||
          (result.rawText && !result.rawText.includes('<html') ? result.rawText : null) ||
          (result.networkError ? `Connection error: ${result.networkError}` : `Server returned HTTP ${result.status} (${result.statusText})`);

        throw new Error(serverError);
      }

      const { orderId, orderAccessToken, payhereData, checkoutUrl } = result.json;

      if (!checkoutUrl || !payhereData) {
        throw new Error('Incomplete payment checkout data received from server.');
      }

      if (orderId && orderAccessToken) {
        try {
          sessionStorage.setItem(`uchiha_order_token_${orderId}`, orderAccessToken);
        } catch {
          // ignore storage quota errors
        }
      }

      setRedirectPayload({
        url: checkoutUrl,
        params: payhereData,
        orderId,
      });

      submitPayHereCheckout(checkoutUrl, payhereData);
    } catch (err: any) {
      console.error('[Payment Submit Error]:', err);
      setIsSubmitting(false);
      setErrorMessage(
        err?.message || 'An error occurred while connecting to PayHere gateway. Please try again or contact WhatsApp support.'
      );
    }
  };

  return (
    <section id="payment-section" className="py-12 lg:py-20 bg-[#0a0a0e] relative">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-950/20 blur-[140px] pointer-events-none rounded-full" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-xs font-bold text-red-400 mb-3 uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>PAYHERE 256-BIT ENCRYPTED CHECKOUT</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
            Online Gaming Payment
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto mt-2">
            Enter your top-up details and enter your custom amount in LKR. Pay with your Visa or
            Mastercard securely.
          </p>
        </div>

        {/* Payment Card Container */}
        <div className="relative rounded-2xl border border-red-500/30 bg-[#101016] shadow-2xl backdrop-blur-xl overflow-hidden">
          {/* Top Crimson Accent Header Strip */}
          <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-rose-500 to-red-700" />

          <form onSubmit={handlePaymentSubmit} className="p-6 sm:p-8 lg:p-10 space-y-8">
            {/* Error Banner */}
            {errorMessage && (
              <div className="flex items-center gap-3 rounded-lg bg-red-950/80 border border-red-500/50 p-4 text-sm text-red-200">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Authenticated Customer Saved Billing Banner OR Quick Sign-In Prompt */}
            {customer ? (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-4 sm:p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 block">
                        1-Click Saved Billing Profile Active
                      </span>
                      <span className="text-xs text-zinc-300">
                        Signed in as <strong className="text-white">{customer.fullName}</strong> ({customer.email})
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingSavedBilling(!isEditingSavedBilling)}
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900/90 px-3 py-1.5 text-[11px] font-bold text-zinc-200 hover:text-white hover:border-zinc-600 transition-colors self-start sm:self-auto"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-red-400" />
                    <span>{isEditingSavedBilling ? 'Close Editor' : 'Review / Update Billing'}</span>
                  </button>
                </div>

                {!isEditingSavedBilling ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-emerald-500/20 text-[11px] text-zinc-300">
                    <div>
                      <span className="text-zinc-500 block">WhatsApp / Mobile:</span>
                      <span className="font-mono font-semibold text-white">{customer.whatsappNumber}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-zinc-500 block">Saved Billing Address:</span>
                      <span className="font-semibold text-white">
                        {customer.billingAddress}, {customer.city}, {customer.country}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-zinc-800 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={editFullName}
                          onChange={(e) => setEditFullName(e.target.value)}
                          className="w-full rounded-lg border border-zinc-800 bg-[#161620] px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-300 mb-1">WhatsApp Number</label>
                        <input
                          type="tel"
                          value={editWhatsapp}
                          onChange={(e) => setEditWhatsapp(e.target.value)}
                          className="w-full rounded-lg border border-zinc-800 bg-[#161620] px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Billing Address</label>
                        <input
                          type="text"
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          className="w-full rounded-lg border border-zinc-800 bg-[#161620] px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-300 mb-1">City</label>
                        <input
                          type="text"
                          value={editCity}
                          onChange={(e) => setEditCity(e.target.value)}
                          className="w-full rounded-lg border border-zinc-800 bg-[#161620] px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Country</label>
                        <input
                          type="text"
                          value={editCountry}
                          onChange={(e) => setEditCountry(e.target.value)}
                          className="w-full rounded-lg border border-zinc-800 bg-[#161620] px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingSavedBilling(false)}
                        className="cursor-pointer rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={savingBilling}
                        onClick={handleSaveInlineBilling}
                        className="cursor-pointer rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-1.5 text-xs font-bold text-white"
                      >
                        {savingBilling ? 'Saving...' : 'Save Billing Details'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-red-500/30 bg-gradient-to-r from-red-950/30 via-[#14121b] to-[#14121b] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white block">
                    Want faster 1-click checkout without entering details every time?
                  </span>
                  <span className="text-[11px] text-zinc-400 block">
                    Sign in or create a free customer account to auto-fill your billing info and track all your orders.
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-bold text-white hover:border-red-500 transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5 text-red-400" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-500 px-3 py-2 text-xs font-bold text-white transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Sign Up</span>
                  </Link>
                </div>
              </div>
            )}

            {/* STEP 01 — SELECT GAME */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400">
                  <Gamepad2 className="w-4 h-4" />
                  <span>STEP 01 — SELECT GAME</span>
                </div>
                <span className="text-xs text-zinc-400">Choose your game title</span>
              </div>

              {/* Game Selector Badges / Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {SUPPORTED_GAMES.map((game) => {
                  const isSelected = activeSelectedGameId === game.id;
                  const isUnavailable = Boolean(game.unavailable);

                  return (
                    <button
                      key={game.id}
                      type="button"
                      disabled={isUnavailable}
                      onClick={() => {
                        if (!isUnavailable) {
                          handleGameSelect(game.id);
                        }
                      }}
                      className={`relative text-left p-3 rounded-lg border text-xs font-medium transition-all ${
                        isUnavailable
                          ? 'opacity-40 cursor-not-allowed border-zinc-800/60 bg-zinc-900/20 text-zinc-500 hover:border-zinc-800'
                          : isSelected
                          ? 'cursor-pointer border-red-500 bg-red-950/40 text-white shadow-sm shadow-red-950'
                          : 'cursor-pointer border-zinc-800 bg-[#14141c] text-zinc-400 hover:text-white hover:border-zinc-700'
                      }`}
                      title={isUnavailable ? `${game.name} is currently unavailable` : undefined}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className={`font-bold truncate ${isUnavailable ? 'line-through text-zinc-500' : ''}`}>
                          {game.name}
                        </div>
                        {isUnavailable && (
                          <span className="shrink-0 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                            Unavailable
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{game.category}</div>
                    </button>
                  );
                })}
              </div>

              {/* Custom game input if 'Other' selected */}
              {activeSelectedGameId === 'custom_game' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Custom Game Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customGameName}
                    onChange={(e) => setCustomGameName(e.target.value)}
                    placeholder="e.g. EA FC Mobile, Roblox, Apex Legends, etc."
                    className="w-full rounded-lg border border-zinc-800 bg-[#161620] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              )}
            </div>

            {/* STEP 02 — ENTER PLAYER ID / UID */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400">
                  <span>STEP 02 — ENTER PLAYER ID / UID</span>
                </div>
                <span className="text-xs text-zinc-400">
                  {activeGame.hasZoneId ? 'Player ID + Zone ID Required' : 'Player ID Only'}
                </span>
              </div>

              {/* Player ID and Zone / Server inputs */}
              {isMlbb ? (
                /* Dedicated Mobile Legends: Bang Bang Player ID & Zone ID inputs */
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                        <span>
                          Mobile Legends Player ID <span className="text-red-400">*</span>
                        </span>
                        <span className="text-[10px] text-zinc-400">User ID</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={playerId}
                        onChange={(e) => setPlayerId(e.target.value)}
                        placeholder="e.g. 984102914"
                        className="w-full rounded-lg border border-zinc-800 bg-[#161620] px-4 py-3 text-sm font-mono text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                      <span className="text-[11px] text-zinc-400 mt-1 block">
                        Your 8-10 digit User ID found in your MLBB profile before parentheses
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                        <span>
                          Zone ID / Server ID <span className="text-red-400">*</span>
                        </span>
                        {isMlbbZoneValid ? (
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Valid ({serverZone.length} digits)
                          </span>
                        ) : isMlbbZoneIncomplete ? (
                          <span className="text-[10px] text-amber-400 font-bold">
                            {serverZone.length}/4 min digits
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-500 font-mono">4–5 digits</span>
                        )}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={5}
                          autoComplete="off"
                          required
                          value={serverZone}
                          onChange={handleZoneIdChange}
                          placeholder="e.g. 2049"
                          className={`w-full rounded-lg bg-[#161620] pl-4 pr-10 py-3 text-sm font-mono text-white placeholder-zinc-500 focus:outline-none transition-all ${
                            isMlbbZoneValid
                              ? 'border border-emerald-500/80 bg-emerald-950/20 text-emerald-100 ring-1 ring-emerald-500/40'
                              : isMlbbZoneIncomplete
                              ? 'border border-amber-500/80 bg-amber-950/20 text-amber-100 ring-1 ring-amber-500/40'
                              : 'border border-zinc-800 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                          }`}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          {isMlbbZoneValid ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : isMlbbZoneIncomplete ? (
                            <AlertCircle className="w-4 h-4 text-amber-400 animate-pulse" />
                          ) : (
                            <span className="text-[10px] font-mono text-zinc-600">
                              {serverZone.length}/5
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Real-time helper text */}
                      <div className="mt-1 flex items-center justify-between text-[11px]">
                        {isMlbbZoneValid ? (
                          <span className="text-emerald-400 font-medium flex items-center gap-1">
                            ✓ {serverZone.length}-digit MLBB Server Code accepted
                          </span>
                        ) : isMlbbZoneIncomplete ? (
                          <span className="text-amber-400 font-medium flex items-center gap-1">
                            ⚠️ Enter 4 or 5 digits (e.g. 2049 or 12345)
                          </span>
                        ) : (
                          <span className="text-zinc-400">
                            4 or 5 digits inside parentheses
                          </span>
                        )}
                        <span className="font-mono text-[10px] text-zinc-500">
                          {serverZone.length}/5 digits
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* MLBB ID format helper */}
                  <div className="rounded-lg bg-red-950/20 border border-red-500/30 p-3 text-xs text-zinc-300 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div className="text-[11px] leading-relaxed">
                      <span className="font-bold text-white">How to find your MLBB ID & Zone ID:</span>{' '}
                      Open Mobile Legends &rarr; tap your avatar in top-left corner. Your ID appears as:{' '}
                      <span className="text-amber-300 font-mono font-bold">12345678 (2049)</span>. Enter{' '}
                      <span className="text-white font-mono font-bold">12345678</span> as Player ID and{' '}
                      <span className="text-white font-mono font-bold">2049</span> as Zone ID.
                    </div>
                  </div>
                </div>
              ) : isBloodStrike ? (
                /* Dedicated Blood Strike Player ID / UID input (Player ID only, no Zone ID) */
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                      <span>
                        Blood Strike Player ID / UID <span className="text-red-400">*</span>
                      </span>
                      <span className="text-[10px] text-amber-400 font-bold">Player ID Only</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={playerId}
                      onChange={(e) => setPlayerId(e.target.value)}
                      placeholder="e.g. 1092847192"
                      className="w-full rounded-lg border border-zinc-800 bg-[#161620] px-4 py-3 text-sm font-mono text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                    <span className="text-[11px] text-zinc-400 mt-1 block">
                      Enter your Blood Strike numeric User ID from your in-game profile banner
                    </span>
                  </div>
                </div>
              ) : activeSelectedGameId === 'free_fire' ? (
                /* Free Fire Player ID (UID) Verification System (Codashop / Smile One style) */
                <div className="pt-1">
                  <FreeFireUidVerifier
                    value={playerId}
                    onChange={(val) => setPlayerId(val)}
                    onVerified={(account) => {
                      setPlayerId(account.uid);
                      setVerifiedFfAccount(account);
                    }}
                    onReset={() => {
                      setVerifiedFfAccount(null);
                    }}
                    verifiedAccount={verifiedFfAccount}
                  />
                </div>
              ) : (
                /* Standard Player ID & Zone inputs for other titles (Zone ID shown only when required by the game) */
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div className={activeGame.hasZoneId ? 'sm:col-span-2' : 'sm:col-span-3'}>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Player ID / UID <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={playerId}
                      onChange={(e) => setPlayerId(e.target.value)}
                      placeholder={activeGame.placeholderUid}
                      className="w-full rounded-lg border border-zinc-800 bg-[#161620] px-4 py-3 text-sm font-mono text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                    <span className="text-[11px] text-zinc-400 mt-1 block">
                      Find this on your in-game profile banner
                    </span>
                  </div>

                  {activeGame.hasZoneId && (
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        {activeGame.zoneLabel || 'Server / Zone'}
                      </label>
                      <input
                        type="text"
                        value={serverZone}
                        onChange={(e) => setServerZone(e.target.value)}
                        placeholder="e.g. 2049"
                        className="w-full rounded-lg border border-zinc-800 bg-[#161620] px-4 py-3 text-sm font-mono text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* STEP 03 — SELECT PACKAGE OR AMOUNT */}
            {isMlbb ? (
              /* DEDICATED MOBILE LEGENDS: BANG BANG DIAMOND PACKAGES VIEW ONLY */
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>STEP 03 — SELECT PACKAGE OR AMOUNT (MLBB LKR)</span>
                  </div>
                  <span className="text-xs font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded">
                    9 Official MLBB Packages
                  </span>
                </div>

                {/* MLBB Game Logo & Title Banner */}
                <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-gradient-to-r from-blue-950/40 via-[#181126] to-[#12121c] border border-cyan-900/40 shadow-inner">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 via-cyan-500 to-indigo-600 p-0.5 shadow-md flex items-center justify-center shrink-0">
                    <div className="w-full h-full bg-[#0d0f18] rounded-[6px] flex items-center justify-center">
                      <Swords className="w-5 h-5 text-cyan-300" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-black text-sm text-white tracking-wide uppercase">
                        Mobile Legends: Bang Bang
                      </h4>
                      <span className="text-[10px] font-bold text-cyan-300 uppercase bg-cyan-950/80 border border-cyan-700/50 px-1.5 py-0.2 rounded">
                        MLBB
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Official In-Game Diamonds with Guaranteed Bonus Amounts & Instant Account Delivery
                    </p>
                  </div>
                </div>

                {/* Grid of 9 Official MLBB Diamond Packages */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {MLBB_DIAMOND_PACKAGES.map((pkg) => {
                    const isSelected = selectedPackageId === pkg.id;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => {
                          setSelectedPackageId(pkg.id);
                          setSelectedPackageName(`MLBB ${pkg.name} (${pkg.baseDiamonds} + ${pkg.bonusDiamonds} Bonus)`);
                          setAmount(pkg.price);
                        }}
                        className={`cursor-pointer text-left p-4 rounded-xl border transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? 'border-red-500 bg-gradient-to-b from-[#2a131c] via-[#1c1222] to-[#14121a] ring-2 ring-red-500 shadow-xl shadow-red-950 scale-[1.01]'
                            : 'border-zinc-800 bg-[#12121a] hover:border-zinc-700 hover:bg-[#161622]'
                        }`}
                      >
                        {/* Header: Diamonds & Badge */}
                        <div className="flex items-start justify-between gap-1 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center shrink-0">
                              <Sparkles className="w-4 h-4 text-cyan-300" />
                            </div>
                            <div>
                              <span className="font-display font-black text-base text-white block">
                                {pkg.name}
                              </span>
                              <span className="text-[11px] font-semibold text-cyan-300">
                                {pkg.baseDiamonds} + {pkg.bonusDiamonds} Bonus
                              </span>
                            </div>
                          </div>
                          {pkg.badge && (
                            <span
                              className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider ${
                                pkg.popular
                                  ? 'bg-red-500/30 text-red-300 border border-red-500/50'
                                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              }`}
                            >
                              {pkg.badge}
                            </span>
                          )}
                        </div>

                        {/* Bonus breakdown pill */}
                        <div className="my-1.5 flex items-center justify-between text-xs bg-zinc-900/80 border border-zinc-800/80 px-2.5 py-1.5 rounded-lg">
                          <span className="text-zinc-400 text-[11px]">Bonus Included:</span>
                          <span className="font-bold text-amber-300 font-mono text-xs">
                            +{pkg.bonusDiamonds} Bonus Diamonds
                          </span>
                        </div>

                        {/* Price & Selection Check */}
                        <div className="flex items-baseline justify-between pt-2.5 mt-1 border-t border-zinc-800/80">
                          <span className="text-[10px] text-zinc-500 uppercase font-semibold">Official Price</span>
                          <div className="flex items-center gap-2">
                            <span className="font-display font-black text-base sm:text-lg text-red-400 font-mono">
                              Rs. {pkg.price.toLocaleString('en-US')} LKR
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-center gap-2 rounded-lg bg-zinc-900/60 border border-zinc-800 py-2.5 px-4 text-center text-xs text-zinc-400">
                  <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Official fixed MLBB package prices in LKR. Delivered directly to your Player ID & Zone ID.</span>
                </div>
              </div>
            ) : isBloodStrike ? (
              /* DEDICATED BLOOD STRIKE TOP-UP PACKAGES VIEW ONLY (9 PACKAGES) */
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400">
                    <Crosshair className="w-4 h-4 text-amber-400" />
                    <span>STEP 03 — SELECT PACKAGE OR AMOUNT (BLOOD STRIKE LKR)</span>
                  </div>
                  <span className="text-xs font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                    9 Official Blood Strike Packages
                  </span>
                </div>

                {/* Blood Strike Game Banner */}
                <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-gradient-to-r from-red-950/50 via-[#1c1118] to-[#12121c] border border-red-900/40 shadow-inner">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 via-amber-500 to-rose-700 p-0.5 shadow-md flex items-center justify-center shrink-0">
                    <div className="w-full h-full bg-[#0d0f18] rounded-[6px] flex items-center justify-center">
                      <Crosshair className="w-5 h-5 text-amber-400" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-black text-sm text-white tracking-wide uppercase">
                        Blood Strike Top-Up
                      </h4>
                      <span className="text-[10px] font-bold text-amber-300 uppercase bg-amber-950/80 border border-amber-700/50 px-1.5 py-0.2 rounded">
                        PASSES & GOLD
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Official Strike Passes, Level Up Pass & Bonus Gold Packs • Instant UID Delivery
                    </p>
                  </div>
                </div>

                {/* Unified 9-Card Grid of Official Blood Strike Packages */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {BLOODSTRIKE_PACKAGES.map((pkg) => {
                    const isSelected = selectedPackageId === pkg.id;
                    const isPass = pkg.category === 'pass';
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => {
                          setSelectedPackageId(pkg.id);
                          setSelectedPackageName(`Blood Strike - ${pkg.name}`);
                          setAmount(pkg.price);
                        }}
                        className={`cursor-pointer text-left p-4 rounded-xl border transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? 'border-red-500 bg-gradient-to-b from-[#2a131c] via-[#1c1222] to-[#14121a] ring-2 ring-red-500 shadow-xl shadow-red-950 scale-[1.01]'
                            : 'border-zinc-800 bg-[#12121a] hover:border-zinc-700 hover:bg-[#161622]'
                        }`}
                      >
                        {/* Header: Package Name & PASS / GOLD Badge */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                                isPass
                                  ? 'bg-gradient-to-br from-red-500/25 to-rose-600/30 border-red-500/40'
                                  : 'bg-gradient-to-br from-amber-500/25 to-yellow-600/30 border-amber-500/40'
                              }`}
                            >
                              {isPass ? (
                                <Crown className="w-4 h-4 text-red-300" />
                              ) : (
                                <Sparkles className="w-4 h-4 text-amber-300" />
                              )}
                            </div>
                            <div>
                              <span className="font-display font-black text-base text-white block leading-snug">
                                {pkg.name}
                              </span>
                              <span className="text-[11px] font-semibold text-zinc-400">
                                {pkg.subtitle}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider shrink-0 ${
                              isPass
                                ? 'bg-red-500/25 text-red-300 border border-red-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {pkg.badge}
                          </span>
                        </div>

                        {/* Details row */}
                        <div className="my-1.5 flex items-center justify-between text-xs bg-zinc-900/80 border border-zinc-800/80 px-2.5 py-1.5 rounded-lg">
                          <span className="text-zinc-400 text-[11px]">
                            {isPass ? 'Pass Benefit:' : 'Bonus Gold:'}
                          </span>
                          <span className="font-bold text-amber-300 font-mono text-xs">
                            {pkg.bonusText}
                          </span>
                        </div>

                        {/* Price & Selection Check */}
                        <div className="flex items-baseline justify-between pt-2.5 mt-1 border-t border-zinc-800/80">
                          <span className="text-[10px] text-zinc-500 uppercase font-semibold">Official Price</span>
                          <div className="flex items-center gap-2">
                            <span className="font-display font-black text-base sm:text-lg text-red-400 font-mono tabular-nums">
                              Rs. {pkg.price.toLocaleString('en-US')}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-center gap-2 rounded-lg bg-zinc-900/60 border border-zinc-800 py-2.5 px-4 text-center text-xs text-zinc-400">
                  <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Official Blood Strike package prices in LKR. Delivered directly to your Blood Strike Player ID.</span>
                </div>
              </div>
            ) : (
              /* FREE FIRE & STANDARD GAMES VIEW: Memberships, Free Fire Diamonds, Custom LKR */
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span>STEP 03 — SELECT PACKAGE OR AMOUNT (LKR)</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400">Official 2026 Prices</span>
                </div>

                {/* Package Category Selector Tabs */}
                <div className="grid grid-cols-3 gap-2 p-1.5 rounded-xl bg-[#14141d] border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      setPackageCategory('memberships');
                      const mem = MEMBERSHIP_PACKAGES.find((m) => m.id === selectedPackageId) || MEMBERSHIP_PACKAGES[1];
                      setSelectedPackageId(mem.id);
                      setSelectedPackageName(mem.name);
                      setAmount(mem.price);
                    }}
                    className={`cursor-pointer py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      packageCategory === 'memberships'
                        ? 'bg-red-600 text-white shadow-lg shadow-red-950'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-300" />
                    <span>Memberships (7)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPackageCategory('diamonds');
                      const dia = DIAMOND_PACKAGES[2];
                      setSelectedPackageId(dia.id);
                      setSelectedPackageName(`${dia.name} (${finalGameName})`);
                      setAmount(dia.price);
                    }}
                    className={`cursor-pointer py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      packageCategory === 'diamonds'
                        ? 'bg-red-600 text-white shadow-lg shadow-red-950'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Diamond Packs</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPackageCategory('custom');
                      setSelectedPackageId('custom_amount');
                      setSelectedPackageName('Custom Top Up Credits');
                    }}
                    className={`cursor-pointer py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      packageCategory === 'custom'
                        ? 'bg-red-600 text-white shadow-lg shadow-red-950'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>⚡ Custom LKR</span>
                  </button>
                </div>

                {/* View 1: 7 Official Memberships */}
                {packageCategory === 'memberships' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {MEMBERSHIP_PACKAGES.map((pkg) => {
                        const isSelected = selectedPackageId === pkg.id;
                        return (
                          <button
                            key={pkg.id}
                            type="button"
                            onClick={() => {
                              setSelectedPackageId(pkg.id);
                              setSelectedPackageName(pkg.name);
                              setAmount(pkg.price);
                            }}
                            className={`cursor-pointer text-left p-3.5 rounded-xl border transition-all relative flex flex-col justify-between ${
                              isSelected
                                ? 'border-red-500 bg-gradient-to-b from-[#241219] to-[#15101a] ring-2 ring-red-500 shadow-lg shadow-red-950'
                                : 'border-zinc-800 bg-[#14141c] hover:border-zinc-700 hover:bg-[#181824]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1 mb-1">
                              <span className="font-bold text-white text-xs sm:text-sm">
                                {pkg.name}
                              </span>
                              {pkg.badge && (
                                <span
                                  className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                    pkg.popular
                                      ? 'bg-red-500/30 text-red-300 border border-red-500/40'
                                      : 'bg-purple-500/30 text-purple-300 border border-purple-500/40'
                                  }`}
                                >
                                  {pkg.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-400 mb-2">{pkg.duration}</div>
                            <div className="flex items-baseline justify-between pt-1 border-t border-zinc-800/80">
                              <span className="text-[10px] text-zinc-500 uppercase font-semibold">Price</span>
                              <span className="font-display font-black text-sm sm:text-base text-red-400 font-mono">
                                Rs. {pkg.price.toLocaleString('en-US')} LKR
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-[11px] text-zinc-400 block text-center">
                      All 7 memberships updated with official 2026 prices. Direct in-game delivery.
                    </span>
                  </div>
                )}

                {/* View 2: Free Fire Diamond Packages */}
                {packageCategory === 'diamonds' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {DIAMOND_PACKAGES.map((pkg) => {
                        const isSelected = selectedPackageId === pkg.id;
                        return (
                          <button
                            key={pkg.id}
                            type="button"
                            onClick={() => {
                              setSelectedPackageId(pkg.id);
                              setSelectedPackageName(`${pkg.name} (${finalGameName})`);
                              setAmount(pkg.price);
                            }}
                            className={`cursor-pointer text-left p-3.5 rounded-xl border transition-all relative flex flex-col justify-between ${
                              isSelected
                                ? 'border-red-500 bg-red-950/40 ring-2 ring-red-500 shadow-md'
                                : 'border-zinc-800 bg-[#14141c] hover:border-zinc-700'
                            }`}
                          >
                            <div className="font-bold text-white text-xs sm:text-sm">
                              {pkg.name}
                            </div>
                            <div className="text-[11px] text-cyan-400 mt-0.5">
                              +{pkg.bonus} Bonus Diamonds
                            </div>
                            <div className="font-mono font-bold text-red-400 text-sm mt-2 pt-1 border-t border-zinc-800">
                              Rs. {pkg.price.toLocaleString('en-US')} LKR
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* View 3: Custom Amount & Quick presets */}
                {packageCategory === 'custom' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {QUICK_AMOUNTS.map((q) => {
                        const isSelected = parseFloat(amount.toString()) === q.amount;
                        return (
                          <button
                            key={q.amount}
                            type="button"
                            onClick={() => {
                              setAmount(q.amount);
                              setSelectedPackageId('custom_amount');
                              setSelectedPackageName(`Custom Top Up Credits (${q.amount} LKR)`);
                            }}
                            className={`cursor-pointer py-2 px-2 rounded-lg border text-xs font-bold transition-all text-center ${
                              isSelected
                                ? 'border-red-500 bg-red-600 text-white shadow-md shadow-red-950'
                                : 'border-zinc-800 bg-[#161620] text-zinc-300 hover:border-zinc-700 hover:text-white'
                            }`}
                          >
                            {q.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom amount entry */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Enter Custom Top-Up Amount (LKR) <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-sm font-bold text-red-400 font-mono">
                          Rs.
                        </div>
                        <input
                          type="number"
                          min="50"
                          step="10"
                          required
                          value={amount}
                          onChange={(e) => {
                            setAmount(e.target.value);
                            setSelectedPackageId('custom_amount');
                            setSelectedPackageName(`Custom Top Up Credits (${e.target.value} LKR)`);
                          }}
                          placeholder="Enter custom amount in LKR"
                          className="w-full rounded-lg border border-zinc-800 bg-[#161620] pl-14 pr-16 py-3.5 text-base font-bold font-mono text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-xs font-bold text-zinc-400">
                          LKR
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 04 — CUSTOMER DETAILS (Only shown for guests; logged-in customers use their saved profile automatically) */}
            {!customer && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400">
                    <span>STEP 04 — ENTER WHATSAPP NUMBER AND REQUIRED CUSTOMER DETAILS</span>
                  </div>
                  <span className="text-xs text-zinc-400">Or Sign In above to auto-fill</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      WhatsApp Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="e.g. 077 123 4567 or +94 77 123 4567"
                      className="w-full rounded-lg border border-zinc-800 bg-[#161620] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors"
                    />
                    <span className="text-[11px] text-zinc-400 mt-1 block">
                      Used for your top-up order receipt & WhatsApp confirmation
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                      <span>
                        Email Address <span className="text-red-400">*</span>
                      </span>
                      <span className="text-[10px] text-amber-400/90 font-semibold">
                        Required by PayHere
                      </span>
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="e.g. sanuka@gmail.com"
                      className="w-full rounded-lg border border-zinc-800 bg-[#161620] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors"
                    />
                    <span className="text-[11px] text-zinc-400 mt-1 block">
                      Required by the official PayHere gateway to email your payment receipt
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* CHOOSE VISA OR MASTERCARD & PAY NOW */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400">
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {customer
                      ? 'STEP 04 — CHOOSE VISA OR MASTERCARD & PAY NOW'
                      : 'STEP 05 — CLICK PAY NOW AND COMPLETE PAYMENT THROUGH PAYHERE'}
                  </span>
                </div>
                <span className="text-xs text-emerald-400 font-medium">No Card Info Stored</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Visa Card Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('visa')}
                  className={`cursor-pointer relative flex items-center justify-between p-4 rounded-xl border transition-all ${
                    paymentMethod === 'visa'
                      ? 'border-red-500 bg-red-950/30 ring-1 ring-red-500'
                      : 'border-zinc-800 bg-[#14141c] hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 rounded bg-white flex items-center justify-center p-1 font-black text-blue-900 tracking-tighter text-sm italic">
                      VISA
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-sm text-white">Visa Card</div>
                      <div className="text-[11px] text-zinc-400">Debit or Credit Card</div>
                    </div>
                  </div>
                  {paymentMethod === 'visa' && (
                    <CheckCircle2 className="w-5 h-5 text-red-400" />
                  )}
                </button>

                {/* Mastercard Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mastercard')}
                  className={`cursor-pointer relative flex items-center justify-between p-4 rounded-xl border transition-all ${
                    paymentMethod === 'mastercard'
                      ? 'border-red-500 bg-red-950/30 ring-1 ring-red-500'
                      : 'border-zinc-800 bg-[#14141c] hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 rounded bg-[#181820] border border-zinc-700 flex items-center justify-center gap-0.5">
                      <div className="w-4 h-4 rounded-full bg-red-600 opacity-90" />
                      <div className="w-4 h-4 rounded-full bg-amber-500 -ml-2 opacity-90" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-sm text-white">Mastercard</div>
                      <div className="text-[11px] text-zinc-400">Debit or Credit Card</div>
                    </div>
                  </div>
                  {paymentMethod === 'mastercard' && (
                    <CheckCircle2 className="w-5 h-5 text-red-400" />
                  )}
                </button>
              </div>

              {/* PCI-DSS & PayHere Guarantee Notice */}
              <div className="flex items-start gap-3 rounded-lg bg-[#0e0e14] border border-zinc-800/80 p-3.5 text-xs text-zinc-300">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-white">
                    Secure PayHere Sri Lanka 3D-Secure Payment
                  </p>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    We never ask for or store your card numbers or CVV. When you click Pay Now,
                    you are safely redirected to the PayHere certified payment processor with
                    One-Time Password (OTP) verification.
                  </p>
                </div>
              </div>
            </div>

            {/* Total Summary Strip */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl bg-zinc-900/90 border border-zinc-800 p-5">
              <div>
                <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block">
                  Top-Up Summary
                </span>
                <div className="flex flex-wrap items-baseline gap-2 mt-0.5">
                  <span className="text-lg font-bold text-white">{finalGameName}</span>
                  <span className="text-xs text-zinc-400">
                    {isMlbb
                      ? `(${playerId ? `ID: ${playerId}` : 'ID required'}${
                          serverZone ? ` | Zone: ${serverZone}` : ' | Zone required'
                        })`
                      : isBloodStrike
                      ? `(${playerId ? `UID: ${playerId}` : 'Player ID required'})`
                      : verifiedFfAccount
                      ? `(UID: ${playerId} • IGN: ${verifiedFfAccount.username})`
                      : `(${playerId || 'UID required'}${
                          activeGame.hasZoneId && serverZone ? ` | Zone: ${serverZone}` : ''
                        })`}
                  </span>
                </div>
                <div className="text-xs text-red-400 font-bold mt-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Selected Package: {selectedPackageName}</span>
                </div>
              </div>

              <div className="text-right sm:text-right">
                <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block">
                  Total Payable Amount
                </span>
                <span className="font-display text-2xl sm:text-3xl font-black text-red-400 font-mono">
                  Rs. {Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} LKR
                </span>
              </div>
            </div>

            {/* Visible Redirection Status & Manual Action Fallback */}
            {redirectPayload && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-5 text-center space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Opening PayHere Secure Checkout (Order: {redirectPayload.orderId})...</span>
                </div>
                <p className="text-xs text-zinc-300">
                  If PayHere does not open automatically in your browser within 3 seconds, click below:
                </p>
                <button
                  type="button"
                  onClick={() => submitPayHereCheckout(redirectPayload.url, redirectPayload.params)}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-5 shadow-lg shadow-emerald-950 transition-all active:scale-95"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Proceed to PayHere Checkout Now</span>
                </button>
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full cursor-pointer relative group flex items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-red-600 via-red-600 to-rose-700 py-4 px-6 text-base font-extrabold uppercase tracking-wider text-white shadow-xl shadow-red-950/80 glow-red hover:from-red-500 hover:to-rose-600 hover:shadow-red-600/50 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>Connecting to PayHere Secure Gateway...</span>
                </>
              ) : (
                <>
                  <Flame className="w-5 h-5 text-red-200 transition-transform group-hover:scale-110" />
                  <span>
                    PAY NOW VIA {paymentMethod.toUpperCase()} (Rs.{' '}
                    {Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })} LKR)
                  </span>
                </>
              )}
            </button>

            {/* Sandbox Test Card Reference */}
            <div className="pt-2 border-t border-zinc-800/80">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowSandboxCards(!showSandboxCards)}
                  className="cursor-pointer text-xs font-semibold text-zinc-400 hover:text-red-400 flex items-center gap-1.5 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showSandboxCards ? 'Hide Sandbox Test Cards' : 'Test Sandbox Visa/Mastercard info'}</span>
                </button>
                <span className="text-[11px] text-amber-400/90 font-semibold">
                  {isSandboxMode ? 'PayHere Sandbox Mode Enabled' : 'PayHere Gateway Ready'}
                </span>
              </div>

              {/* Expandable Sandbox Card Info */}
              {showSandboxCards && (
                <div className="mt-3 p-4 rounded-lg bg-[#0e0e14] border border-zinc-800 text-xs text-zinc-300 space-y-2">
                  <p className="font-bold text-white flex items-center gap-2">
                    <span>PayHere Official Sandbox Test Cards (for testing payments on PayHere Checkout):</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
                    <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                      <span className="text-zinc-400 block font-sans text-xs">Visa Test Card</span>
                      <span className="text-white font-bold block select-all">4111 1111 1111 1111</span>
                      <span className="text-zinc-400">Exp: Any future date (e.g. 12/28) · CVV: 123</span>
                    </div>
                    <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                      <span className="text-zinc-400 block font-sans text-xs">Mastercard Test Card</span>
                      <span className="text-white font-bold block select-all">5105 1051 0510 5100</span>
                      <span className="text-zinc-400">Exp: Any future date · CVV: 123 · OTP: 123456</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
