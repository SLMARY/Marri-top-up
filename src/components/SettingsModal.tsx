import React, { useState, useEffect } from 'react';
import { Settings, X, Shield, Check, AlertCircle, KeyRound, Phone, Server, Lock } from 'lucide-react';
import { PayHereConfig } from '../types';
import { useAuth } from '../context/AuthContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const { token } = useAuth();
  const [config, setConfig] = useState<PayHereConfig | null>(null);
  const [merchantId, setMerchantId] = useState('');
  const [merchantSecret, setMerchantSecret] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [isSandbox, setIsSandbox] = useState(true);
  const [businessWhatsApp, setBusinessWhatsApp] = useState('+94771234567');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/payhere/config')
        .then(async (res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const text = await res.text();
          return text ? JSON.parse(text) : {};
        })
        .then((data: PayHereConfig) => {
          setConfig(data);
          setMerchantId(data.merchantId || '');
          setIsSandbox(data.isSandbox ?? true);
          setBusinessWhatsApp(data.businessWhatsApp || '+94771234567');
          setSavedSuccess(false);
          setErrorMessage(null);
        })
        .catch((err) => console.error('Failed to load PayHere config:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSavedSuccess(false);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      if (adminSecret.trim()) {
        headers['X-Admin-Secret'] = adminSecret.trim();
      }

      const res = await fetch('/api/payhere/config', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          merchantId: merchantId.trim(),
          merchantSecret: merchantSecret.trim() || undefined,
          isSandbox,
          businessWhatsApp: businessWhatsApp.trim(),
          adminSecret: adminSecret.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        let errMsg = 'Failed to update settings';
        try {
          const parsed = JSON.parse(text);
          if (parsed.error) errMsg = parsed.error;
        } catch {
          if (text) errMsg = text;
        }
        throw new Error(errMsg);
      }

      setSavedSuccess(true);
      onConfigUpdated();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error updating settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-red-500/30 bg-[#111118] p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-red-500" />
            <h3 className="font-display font-bold text-lg text-white">
              Business & PayHere Gateway Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer text-zinc-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {savedSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 p-3 text-emerald-300">
              <Check className="w-4 h-4 shrink-0" />
              <span>Settings successfully saved on backend!</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2 rounded-lg bg-red-950/60 border border-red-500/40 p-3 text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Gateway Environment Toggle */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-zinc-400" />
              <span>PayHere Gateway Mode:</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsSandbox(true)}
                className={`py-2 px-3 rounded-lg border font-bold text-center transition-all ${
                  isSandbox
                    ? 'border-amber-500 bg-amber-950/40 text-amber-300'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                Sandbox Mode (Testing)
              </button>
              <button
                type="button"
                onClick={() => setIsSandbox(false)}
                className={`py-2 px-3 rounded-lg border font-bold text-center transition-all ${
                  !isSandbox
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                Live Mode (Production)
              </button>
            </div>
            <span className="text-[11px] text-zinc-400 mt-1 block">
              {isSandbox
                ? 'Sandbox lets you test Visa & Mastercard checkout without real money.'
                : 'Live mode processes real payments through your verified PayHere Merchant Account.'}
            </span>
          </div>

          {/* PayHere Merchant ID */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
              <span>PayHere Merchant ID:</span>
            </label>
            <input
              type="text"
              value={merchantId}
              onChange={(e) => setMerchantId(e.target.value)}
              placeholder="e.g. 1211149 or your merchant ID"
              className="w-full rounded-lg border border-zinc-800 bg-[#161622] px-3.5 py-2.5 font-mono text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
            />
          </div>

          {/* PayHere Merchant Secret */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-zinc-400" />
              <span>PayHere Merchant Secret:</span>
            </label>
            <input
              type="password"
              value={merchantSecret}
              onChange={(e) => setMerchantSecret(e.target.value)}
              placeholder={config?.hasCustomSecret ? '•••••••••••••••• (Leave blank to keep current)' : 'Enter Merchant Secret'}
              className="w-full rounded-lg border border-zinc-800 bg-[#161622] px-3.5 py-2.5 font-mono text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
            />
            <span className="text-[11px] text-zinc-400 mt-1 block">
              Never exposed to frontend code. Handled exclusively on the server for MD5 hash signing.
            </span>
          </div>

          {/* Business WhatsApp Number */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-zinc-400" />
              <span>Business WhatsApp Number:</span>
            </label>
            <input
              type="text"
              value={businessWhatsApp}
              onChange={(e) => setBusinessWhatsApp(e.target.value)}
              placeholder="+94 77 123 4567"
              className="w-full rounded-lg border border-zinc-800 bg-[#161622] px-3.5 py-2.5 font-mono text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
            />
            <span className="text-[11px] text-zinc-400 mt-1 block">
              Floating WhatsApp button & customer support links will point to this number.
            </span>
          </div>

          {/* Administrator Secret Key */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-red-400" />
              <span>Admin Authorization Key (or sign in as Admin):</span>
            </label>
            <input
              type="password"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              placeholder="Enter ADMIN_SECRET (optional if signed in as admin)"
              className="w-full rounded-lg border border-zinc-800 bg-[#161622] px-3.5 py-2.5 font-mono text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full cursor-pointer rounded-lg bg-red-600 py-2.5 px-4 font-bold text-white uppercase tracking-wider hover:bg-red-500 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
