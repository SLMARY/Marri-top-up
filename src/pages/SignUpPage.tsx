import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserPlus,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowLeft,
  Lock,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage, safeRenderText } from '../utils/errorUtils';

export const SignUpPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Sri Lanka');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live password strength checks
  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  const isPasswordStrong = hasMinLen && hasUpper && hasLower && hasNumberOrSymbol;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage('Please enter your Full Name (at least 2 characters).');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Please enter a valid Email Address.');
      return;
    }
    if (!whatsappNumber.trim() || whatsappNumber.replace(/[^0-9]/g, '').length < 9) {
      setErrorMessage('Please enter a valid WhatsApp / Mobile Number (at least 9 digits).');
      return;
    }
    if (!billingAddress.trim() || billingAddress.trim().length < 3) {
      setErrorMessage('Please enter your Billing Address.');
      return;
    }
    if (!city.trim() || city.trim().length < 2) {
      setErrorMessage('Please enter your City.');
      return;
    }
    if (!country.trim()) {
      setErrorMessage('Please enter your Country.');
      return;
    }
    if (!isPasswordStrong) {
      setErrorMessage(
        'Please create a strong password with at least 8 characters, including uppercase, lowercase, and a number or symbol.'
      );
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please confirm your password.');
      return;
    }

    setIsSubmitting(true);
    const result = await register({
      fullName: fullName.trim(),
      email: email.trim(),
      whatsappNumber: whatsappNumber.trim(),
      billingAddress: billingAddress.trim(),
      city: city.trim(),
      country: country.trim() || 'Sri Lanka',
      password,
      confirmPassword,
    });
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(extractErrorMessage(result.error, 'Could not create account. Please try again.'));
      return;
    }

    // Redirect to top-up portal checkout
    navigate('/');
    setTimeout(() => {
      document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  return (
    <div className="py-12 lg:py-20 bg-[#08080a] min-h-[85vh] relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-950/20 blur-[140px] pointer-events-none rounded-full" />

      <div className="relative mx-auto max-w-2xl px-4 sm:px-6">
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

          <div className="p-6 sm:p-8 lg:p-10 space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-xs font-bold text-red-400 uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5" />
                <span>FAST 1-CLICK CHECKOUT ACCOUNT</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                Create Customer Account
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                Save your billing details once for instant PayHere gaming top-ups and access your complete order & receipt history.
              </p>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-3 rounded-xl bg-red-950/80 border border-red-500/50 p-4 text-xs sm:text-sm text-red-200">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <span>{safeRenderText(errorMessage)}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sanuka Kumara"
                    className="w-full rounded-lg border border-zinc-800 bg-[#161620] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

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
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    WhatsApp / Mobile Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="e.g. 077 123 4567"
                    className="w-full rounded-lg border border-zinc-800 bg-[#161620] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Billing Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    placeholder="e.g. No. 138/4a, Temple Rd, Madulawa"
                    className="w-full rounded-lg border border-zinc-800 bg-[#161620] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
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
                    placeholder="e.g. Padukka / Colombo"
                    className="w-full rounded-lg border border-zinc-800 bg-[#161620] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
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
                    placeholder="Sri Lanka"
                    className="w-full rounded-lg border border-zinc-800 bg-[#161620] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
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

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Confirm Password <span className="text-red-400">*</span>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full rounded-lg border border-zinc-800 bg-[#161620] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Password Strength Checklist */}
              <div className="rounded-xl border border-zinc-800/80 bg-[#13131b] p-3.5 text-xs space-y-2">
                <span className="font-bold text-zinc-300 block">Password Security Requirements:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                  <div className={`flex items-center gap-1.5 ${hasMinLen ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>At least 1 uppercase letter (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>At least 1 lowercase letter (a-z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumberOrSymbol ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>At least 1 number or symbol</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-lg bg-[#0d0d13] border border-zinc-800/80 p-3 text-[11px] text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Your password is encrypted with PBKDF2-SHA512 cryptographic hashing and never stored in plain text. Your billing details are used exclusively to pre-fill official PayHere checkouts.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full cursor-pointer flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-red-600 via-red-600 to-rose-700 py-3.5 px-6 text-sm font-extrabold uppercase tracking-wider text-white shadow-xl shadow-red-950/70 hover:from-red-500 hover:to-rose-600 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Secure Account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account & Continue to Top-Up</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-zinc-800 text-center text-xs text-zinc-400">
              Already have a customer account?{' '}
              <Link to="/login" className="font-bold text-red-400 hover:text-red-300 underline underline-offset-4">
                Sign In Here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
