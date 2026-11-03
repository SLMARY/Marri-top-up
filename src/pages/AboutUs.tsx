import React from 'react';
import { PolicyLayout } from '../components/PolicyLayout';
import { Gamepad2, ShieldCheck, Zap, Users, CheckCircle, CreditCard, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutUs: React.FC = () => {
  return (
    <PolicyLayout
      title="About Us"
      subtitle="Sri Lanka's trusted digital destination for instant gaming top-ups, Diamonds, memberships, and in-game passes."
    >
      {/* Intro Card */}
      <div className="rounded-2xl border border-zinc-800 bg-[#101016] p-6 sm:p-8 space-y-4">
        <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
          <Flame className="w-5 h-5 text-red-500" />
          <span>Who We Are — UCHIHA MARRI TOP UP</span>
        </h2>
        <p className="text-sm text-zinc-300 leading-relaxed">
          <strong className="text-white">UCHIHA MARRI TOP UP</strong> is a dedicated Sri Lankan online gaming service created to provide gamers across Sri Lanka with quick, reliable, and convenient digital gaming products. We specialize in providing in-game Diamonds, UC, game currencies, weekly/monthly memberships, and premium passes for the world's most popular mobile and PC titles.
        </p>
        <p className="text-sm text-zinc-300 leading-relaxed">
          Before modern top-up portals, Sri Lankan gamers frequently struggled with international payment blockages, complex foreign currency conversions, and untrustworthy third-party vendors. We solved this problem by enabling direct payments in <strong className="text-white">Sri Lankan Rupees (LKR)</strong> using local Visa and Mastercard debit or credit cards, backed by authenticated PayHere checkout.
        </p>
      </div>

      {/* What We Provide Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-xl border border-zinc-800 bg-[#0e0e14] p-5 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-950/60 border border-red-500/30 text-red-400">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Digital Gaming Products</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            We provide official top-ups for Free Fire, Mobile Legends: Bang Bang, PUBG Mobile, Call of Duty: Mobile, Genshin Impact, Valorant, and other popular titles.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-[#0e0e14] p-5 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-950/60 border border-rose-500/30 text-rose-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Direct LKR Payments</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Pay transparently in Sri Lankan Rupees without hidden foreign transaction fees. We accept Visa and Mastercard via certified local payment checkout.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-[#0e0e14] p-5 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-400">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Direct UID Delivery</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Credits and passes are delivered electronically straight to your public Player ID (UID) without ever needing to share game passwords or account logins.
          </p>
        </div>
      </div>

      {/* Core Principles */}
      <div className="rounded-2xl border border-zinc-800 bg-[#101016] p-6 sm:p-8 space-y-5">
        <h2 className="font-display text-lg font-bold text-white">Our Commitments to Sri Lankan Gamers</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-zinc-300">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#14141d] border border-zinc-800/80">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block text-sm">Account Security First</strong>
              <span className="text-zinc-400">We never ask for game passwords, Facebook logins, Google credentials, or OTP codes. Your account safety is our priority.</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#14141d] border border-zinc-800/80">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block text-sm">Transparent LKR Pricing</strong>
              <span className="text-zinc-400">The amount shown in Sri Lankan Rupees (LKR) is the exact amount you pay. You can enter any custom top-up value.</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#14141d] border border-zinc-800/80">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block text-sm">Direct Customer Support</strong>
              <span className="text-zinc-400">Reach our dedicated support team directly on WhatsApp (0742235836) for fast order status updates and inquiries.</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#14141d] border border-zinc-800/80">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block text-sm">Verified Electronic Receipts</strong>
              <span className="text-zinc-400">Every single transaction generates an official downloadable PDF receipt with your Order ID and payment verification code.</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="rounded-xl border border-red-500/30 bg-gradient-to-r from-red-950/40 via-purple-950/20 to-zinc-900 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-display font-bold text-white text-base">Ready to top up your game?</h4>
          <p className="text-xs text-zinc-400">Choose your game, enter your Player UID, and pay in LKR with instant confirmation.</p>
        </div>
        <Link
          to="/"
          className="cursor-pointer shrink-0 inline-flex items-center gap-2 rounded-lg bg-red-600 hover:bg-red-500 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950 transition-all"
        >
          <span>Go to Top Up Portal</span>
        </Link>
      </div>
    </PolicyLayout>
  );
};
