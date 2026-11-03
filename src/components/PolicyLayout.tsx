import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowLeft,
  MessageCircle,
  FileText,
  HelpCircle,
  Lock,
  RotateCcw,
  Truck,
  Mail,
  Info,
  ExternalLink,
} from 'lucide-react';

export const POLICY_NAV_ITEMS = [
  { path: '/about-us', label: 'About Us', shortTitle: 'About Us', icon: Info },
  { path: '/how-to-order', label: 'How to Order', shortTitle: 'How to Order', icon: HelpCircle },
  { path: '/terms-of-service', label: 'Terms & Conditions', shortTitle: 'Terms & Conditions', icon: FileText },
  { path: '/privacy-policy', label: 'Privacy Policy', shortTitle: 'Privacy Policy', icon: Lock },
  { path: '/refund-policy', label: 'Refund & Cancellation', shortTitle: 'Refund Policy', icon: RotateCcw },
  { path: '/shipping-policy', label: 'Shipping & Delivery', shortTitle: 'Shipping & Delivery', icon: Truck },
  { path: '/contact-us', label: 'Contact Us', shortTitle: 'Contact Us', icon: Mail },
];

interface PolicyLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated?: string;
  children: React.ReactNode;
}

export const PolicyLayout: React.FC<PolicyLayoutProps> = ({
  title,
  subtitle,
  lastUpdated = 'November 2026',
  children,
}) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 py-8 lg:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb & Navigation Back */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Link to="/" className="hover:text-red-400 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-zinc-500">Legal Policies</span>
            <span>/</span>
            <span className="text-red-400 font-semibold">{title}</span>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 self-start sm:self-auto rounded-lg border border-red-500/30 bg-red-950/30 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-red-300 hover:bg-red-900/40 hover:text-white transition-all shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Top-Up Portal</span>
          </Link>
        </div>

        {/* Policy Tab Navigation Bar (Single line scrollable on mobile) */}
        <div className="rounded-xl border border-zinc-800/90 bg-[#0e0e14] p-1.5 shadow-lg">
          <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
            {POLICY_NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600 via-rose-600 to-purple-700 text-white shadow-md shadow-red-950/60'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                  <span>{item.shortTitle}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Page Hero Header */}
        <div className="relative rounded-2xl border border-red-500/20 bg-gradient-to-b from-[#121018] via-[#0f0e15] to-[#0a0a0f] p-6 sm:p-10 shadow-xl overflow-hidden">
          {/* Subtle glow accent */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-red-950/60 border border-red-500/30 px-3 py-1 text-[11px] font-bold text-red-400 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>UCHIHA MARRI TOP UP · OFFICIAL STORE POLICY</span>
            </div>

            <h1 className="font-display text-2xl sm:text-4xl font-black text-white tracking-tight uppercase">
              {title}
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              {subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-zinc-500">
              <span>Jurisdiction: Sri Lanka</span>
              <span>·</span>
              <span>Currency: LKR (Sri Lankan Rupee)</span>
              <span>·</span>
              <span>Last Updated: {lastUpdated}</span>
            </div>
          </div>
        </div>

        {/* Content Section Container */}
        <div className="space-y-6">{children}</div>

        {/* Help & Support Bottom Card */}
        <div className="rounded-2xl border border-zinc-800 bg-[#0e0e14] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-display font-bold text-base text-white">
              Questions regarding our policies or your order?
            </h3>
            <p className="text-xs text-zinc-400">
              Our customer support is available directly via WhatsApp for quick assistance with payments, UID errors, or top-up verification.
            </p>
          </div>

          <a
            href="https://wa.me/94742235836?text=Hello%20Uchiha%20Marri%20Top%20Up,%20I%20have%20a%20question%20regarding%20my%20order/policy."
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer shrink-0 inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-950 transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp: 0742235836</span>
          </a>
        </div>
      </div>
    </div>
  );
};
