import React from 'react';
import { Flame, ShieldCheck, Zap, ArrowRight, MessageCircle, CreditCard, FileText } from 'lucide-react';
import heroBgImg from '../assets/images/uchiha_gaming_hero_1793641925856.jpg';
import logoImg from '../assets/images/uchiha_marri_official_logo.jpeg';

interface HeroProps {
  onPayNowClick: () => void;
  businessWhatsApp: string;
}

export const Hero: React.FC<HeroProps> = ({ onPayNowClick, businessWhatsApp }) => {
  const digits = businessWhatsApp.replace(/[^0-9]/g, '');
  const cleanPhone = digits.startsWith('0') ? '94' + digits.slice(1) : digits.startsWith('94') ? digits : '94' + digits;
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    'Hello Uchiha Marri Top Up! I need assistance with a gaming top-up.'
  )}`;

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-red-950/40">
      {/* Background Anime Gaming Hero Image with dark scrim overlays */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBgImg}
          alt="Uchiha Gaming Top Up Background"
          className="h-full w-full object-cover object-top opacity-30 filter brightness-90 saturate-125"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#08080a]/90 via-[#08080a]/80 to-[#08080a]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-950/30 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Logo Badge & Brand Banner */}
            <div className="inline-flex items-center gap-3 rounded-full bg-red-950/60 border border-red-500/30 px-3.5 py-1.5 shadow-inner">
              <img
                src={logoImg}
                alt="Logo Icon"
                className="w-5 h-5 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="text-xs font-bold tracking-wider uppercase text-red-300">
                OFFICIAL SRI LANKA GAMING TOP-UP
              </span>
            </div>

            {/* Main Welcome Headline */}
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase leading-[1.08] text-balance">
              FAST, SAFE & EASY{' '}
              <span className="bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 bg-clip-text text-transparent">
                GAMING TOP UPS
              </span>
            </h1>

            {/* Sub-headline */}
            <p
              className="text-base sm:text-lg text-zinc-300 max-w-2xl leading-relaxed"
              style={{
                paddingLeft: '143px',
                paddingTop: '0px',
                paddingRight: '-15px',
                paddingBottom: '-7px',
              }}
            >
              Enter your Player ID and custom amount in Sri Lankan Rupees (LKR).
              Instant top-up credits processed via official PayHere Visa & Mastercard gateway with
              instant verification and downloadable PDF receipts.
            </p>

            {/* Trust Badges Bar */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-medium text-zinc-300 pt-1">
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-red-400" />
                <span>Visa & Mastercard Accepted</span>
              </div>
              <span className="text-zinc-600">·</span>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>PayHere 3D Secure</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onPayNowClick}
                className="w-full sm:w-auto cursor-pointer group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-lg bg-gradient-to-r from-red-600 via-red-600 to-rose-700 px-8 py-4 text-base font-extrabold uppercase tracking-wider text-white shadow-xl shadow-red-900/40 glow-red transition-all duration-300 hover:from-red-500 hover:to-rose-600 hover:shadow-red-600/50 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Flame className="w-5 h-5 text-red-200 transition-transform group-hover:rotate-12" />
                <span>PAY NOW (LKR)</span>
                <ArrowRight className="w-4 h-4 text-red-200 transition-transform group-hover:translate-x-1" />
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-6 py-4 text-sm font-bold text-emerald-300 transition-all hover:bg-emerald-900/50 hover:border-emerald-400/50 hover:text-emerald-200"
              >
                <MessageCircle className="w-5 h-5 text-emerald-400" />
                <span>WhatsApp Customer Support</span>
              </a>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Decorative Red Aura Backdrop */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-red-600 to-rose-900 opacity-30 blur-xl" />

              <div className="relative rounded-2xl border border-red-500/30 bg-[#101017]/90 p-6 shadow-2xl backdrop-blur-xl">
                {/* Brand Header */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={logoImg}
                      alt="Uchiha Marri Top Up"
                      className="h-12 w-12 rounded-xl border border-red-500/40 object-cover shadow-md"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h3 className="font-display font-black text-white text-base">UCHIHA MARRI</h3>
                      <p className="text-xs text-red-400 font-semibold">GAMING TOP UP PORTAL</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded">
                    GATEWAY LIVE
                  </span>
                </div>

                {/* Quick Info Grid */}
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-2 px-3 rounded bg-zinc-900/80 border border-zinc-800">
                    <span className="text-zinc-400">Accepted Currencies</span>
                    <span className="text-white font-bold">LKR (Sri Lankan Rupee)</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 rounded bg-zinc-900/80 border border-zinc-800">
                    <span className="text-zinc-400">Card Gateways</span>
                    <span className="text-white font-bold">Visa & Mastercard</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-3 rounded bg-zinc-900/80 border border-zinc-800">
                    <span className="text-zinc-400">Security Standard</span>
                    <span className="text-emerald-400 font-bold">PayHere PCI-DSS Compliant</span>
                  </div>
                </div>

                {/* Callout button inside card */}
                <button
                  onClick={onPayNowClick}
                  className="mt-5 w-full cursor-pointer py-3 px-4 rounded-lg bg-red-600/20 border border-red-500/40 text-red-300 font-bold text-xs uppercase tracking-wider hover:bg-red-600 hover:text-white transition-all text-center flex items-center justify-center gap-2"
                >
                  <span>Start Instant Top Up Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Short Payment Instructions (Homepage Requirement #2) */}
        <div id="instructions" className="mt-16 pt-12 border-t border-zinc-800/80">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-red-400">
              SIMPLE 5-STEP PROCESS
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Short Payment Instructions
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              Follow these simple steps to complete your gaming top-up in under 2 minutes
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="relative rounded-xl border border-zinc-800 bg-[#0e0e13] p-5 hover:border-red-500/40 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-600/40 text-red-400 font-black text-sm flex items-center justify-center mb-3">
                01
              </div>
              <h3 className="font-bold text-white text-base mb-1">Select Game & UID</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Choose your game (Free Fire, MLBB, PUBG, COD, etc.) and enter your in-game Player ID or UID accurately.
              </p>
            </div>

            <div className="relative rounded-xl border border-zinc-800 bg-[#0e0e13] p-5 hover:border-red-500/40 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-600/40 text-red-400 font-black text-sm flex items-center justify-center mb-3">
                02
              </div>
              <h3 className="font-bold text-white text-base mb-1">Enter LKR Amount</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Enter any amount in Sri Lankan Rupees (LKR) or pick one of our quick presets (e.g. Rs. 500, 1500, 2500).
              </p>
            </div>

            <div className="relative rounded-xl border border-zinc-800 bg-[#0e0e13] p-5 hover:border-red-500/40 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-600/40 text-red-400 font-black text-sm flex items-center justify-center mb-3">
                03
              </div>
              <h3 className="font-bold text-white text-base mb-1">Pay via PayHere</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Select Visa or Mastercard. You will be seamlessly directed to PayHere’s secure 3D-Secure payment page.
              </p>
            </div>

            <div className="relative rounded-xl border border-zinc-800 bg-[#0e0e13] p-5 hover:border-red-500/40 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-600/40 text-red-400 font-black text-sm flex items-center justify-center mb-3">
                04
              </div>
              <h3 className="font-bold text-white text-base mb-1">Instant Confirmation</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Get real-time payment confirmation, instant in-game credits, and download your official PDF receipt!
              </p>
            </div>

            <div className="relative rounded-xl border border-zinc-800 bg-[#0e0e13] p-5 hover:border-red-500/40 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-600/40 text-red-400 font-black text-sm flex items-center justify-center">
                  05
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <FileText className="w-4 h-4 text-red-400" />
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <h3 className="font-bold text-white text-base mb-1">Send Your Payment Receipt</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Download your official PDF payment receipt and send it to our WhatsApp number to confirm your top-up order.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
