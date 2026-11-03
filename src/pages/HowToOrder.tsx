import React from 'react';
import { PolicyLayout } from '../components/PolicyLayout';
import { Link } from 'react-router-dom';
import {
  Gamepad2,
  Package,
  UserCheck,
  CheckCircle,
  CreditCard,
  Lock,
  Zap,
  MessageCircle,
  ArrowRight,
  Flame,
} from 'lucide-react';

export const HowToOrder: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Visit the Top Up Portal',
      desc: 'Head to the main homepage of UCHIHA MARRI TOP UP to view our available games and top-up options.',
      icon: Gamepad2,
      accent: 'text-red-400 bg-red-950/60 border-red-500/30',
    },
    {
      step: '02',
      title: 'Select a Diamond or Membership Package',
      desc: 'Choose your desired game (Free Fire, MLBB, PUBG Mobile, etc.) and pick a preset package or enter your own custom top-up amount in Sri Lankan Rupees (LKR).',
      icon: Package,
      accent: 'text-rose-400 bg-rose-950/60 border-rose-500/30',
    },
    {
      step: '03',
      title: 'Enter the Correct Game ID and Server ID',
      desc: 'Accurately enter your in-game Player ID / UID. If you are playing games requiring a Zone ID (such as Mobile Legends), enter your Server/Zone ID into the designated field.',
      icon: UserCheck,
      accent: 'text-purple-400 bg-purple-950/60 border-purple-500/30',
    },
    {
      step: '04',
      title: 'Confirm Selected Package & LKR Amount',
      desc: 'Double-check your Player UID, customer name, WhatsApp contact number, and the total payable amount in LKR shown in the order summary box.',
      icon: CheckCircle,
      accent: 'text-amber-400 bg-amber-950/60 border-amber-500/30',
    },
    {
      step: '05',
      title: 'Select Visa or Mastercard Payment',
      desc: 'Choose your preferred payment method: Visa Card or Mastercard debit/credit card processed via the official PayHere payment gateway.',
      icon: CreditCard,
      accent: 'text-blue-400 bg-blue-950/60 border-blue-500/30',
    },
    {
      step: '06',
      title: 'Complete Payment via Secure Checkout',
      desc: 'Click "PAY NOW" to proceed to PayHere’s secure 256-bit encrypted checkout page. Enter your card details and approve the One-Time Password (OTP) sent by your bank.',
      icon: Lock,
      accent: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30',
    },
    {
      step: '07',
      title: 'Wait for Verification & Digital Delivery',
      desc: 'Once your payment is verified, the system displays "PAYMENT SUCCESSFUL!" with your Transaction ID. Credits are dispatched electronically into your game account.',
      icon: Zap,
      accent: 'text-amber-400 bg-amber-950/60 border-amber-500/30',
    },
    {
      step: '08',
      title: 'Download Receipt & Contact Support If Needed',
      desc: 'Download your official PDF payment receipt for your records. If you need any assistance, click the WhatsApp button (0742235836) to message our team.',
      icon: MessageCircle,
      accent: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30',
    },
  ];

  return (
    <PolicyLayout
      title="How to Order"
      subtitle="Follow our simple 8-step guide to top up Diamonds, memberships, and gaming credits on UCHIHA MARRI TOP UP."
    >
      {/* Steps List */}
      <div className="space-y-4">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              className="rounded-2xl border border-zinc-800 bg-[#101016] p-5 sm:p-6 flex flex-col sm:flex-row items-start gap-4 hover:border-red-500/40 transition-colors"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl border font-mono font-black text-sm shrink-0 ${s.accent}`}
              >
                {s.step}
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-zinc-400" />
                  <h3 className="font-display font-bold text-white text-base">
                    {s.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Helpful UID Locating Tips */}
      <div className="rounded-2xl border border-zinc-800 bg-[#101016] p-6 sm:p-8 space-y-4">
        <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
          <Flame className="w-4 h-4 text-red-500" />
          <span>Helpful Tips to Find Your In-Game ID</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-300">
          <div className="p-3.5 rounded-xl bg-[#14141d] border border-zinc-800">
            <strong className="text-white block mb-1">Free Fire ID</strong>
            <span className="text-zinc-400">Open Free Fire → Tap your avatar icon in the top-left corner → Copy the 8-to-10 digit number next to "UID".</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#14141d] border border-zinc-800">
            <strong className="text-white block mb-1">Mobile Legends (MLBB) ID</strong>
            <span className="text-zinc-400">Open MLBB → Tap your avatar → Find your User ID and the 4-digit Zone ID in parentheses, e.g. 12345678 (2049).</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#14141d] border border-zinc-800">
            <strong className="text-white block mb-1">PUBG Mobile Character ID</strong>
            <span className="text-zinc-400">Open PUBG Mobile → Tap your profile avatar → Copy your numeric Character ID displayed on your basic info card.</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#14141d] border border-zinc-800">
            <strong className="text-white block mb-1">Call of Duty Mobile (CODM)</strong>
            <span className="text-zinc-400">Open CODM → Settings → Legal and Privacy or Profile card → Copy your numeric Player ID.</span>
          </div>
        </div>
      </div>

      {/* Bottom CTA to start ordering */}
      <div className="rounded-xl border border-red-500/40 bg-gradient-to-r from-red-950/60 via-purple-950/40 to-zinc-900 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-display font-bold text-white text-base">Ready to place your top-up?</h4>
          <p className="text-xs text-zinc-300">Choose your game and enter your UID now on our Top Up Portal.</p>
        </div>
        <Link
          to="/"
          className="cursor-pointer shrink-0 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950 hover:from-red-500 hover:to-rose-500 transition-all"
        >
          <span>Start Top Up Now</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </PolicyLayout>
  );
};
