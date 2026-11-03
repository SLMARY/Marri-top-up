import React from 'react';
import { PolicyLayout } from '../components/PolicyLayout';
import { ShieldCheck, AlertTriangle, CheckCircle, FileText, Scale, HelpCircle } from 'lucide-react';

export const TermsOfService: React.FC = () => {
  return (
    <PolicyLayout
      title="Terms & Conditions"
      subtitle="Please read these terms carefully before placing an order on UCHIHA MARRI TOP UP. By accessing or using our services, you agree to be bound by these provisions."
    >
      {/* Overview Card */}
      <div className="rounded-2xl border border-zinc-800 bg-[#101016] p-6 sm:p-8 space-y-4">
        <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
          <Scale className="w-5 h-5 text-red-500" />
          <span>1. Introduction & Acceptance of Terms</span>
        </h2>
        <p className="text-sm text-zinc-300 leading-relaxed">
          These Terms & Conditions govern your access to and purchase of digital gaming products, in-game credits, Diamonds, memberships, and top-up services from <strong className="text-white">UCHIHA MARRI TOP UP</strong> in Sri Lanka.
        </p>
        <p className="text-sm text-zinc-300 leading-relaxed">
          By selecting a product, entering payment information, or submitting an order through this website, you confirm that you have read, understood, and agreed to these Terms & Conditions in full. If you do not agree with any part of these terms, you must refrain from placing orders.
        </p>
      </div>

      {/* 2. Customer Responsibilities */}
      <div className="rounded-2xl border border-zinc-800 bg-[#101016] p-6 sm:p-8 space-y-4">
        <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-rose-500" />
          <span>2. Customer Responsibilities & Eligibility</span>
        </h2>
        <ul className="space-y-3 text-xs text-zinc-300 list-disc list-inside leading-relaxed">
          <li>
            <strong className="text-white">Age & Authorization:</strong> Customers must be at least 18 years of age, or have the express permission and supervision of a parent or legal guardian, to make financial purchases using Visa or Mastercard.
          </li>
          <li>
            <strong className="text-white">Authorized Payment Instrument:</strong> You certify that you are the lawful owner or authorized cardholder of the Visa or Mastercard used for the transaction. Fraudulent card usage or unauthorized card attempts are reported to competent financial and law enforcement authorities.
          </li>
          <li>
            <strong className="text-white">Accurate Contact Information:</strong> You agree to provide a valid WhatsApp phone number and truthful contact details so that order confirmation, electronic receipts, and customer support communications can be delivered.
          </li>
        </ul>
      </div>

      {/* 3. Correct Game ID and Server ID Requirements */}
      <div className="rounded-2xl border border-amber-500/30 bg-[#121015] p-6 sm:p-8 space-y-4">
        <h2 className="font-display text-lg font-bold text-amber-400 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <span>3. Correct Game ID & Server ID Requirements (Crucial)</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          Because gaming top-ups are fulfilled automatically and digitally to the specific in-game identifier provided, <strong className="text-white">it is the customer's sole responsibility to ensure that their Player ID / UID and Server/Zone ID are entered accurately.</strong>
        </p>
        <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 p-4 text-xs text-zinc-300 space-y-2">
          <p className="font-bold text-white">Guidelines for checking your Player ID:</p>
          <p>• <strong>Free Fire:</strong> Copy the numerical UID displayed directly below your game nickname on your profile screen.</p>
          <p>• <strong>Mobile Legends: Bang Bang:</strong> Provide both the User ID and the 4-to-5 digit Zone ID displayed inside parentheses, e.g. 12345678 (2049).</p>
          <p>• <strong>PUBG Mobile:</strong> Provide the 9-to-11 digit Character ID found in your profile.</p>
          <p>• <strong>Valorant / Riot:</strong> Provide your complete Riot ID including the hashtag, e.g. Username#LK1.</p>
        </div>
      </div>

      {/* 4. Product and Price Information */}
      <div className="rounded-2xl border border-zinc-800 bg-[#101016] p-6 sm:p-8 space-y-4">
        <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-red-500" />
          <span>4. Product & Price Information</span>
        </h2>
        <ul className="space-y-3 text-xs text-zinc-300 list-disc list-inside leading-relaxed">
          <li>
            <strong className="text-white">Currency:</strong> All products, packages, and custom top-up amounts are listed and payable in <strong className="text-white">Sri Lankan Rupees (LKR)</strong>.
          </li>
          <li>
            <strong className="text-white">Dynamic Pricing:</strong> Top-up package prices are subject to change in accordance with underlying game publisher adjustments, currency exchange movements, and in-game seasonal events without prior notice.
          </li>
          <li>
            <strong className="text-white">Package Discrepancies:</strong> In the event a package or price is mistakenly listed due to a typographical or system error, UCHIHA MARRI TOP UP reserves the right to notify the customer and seek confirmation or provide a prompt refund.
          </li>
        </ul>
      </div>

      {/* 5. Payment Confirmation */}
      <div className="rounded-2xl border border-zinc-800 bg-[#101016] p-6 sm:p-8 space-y-4">
        <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span>5. Payment Confirmation</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          All payments on UCHIHA MARRI TOP UP are routed through the secure PayHere checkout gateway. Top-up fulfillment begins <strong className="text-white">only after the payment gateway issues a successful server-side payment notification</strong>.
        </p>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          An automated electronic confirmation is generated upon success, featuring an official Order ID, Transaction Reference, and downloadable PDF receipt. Please retain your Order ID for any customer support interactions.
        </p>
      </div>

      {/* 6. Digital Product Delivery */}
      <div className="rounded-2xl border border-zinc-800 bg-[#101016] p-6 sm:p-8 space-y-4">
        <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-400" />
          <span>6. Digital Product Delivery</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          All products offered on this platform are <strong className="text-white">digital in-game goods</strong>. No physical parcel, shipping label, or postal dispatch will ever occur. Delivery is achieved solely by crediting the in-game account corresponding to the supplied UID.
        </p>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          Fulfillment typically commences promptly upon payment verification. However, occasional delays may arise during game developer server maintenance, high network load, or banking authorization verifications.
        </p>
      </div>

      {/* 7. Incorrect Information and Order Errors */}
      <div className="rounded-2xl border border-zinc-800 bg-[#101016] p-6 sm:p-8 space-y-4">
        <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
          <span>7. Incorrect Information & Order Errors</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          If a customer supplies an incorrect Game ID or Server ID and the digital top-up has already been processed by the game provider into that unintended account, <strong className="text-white">the transaction cannot be recalled, transferred, or reversed</strong>, as game publishers treat completed credit deliveries as final.
        </p>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          If you realize you made a typing mistake before the order is processed, contact our WhatsApp support immediately at <strong className="text-emerald-400">0742235836</strong> with your Order ID so our operators can attempt to intercept the order.
        </p>
      </div>

      {/* 8. Customer Support and Dispute Resolution */}
      <div className="rounded-2xl border border-zinc-800 bg-[#101016] p-6 sm:p-8 space-y-4">
        <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-red-500" />
          <span>8. Customer Support & Dispute Resolution</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          We are committed to resolving customer inquiries quickly and fairly. If you experience an issue with your transaction or delivery:
        </p>
        <ol className="space-y-2 text-xs text-zinc-300 list-decimal list-inside leading-relaxed">
          <li>Reach out to our WhatsApp support team at <strong>0742235836</strong> or email us at <code>[ADD MY REAL BUSINESS EMAIL]</code>.</li>
          <li>Provide your Order ID (e.g. UMT-XXXXXX-XXXX) and payment receipt screenshot.</li>
          <li>Our support team will investigate the gateway records and game server status to provide a fair resolution.</li>
        </ol>
        <p className="text-xs text-zinc-400 mt-2">
          These terms are governed by and construed in accordance with the laws of the Democratic Socialist Republic of Sri Lanka.
        </p>
      </div>
    </PolicyLayout>
  );
};
