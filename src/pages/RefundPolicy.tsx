import React from 'react';
import { PolicyLayout } from '../components/PolicyLayout';
import { RotateCcw, AlertCircle, CheckCircle, HelpCircle, ShieldCheck, Clock, FileText } from 'lucide-react';

export const RefundPolicy: React.FC = () => {
  return (
    <PolicyLayout
      title="Refund & Cancellation Policy"
      subtitle="Clear and fair guidelines on how refund inquiries, failed transactions, and order adjustments are handled at UCHIHA MARRI TOP UP."
    >
      {/* Overview Card */}
      <div className="rounded-2xl border border-zinc-800 bg-[#101016] p-6 sm:p-8 space-y-4">
        <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-red-500" />
          <span>1. Nature of Digital Gaming Goods</span>
        </h2>
        <p className="text-sm text-zinc-300 leading-relaxed">
          At <strong className="text-white">UCHIHA MARRI TOP UP</strong>, our products consist of digital gaming credits, in-game Diamonds, UC, battle passes, and subscription memberships. Once these items are credited directly to an in-game Player ID (UID), they are consumed and permanently bound to that game account by the game publisher.
        </p>
        <p className="text-sm text-zinc-300 leading-relaxed">
          While digital credits cannot generally be returned once successfully credited to your game account, <strong className="text-white">we do not operate an unconditional "no-refund" policy</strong>. Every customer request is investigated thoroughly and handled fairly in accordance with Sri Lankan commercial consumer guidelines and PayHere payment processing standards.
        </p>
      </div>

      {/* 2. Payment Succeeds but Top-Up Not Delivered */}
      <div className="rounded-2xl border border-emerald-500/30 bg-[#0e1411] p-6 sm:p-8 space-y-4">
        <h2 className="font-display text-lg font-bold text-emerald-400 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span>2. Payment Succeeds but Top-Up is Not Delivered</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          If your Visa or Mastercard payment was successfully charged and you received an official PayHere receipt, but the gaming credits do not appear in your game profile due to server maintenance, technical outage, or system backlog:
        </p>
        <ul className="space-y-2 text-xs text-zinc-300 list-disc list-inside leading-relaxed">
          <li>
            <strong className="text-white">Manual Delivery Priority:</strong> Our support operators will verify your payment with the gateway and manually complete the delivery to your Player ID promptly.
          </li>
          <li>
            <strong className="text-white">Full Refund Option:</strong> If the requested top-up cannot be fulfilled (for example, if the game server is undergoing extended maintenance or the package is temporarily discontinued), <strong className="text-emerald-400">you will receive a 100% full refund</strong> of the amount paid back to the original card used.
          </li>
        </ul>
      </div>

      {/* 3. Duplicate Payments */}
      <div className="rounded-2xl border border-zinc-800 bg-[#101016] p-6 sm:p-8 space-y-4">
        <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" />
          <span>3. Duplicate Charges or Accidental Double Payments</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          If a technical network glitch or multiple button presses result in your payment card being billed twice for a single top-up request:
        </p>
        <ul className="space-y-2 text-xs text-zinc-300 list-disc list-inside leading-relaxed">
          <li>
            Notify us on WhatsApp at <strong className="text-emerald-400">0742235836</strong> with the two transaction references or bank notifications.
          </li>
          <li>
            Once our payment reconciliation confirms that two separate payments were captured for one order, the duplicate transaction will be refunded immediately through PayHere.
          </li>
        </ul>
      </div>

      {/* 4. Failed Transactions */}
      <div className="rounded-2xl border border-zinc-800 bg-[#101016] p-6 sm:p-8 space-y-4">
        <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-400" />
          <span>4. Failed or Cancelled Transactions</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          If a transaction fails at the checkout stage (for example due to 3D-Secure timeout, incorrect OTP, or bank card decline):
        </p>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          UCHIHA MARRI TOP UP does not capture any funds from failed transactions. If your bank temporarily places a hold or reservation on your account for a failed attempt, your issuing bank will automatically release the pre-authorization hold within their standard timeframe (typically 1 to 7 business days, depending on your bank).
        </p>
      </div>

      {/* 5. Incorrect Game IDs Supplied by Customers */}
      <div className="rounded-2xl border border-amber-500/30 bg-[#131118] p-6 sm:p-8 space-y-4">
        <h2 className="font-display text-lg font-bold text-amber-400 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <span>5. Incorrect Game ID / Server ID Supplied by Customer</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          Please pay extra attention when entering your Player UID and Server ID:
        </p>
        <ul className="space-y-2 text-xs text-zinc-300 list-disc list-inside leading-relaxed">
          <li>
            <strong className="text-white">Credits Already Deposited:</strong> If an incorrect Player ID was provided and the game publisher has already deposited the credits into that external player's account, the top-up cannot be retracted or refunded because the game publisher does not permit reversals.
          </li>
          <li>
            <strong className="text-white">Reported Before Fulfillment:</strong> If you notice an error immediately after placing the order and notify our WhatsApp support before fulfillment takes place, our operators will pause the order and update it with your correct UID without extra cost.
          </li>
          <li>
            <strong className="text-white">Invalid / Non-Existent UID:</strong> If the UID you provided does not exist in the game database, the top-up cannot be processed. Our support team will reach out via WhatsApp to obtain your valid ID or issue a full refund.
          </li>
        </ul>
      </div>

      {/* 6. Refund Request Procedure */}
      <div className="rounded-2xl border border-zinc-800 bg-[#101016] p-6 sm:p-8 space-y-4">
        <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-red-500" />
          <span>6. Step-by-Step Refund Request Procedure</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          To submit a formal refund request:
        </p>
        <div className="space-y-3 text-xs text-zinc-300">
          <div className="p-3.5 rounded-xl bg-[#14141d] border border-zinc-800 flex items-start gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-900/60 text-red-400 font-bold shrink-0">1</span>
            <div>
              <strong className="text-white block">Contact Customer Support</strong>
              <span>Message us on WhatsApp at <strong className="text-emerald-400">0742235836</strong> or email <code>[ADD MY REAL BUSINESS EMAIL]</code>.</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#14141d] border border-zinc-800 flex items-start gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-900/60 text-red-400 font-bold shrink-0">2</span>
            <div>
              <strong className="text-white block">Provide Transaction Details</strong>
              <span>Include your Order ID (e.g. UMT-XXXXXX-XXXX), payment date, amount in LKR, and in-game Player UID.</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#14141d] border border-zinc-800 flex items-start gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-900/60 text-red-400 font-bold shrink-0">3</span>
            <div>
              <strong className="text-white block">Investigation & Processing</strong>
              <span>Our team will audit the PayHere transaction logs and game server fulfillment. Approved refunds are credited back to the original Visa or Mastercard via PayHere within 3 to 7 banking days.</span>
            </div>
          </div>
        </div>
      </div>
    </PolicyLayout>
  );
};
