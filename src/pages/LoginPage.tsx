import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LogIn,
  Lock,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowLeft,
  KeyRound,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage, safeRenderText } from '../utils/errorUtils';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Forgot Password Mode
  const [forgotMode, setForgotMode] = useState<'NONE' | 'REQUEST' | 'RESET'>('NONE');
  const [resetEmail, setResetEmail] = useState('');
  const [resetWhatsapp, setResetWhatsapp] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessBanner(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login({
      email: email.trim(),
      password,
      rememberMe,
    });
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(extractErrorMessage(result.error, 'Invalid email or password.'));
      return;
    }

    // Redirect to top-up page after successful login
    navigate('/');
    setTimeout(() => {
      document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!resetEmail.trim()) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }
    if (!resetWhatsapp.trim()) {
      setErrorMessage('Please enter your registered WhatsApp number to verify ownership.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail.trim(),
          whatsappNumber: resetWhatsapp.trim(),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        setErrorMessage(
          extractErrorMessage(data?.error ?? data, 'Could not process password reset request.')
        );
      } else {
        setForgotMode('RESET');
      }
    } catch (err: unknown) {
      setErrorMessage(extractErrorMessage(err, 'Network error while requesting password reset.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail.trim(),
          whatsappNumber: resetWhatsapp.trim(),
          resetToken: resetCode.trim() || undefined,
          newPassword,
          confirmPassword: confirmNewPassword,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        setErrorMessage(extractErrorMessage(data?.error ?? data, 'Password reset failed.'));
      } else {
        setSuccessBanner('Password reset complete! You can now sign in with your new password.');
        setEmail(resetEmail.trim());
        setPassword('');
        setForgotMode('NONE');
      }
    } catch (err: unknown) {
      setErrorMessage(extractErrorMessage(err, 'Network error while resetting password.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 lg:py-20 bg-[#08080a] min-h-[85vh] relative flex items-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-950/20 blur-[140px] pointer-events-none rounded-full" />

      <div className="relative mx-auto max-w-md w-full px-4 sm:px-6">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Top-Up Portal</span>
          </Link>
        </div>

        <div className="relative rounded-2xl border border-red-500/30 bg-[#101016] shadow-2xl overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-rose-500 to-red-700" />

          <div className="p-6 sm:p-8 space-y-6">
            {forgotMode === 'NONE' ? (
              <>
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-xs font-bold text-red-400 uppercase tracking-wider">
                    <Lock className="w-3.5 h-3.5" />
                    <span>SECURE CUSTOMER PORTAL</span>
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                    Customer Login
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-400">
                    Sign in to auto-fill your saved billing details and view your top-up receipts.
                  </p>
                </div>

                {successBanner && (
                  <div className="flex items-center gap-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 p-4 text-xs text-emerald-200">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>{safeRenderText(successBanner)}</span>
                  </div>
                )}

                {errorMessage && (
                  <div className="flex items-center gap-3 rounded-xl bg-red-950/80 border border-red-500/50 p-4 text-xs text-red-200">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                    <span>{safeRenderText(errorMessage)}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. sanuka@gmail.com"
                      className="w-full rounded-lg border border-zinc-800 bg-[#161620] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-zinc-300">
                        Password <span className="text-red-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setErrorMessage(null);
                          setResetEmail(email);
                          setForgotMode('REQUEST');
                        }}
                        className="cursor-pointer text-xs font-semibold text-red-400 hover:text-red-300"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full rounded-lg border border-zinc-800 bg-[#161620] pl-4 pr-10 py-3 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="cursor-pointer absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-zinc-300 select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-red-600 focus:ring-red-500"
                      />
                      <span>Remember session securely</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full cursor-pointer flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-red-600 via-red-600 to-rose-700 py-3.5 px-6 text-sm font-extrabold uppercase tracking-wider text-white shadow-xl shadow-red-950/70 hover:from-red-500 hover:to-rose-600 disabled:opacity-50 transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Sign In to Top-Up Portal</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="flex items-center gap-2 rounded-lg bg-[#0d0d13] border border-zinc-800/80 p-3 text-[11px] text-zinc-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Once logged in, your saved billing profile automatically populates PayHere checkout.
                  </span>
                </div>

                <div className="pt-4 border-t border-zinc-800 text-center text-xs text-zinc-400">
                  New to Uchiha Marri Top Up?{' '}
                  <Link
                    to="/signup"
                    className="font-bold text-red-400 hover:text-red-300 underline underline-offset-4"
                  >
                    Create Account
                  </Link>
                </div>
              </>
            ) : forgotMode === 'REQUEST' ? (
              <div className="space-y-5">
                <div className="text-center space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-full bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h2 className="font-display text-xl font-black text-white uppercase">
                    Reset Your Password
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Enter your registered Email Address and WhatsApp Number to verify your identity and reset your password.
                  </p>
                </div>

                {errorMessage && (
                  <div className="flex items-center gap-3 rounded-xl bg-red-950/80 border border-red-500/50 p-3.5 text-xs text-red-200">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{safeRenderText(errorMessage)}</span>
                  </div>
                )}

                <form onSubmit={handleRequestResetCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Registered Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="e.g. sanuka@gmail.com"
                      className="w-full rounded-lg border border-zinc-800 bg-[#161620] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Registered WhatsApp Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={resetWhatsapp}
                      onChange={(e) => setResetWhatsapp(e.target.value)}
                      placeholder="e.g. 077 123 4567"
                      className="w-full rounded-lg border border-zinc-800 bg-[#161620] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full cursor-pointer rounded-xl bg-red-600 hover:bg-red-500 py-3 px-5 text-xs font-extrabold uppercase tracking-wider text-white transition-colors"
                  >
                    {isSubmitting ? 'Verifying Account...' : 'Verify & Generate Reset Code'}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setForgotMode('NONE');
                  }}
                  className="cursor-pointer w-full text-center text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  ← Back to Login
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="text-center space-y-2">
                  <h2 className="font-display text-xl font-black text-white uppercase">
                    Set New Password
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Choose a strong new password for your verified account.
                  </p>
                </div>

                {errorMessage && (
                  <div className="flex items-center gap-3 rounded-xl bg-red-950/80 border border-red-500/50 p-3.5 text-xs text-red-200">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{safeRenderText(errorMessage)}</span>
                  </div>
                )}

                <form onSubmit={handleConfirmResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      New Strong Password <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 chars, upper, lower & number"
                      className="w-full rounded-lg border border-zinc-800 bg-[#161620] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Confirm New Password <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full rounded-lg border border-zinc-800 bg-[#161620] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full cursor-pointer rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 px-5 text-xs font-extrabold uppercase tracking-wider text-white transition-colors"
                  >
                    {isSubmitting ? 'Updating Password...' : 'Save New Password'}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setForgotMode('NONE');
                  }}
                  className="cursor-pointer w-full text-center text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  ← Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
