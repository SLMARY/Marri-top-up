import React from 'react';
import { PolicyLayout } from '../components/PolicyLayout';
import { Lock, Eye, Database, ShieldCheck, CreditCard, UserCheck, HelpCircle } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <PolicyLayout
      title="Privacy Policy"
      subtitle="How UCHIHA MARRI TOP UP collects, uses, and safeguards customer data for gaming top-up orders in Sri Lanka."
    >
      {/* Introduction Card */}
      <div className="rounded-2xl border border-zinc-800 bg-[#101016] p-6 sm:p-8 space-y-4">
        <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-red-500" />
          <span>1. Commitment to Privacy</span>
        </h2>
        <p className="text-sm text-zinc-300 leading-relaxed">
          At <strong className="text-white">UCHIHA MARRI TOP UP</strong>, we respect the privacy of every gamer who visits our website. This Privacy Policy details what personal information we collect when you order gaming credits, why that information is required, how it is handled, and your rights concerning your data.
        </p>
        <p className="text-sm text-zinc-300 leading-relaxed">
          We operate transparently: we collect only the minimal data strictly necessary to fulfill your digital game top-up, communicate order statuses, and comply with Sri Lankan regulatory accounting obligations.
        </p>
      </div>

      {/* 2. What Customer Information is Collected */}
      <div className="rounded-2xl border border-zinc-800 bg-[#101016] p-6 sm:p-8 space-y-4">
        <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
          <Eye className="w-5 h-5 text-rose-500" />
          <span>2. What Customer Information We Collect</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          When placing an order on our portal, we collect the following limited details:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-300">
          <div className="p-3 rounded-xl bg-[#14141d] border border-zinc-800">
            <strong className="text-white block text-sm mb-1">Customer Name</strong>
            <span className="text-zinc-400">Used to address you on official order receipts and customer communications.</span>
          </div>
          <div className="p-3 rounded-xl bg-[#14141d] border border-zinc-800">
            <strong className="text-white block text-sm mb-1">WhatsApp Phone Number</strong>
            <span className="text-zinc-400">Required to provide top-up status updates, issue receipts, and offer customer support.</span>
          </div>
          <div className="p-3 rounded-xl bg-[#14141d] border border-zinc-800">
            <strong className="text-white block text-sm mb-1">Game Name & Player ID / UID</strong>
            <span className="text-zinc-400">Your publicly viewable in-game account identifier and zone/server ID needed to route digital credits.</span>
          </div>
          <div className="p-3 rounded-xl bg-[#14141d] border border-zinc-800">
            <strong className="text-white block text-sm mb-1">Transaction Metadata</strong>
            <span className="text-zinc-400">Order ID, date and time, amount in LKR, payment method, and gateway transaction reference.</span>
          </div>
        </div>
      </div>

      {/* 3. Why Game IDs and Contact Details are Needed */}
      <div className="rounded-2xl border border-zinc-800 bg-[#101016] p-6 sm:p-8 space-y-4">
        <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-purple-400" />
          <span>3. Why Game IDs & Contact Details Are Needed</span>
        </h2>
        <ul className="space-y-3 text-xs text-zinc-300 list-disc list-inside leading-relaxed">
          <li>
            <strong className="text-white">Direct Electronic Top-Up:</strong> Game developers (such as Garena, Moonton, Tencent, HoYoverse, etc.) require the customer's unique numeric Player UID to credit Diamonds, UC, or battle passes directly to the character. We do not require, and will never request, your account password or email credentials.
          </li>
          <li>
            <strong className="text-white">Customer Support & Dispute Handling:</strong> If a game server experiences high latency or an order requires verification, our support team uses your WhatsApp number to contact you directly with real-time updates.
          </li>
          <li>
            <strong className="text-white">Fraud Prevention & Record Keeping:</strong> Keeping an electronic record of the order enables both the customer and our store to track payments and download verified PDF receipts.
          </li>
        </ul>
      </div>

      {/* 4. Payment Processing Through PayHere */}
      <div className="rounded-2xl border border-emerald-500/30 bg-[#0e1411] p-6 sm:p-8 space-y-4">
        <h2 className="font-display text-lg font-bold text-emerald-400 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-emerald-400" />
          <span>4. Payment Processing Through PayHere (PCI-DSS Compliance)</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          Payment processing on UCHIHA MARRI TOP UP is handled through <strong className="text-white">PayHere</strong> (PayHere Lanka Pvt Ltd), an authorized Central Bank of Sri Lanka approved payment service provider.
        </p>
        <div className="rounded-xl bg-zinc-950/80 border border-emerald-500/20 p-4 text-xs text-zinc-300 space-y-2">
          <p className="font-bold text-emerald-300">How your card information is protected:</p>
          <p>• <strong>We Never Store Card Details:</strong> When you pay via Visa or Mastercard, your card numbers, CVV, and expiration dates are entered directly into PayHere's hosted, encrypted checkout page. UCHIHA MARRI TOP UP servers never collect, process, or store card numbers or sensitive authentication data.</p>
          <p>• <strong>Bank 3D-Secure Verification:</strong> Visa and Mastercard payments are verified with One-Time Password (OTP) authorization issued directly by your issuing bank.</p>
          <p>• <strong>Server-to-Server Verification:</strong> PayHere communicates payment outcomes (success or failure) to our backend via encrypted server-side hash notifications.</p>
        </div>
      </div>

      {/* 5. How Order Information is Stored and Used */}
      <div className="rounded-2xl border border-zinc-800 bg-[#101016] p-6 sm:p-8 space-y-4">
        <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-rose-400" />
          <span>5. How Order Information is Stored & Shared</span>
        </h2>
        <ul className="space-y-3 text-xs text-zinc-300 list-disc list-inside leading-relaxed">
          <li>
            <strong className="text-white">No Selling or Marketing Sharing:</strong> We do not sell, rent, trade, or disclose your contact information to marketing agencies, brokers, or unrelated third parties.
          </li>
          <li>
            <strong className="text-white">Service Providers:</strong> Information is shared solely with necessary processing entities: the PayHere payment gateway for processing your transaction and official game distribution endpoints for depositing your credits.
          </li>
          <li>
            <strong className="text-white">Data Retention:</strong> Order metadata (Order ID, game UID, amount, and timestamp) is retained to facilitate receipt downloads, order verification, and financial accounting.
          </li>
        </ul>
      </div>

      {/* 6. How Customers Can Request Assistance */}
      <div className="rounded-2xl border border-zinc-800 bg-[#101016] p-6 sm:p-8 space-y-4">
        <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-red-500" />
          <span>6. Accessing & Updating Your Information</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          Customers in Sri Lanka have the right to inquire about their stored transaction records, request corrections to contact details, or request deletion of non-essential records.
        </p>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          To make an inquiry regarding your personal data, please message our support desk on WhatsApp at <strong className="text-emerald-400">0742235836</strong> or email us at <code>[ADD MY REAL BUSINESS EMAIL]</code> with your Order ID.
        </p>
      </div>
    </PolicyLayout>
  );
};
