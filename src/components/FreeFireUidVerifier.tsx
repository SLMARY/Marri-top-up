import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clipboard,
  X,
  Search,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export interface VerifiedPlayerAccount {
  uid: string;
  username: string;
  region: string;
}

interface FreeFireUidVerifierProps {
  value: string;
  onChange: (uid: string) => void;
  onVerified?: (account: VerifiedPlayerAccount) => void;
  onReset?: () => void;
  verifiedAccount?: VerifiedPlayerAccount | null;
}

export const FreeFireUidVerifier: React.FC<FreeFireUidVerifierProps> = ({
  value,
  onChange,
  onVerified,
  onReset,
  verifiedAccount: externalVerifiedAccount,
}) => {
  const [internalVerified, setInternalVerified] = useState<VerifiedPlayerAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pasteSuccess, setPasteSuccess] = useState(false);

  const activeVerified = externalVerifiedAccount !== undefined ? externalVerifiedAccount : internalVerified;

  // Handle manual input with numeric sanitization (max 11 digits)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericOnly = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
    onChange(numericOnly);
    setErrorMessage(null);

    // If changing after already verified, invalidate previous verification
    if (activeVerified && numericOnly !== activeVerified.uid) {
      setInternalVerified(null);
      if (onReset) onReset();
    }
  };

  // Handle clipboard paste
  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        const numericOnly = text.replace(/[^0-9]/g, '').slice(0, 11);
        if (numericOnly) {
          onChange(numericOnly);
          setErrorMessage(null);
          setPasteSuccess(true);
          setTimeout(() => setPasteSuccess(false), 1500);
        } else {
          setErrorMessage('Clipboard content did not contain a numeric Free Fire UID.');
        }
      }
    } catch {
      setErrorMessage('Clipboard permission was denied. Please paste manually.');
    }
  };

  // Reset / Clear input
  const handleClear = () => {
    onChange('');
    setErrorMessage(null);
    setInternalVerified(null);
    if (onReset) onReset();
  };

  // Verification request
  const handleVerify = async () => {
    const cleanUid = value.trim().replace(/[^0-9]/g, '');

    if (!cleanUid) {
      setErrorMessage('Please enter your Free Fire Player ID (UID).');
      return;
    }

    if (cleanUid.length < 8 || cleanUid.length > 11) {
      setErrorMessage('Free Fire UIDs must be between 8 and 11 numeric digits.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/verify-uid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ uid: cleanUid, game: 'free_fire' }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Player ID not found. Please double-check your UID.');
      }

      const account: VerifiedPlayerAccount = {
        uid: data.uid,
        username: data.username,
        region: data.region || 'SG/MY',
      };

      setInternalVerified(account);
      setShowSuccessModal(true);
      if (onVerified) {
        onVerified(account);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please check your network connection.');
      setInternalVerified(null);
      if (onReset) onReset();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* State A: Already Verified Persistent Card */}
      {activeVerified ? (
        <div className="rounded-xl border border-emerald-500/50 bg-gradient-to-r from-emerald-950/40 via-[#101918] to-emerald-950/30 p-4 shadow-lg shadow-emerald-950/30 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/90 border border-emerald-700/60 px-2 py-0.5 rounded">
                    VERIFIED ACCOUNT
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Region: {activeVerified.region}
                  </span>
                </div>
                <div className="text-base font-black text-white tracking-wide mt-0.5">
                  {activeVerified.username}
                </div>
                <div className="text-xs font-mono text-zinc-400">
                  UID: <span className="text-emerald-300 font-bold">{activeVerified.uid}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900/90 hover:bg-zinc-800 hover:border-zinc-600 px-3 py-1.5 text-xs font-bold text-zinc-300 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Change UID</span>
            </button>
          </div>
        </div>
      ) : (
        /* State B: UID Input with Paste, Clear & Verify Button */
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-zinc-300">
              Free Fire Player ID (UID) <span className="text-red-400">*</span>
            </label>
            <span className="text-[11px] text-zinc-400">8–11 Digits</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {/* Input with Paste & Clear Buttons */}
            <div className="relative flex-1">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={11}
                value={value}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleVerify();
                  }
                }}
                placeholder="e.g. 7847502560"
                className={`w-full rounded-xl bg-[#161620] pl-4 pr-20 py-3 text-sm font-mono text-white placeholder-zinc-500 focus:outline-none transition-all ${
                  errorMessage
                    ? 'border-2 border-red-500 bg-red-950/20 text-red-200 focus:ring-1 focus:ring-red-500'
                    : 'border border-zinc-800 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                }`}
              />

              {/* In-field Action Buttons (Clear & Paste) */}
              <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
                {value.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClear}
                    title="Clear UID"
                    className="cursor-pointer p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handlePaste}
                  title="Paste from clipboard"
                  className="cursor-pointer inline-flex items-center gap-1 rounded-md bg-zinc-800 hover:bg-zinc-700 px-2 py-1 text-[11px] font-semibold text-zinc-300 hover:text-white transition-colors"
                >
                  <Clipboard className="w-3 h-3 text-red-400" />
                  <span>{pasteSuccess ? 'Pasted!' : 'Paste'}</span>
                </button>
              </div>
            </div>

            {/* Prominent Verify Button */}
            <button
              type="button"
              disabled={isLoading || !value.trim()}
              onClick={handleVerify}
              className="cursor-pointer sm:w-36 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 px-5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-red-950/70 hover:from-red-500 hover:to-rose-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-red-200" />
                  <span>Verify</span>
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/40 border border-red-500/40 rounded-lg p-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Helper hint */}
          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-0.5">
            <span>Find your Free Fire UID in your in-game profile banner.</span>
            {value.length > 0 && (
              <span className="font-mono text-zinc-500">{value.length}/11 digits</span>
            )}
          </div>
        </div>
      )}

      {/* State C: Verification Success Modal Dialog */}
      {showSuccessModal && activeVerified && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-2xl border border-emerald-500/50 bg-[#0f1118] p-6 text-center shadow-2xl shadow-emerald-950/50 space-y-4 animate-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Glowing Green Success Checkmark */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/30 border border-emerald-500/50 text-emerald-400 shadow-xl shadow-emerald-950/60">
              <CheckCircle2 className="h-9 w-9 animate-bounce" />
            </div>

            {/* Title & Badge */}
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 mb-1.5">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Account Verified!</span>
              </div>
              <h3 className="font-display text-xl font-black uppercase text-white">
                Player Found
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Your Free Fire game profile was successfully verified.
              </p>
            </div>

            {/* Player Details Card */}
            <div className="rounded-xl border border-zinc-800 bg-[#161822] p-4 text-left space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-xs text-zinc-400">In-Game Nickname:</span>
                <span className="font-display font-black text-sm text-white tracking-wide">
                  {activeVerified.username}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-xs text-zinc-400">Player UID:</span>
                <span className="font-mono font-bold text-xs text-emerald-400">
                  {activeVerified.uid}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Account Region:</span>
                <span className="text-xs font-semibold text-zinc-300">
                  {activeVerified.region}
                </span>
              </div>
            </div>

            {/* Confirmation CTA */}
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 px-4 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-950 hover:from-emerald-500 hover:to-teal-500 transition-all active:scale-98"
            >
              Confirm & Continue Top-Up
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
