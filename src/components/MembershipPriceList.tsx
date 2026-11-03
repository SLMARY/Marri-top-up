import React from 'react';
import { Crown, Sparkles, Check, Flame, ArrowRight, ShieldCheck } from 'lucide-react';
import { MEMBERSHIP_PACKAGES } from '../data/packages';

interface MembershipPriceListProps {
  onSelectMembership: (packageId: string, amount: number) => void;
}

export const MembershipPriceList: React.FC<MembershipPriceListProps> = ({
  onSelectMembership,
}) => {
  return (
    <section id="memberships" className="py-12 bg-[#09090e] border-y border-zinc-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>OFFICIAL 2026 PRICE LIST</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight">
              Gaming Membership Packages
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md">
            Official Sri Lanka LKR prices for all 7 gaming memberships. Select any package below to load it into checkout instantly with Visa or Mastercard.
          </p>
        </div>

        {/* 7 Membership Packages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MEMBERSHIP_PACKAGES.map((pkg, idx) => {
            const isTopTier = pkg.price >= 5000;
            const isProMax = pkg.id.includes('pro_max');

            return (
              <div
                key={pkg.id}
                onClick={() => onSelectMembership(pkg.id, pkg.price)}
                className={`cursor-pointer group relative rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 ${
                  pkg.popular
                    ? 'border-red-500/60 bg-gradient-to-b from-[#181119] to-[#0e0e14] shadow-xl shadow-red-950/40 ring-1 ring-red-500/40'
                    : isTopTier
                    ? 'border-purple-500/40 bg-gradient-to-b from-[#140f1f] to-[#0d0d14] shadow-lg shadow-purple-950/30'
                    : 'border-zinc-800 bg-[#0e0e14] hover:border-zinc-700'
                }`}
              >
                {/* Badge Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-[11px] font-bold text-zinc-500">
                    0{idx + 1}.
                  </span>
                  {pkg.badge && (
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        pkg.popular
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : isProMax
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}
                    >
                      {pkg.badge}
                    </span>
                  )}
                </div>

                {/* Name & Perks */}
                <div className="space-y-1.5 flex-1">
                  <h3 className="font-display font-black text-white text-base sm:text-lg group-hover:text-red-400 transition-colors">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium">
                    {pkg.duration}
                  </p>
                </div>

                {/* Price & Action Button */}
                <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                      Price in LKR
                    </span>
                    <span className="font-display font-black text-lg sm:text-xl text-white font-mono">
                      Rs. {pkg.price.toLocaleString('en-US')} <span className="text-xs font-semibold text-red-400">LKR</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-red-600/20 border border-red-500/40 px-3 py-1.5 text-xs font-bold text-red-300 group-hover:bg-red-600 group-hover:text-white transition-all"
                  >
                    <span>Select</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security / Verification Strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl bg-[#12121c] border border-zinc-800 p-4 text-xs text-zinc-400">
          <div className="flex items-center gap-2 text-zinc-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Guaranteed Official Rates • Direct UID Delivery • Secured by PayHere Gateway</span>
          </div>
          <span className="text-[11px] text-zinc-500">
            All prices strictly authenticated on checkout.
          </span>
        </div>
      </div>
    </section>
  );
};
