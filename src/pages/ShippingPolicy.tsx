import React from 'react';
import { PolicyLayout } from '../components/PolicyLayout';
import { Truck, Zap, AlertTriangle, ShieldCheck, Clock, MessageCircle, CheckCircle } from 'lucide-react';

export const ShippingPolicy: React.FC = () => {
  return (
    <PolicyLayout
      title="Shipping & Delivery Policy"
      subtitle="Important details regarding the electronic fulfillment and digital delivery of gaming top-ups, Diamonds, and memberships."
    >
      {/* 1. Digital Products Only Notice */}
      <div className="rounded-2xl border border-red-500/30 bg-[#121016] p-6 sm:p-8 space-y-4">
        <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
          <Truck className="w-5 h-5 text-red-500" />
          <span>1. Exclusively Digital Products — No Physical Delivery</span>
        </h2>
        <div className="rounded-xl bg-red-950/40 border border-red-500/30 p-4 text-xs sm:text-sm text-red-200 leading-relaxed font-medium">
          <strong>PLEASE NOTE:</strong> UCHIHA MARRI TOP UP sells digital gaming top-ups, in-game Diamonds, passes, and memberships. <strong className="text-white underline">No physical goods, parcels, hardware, or postal packages are sold or shipped.</strong>
        </div>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          There are no postal delivery fees, parcel tracking numbers, or physical couriers involved in any transaction on this website. All items are delivered entirely electronically.
        </p>
      </div>

      {/* 2. Electronic Delivery Process */}
      <div className="rounded-2xl border border-zinc-800 bg-[#101016] p-6 sm:p-8 space-y-4">
        <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-400" />
          <span>2. How Electronic Delivery Works</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          Digital credits are credited directly into your game account using the unique numeric Player ID (UID) and Server/Zone ID you provide during checkout:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-300">
          <div className="p-4 rounded-xl bg-[#14141d] border border-zinc-800 space-y-1.5">
            <span className="font-bold text-white block text-sm">Step 1: Payment Verification</span>
            <span className="text-zinc-400">Delivery starts immediately after PayHere confirms payment settlement.</span>
          </div>

          <div className="p-4 rounded-xl bg-[#14141d] border border-zinc-800 space-y-1.5">
            <span className="font-bold text-white block text-sm">Step 2: UID Routing</span>
            <span className="text-zinc-400">The requested package is dispatched to your specified in-game account UID.</span>
          </div>

          <div className="p-4 rounded-xl bg-[#14141d] border border-zinc-800 space-y-1.5">
            <span className="font-bold text-white block text-sm">Step 3: In-Game Availability</span>
            <span className="text-zinc-400">Credits or memberships become active inside your game wallet or mailbox.</span>
          </div>
        </div>
      </div>

      {/* 3. Delivery Timing & Potential Delays */}
      <div className="rounded-2xl border border-zinc-800 bg-[#101016] p-6 sm:p-8 space-y-4">
        <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-400" />
          <span>3. Delivery Timing & Factors Affecting Processing</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          Under standard operating conditions, electronic delivery is typically completed within a few minutes following payment authorization. However, <strong className="text-white">we do not provide guaranteed or fixed instant delivery times</strong>, as electronic distribution depends on third-party systems outside our direct control.
        </p>
        <div className="space-y-2 text-xs text-zinc-300">
          <p className="font-bold text-white">Occasional delays may occur due to:</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400">
            <li><strong>Game Server Maintenance:</strong> Publisher maintenance windows (e.g., Garena, Moonton, or Tencent game updates) during which player accounts cannot be credited.</li>
            <li><strong>Payment Gateway Verification:</strong> Occasional manual security reviews or 3D-Secure clearing latency by banking partners.</li>
            <li><strong>High Server Traffic:</strong> Major in-game events, esports tournaments, or new season launches causing high queue volumes on game servers.</li>
            <li><strong>Incorrect or Incomplete Player ID:</strong> Misspelled or missing Zone IDs requiring manual customer clarification.</li>
          </ul>
        </div>
      </div>

      {/* 4. Tracking Delayed Orders & Customer Support */}
      <div className="rounded-2xl border border-zinc-800 bg-[#101016] p-6 sm:p-8 space-y-4">
        <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-emerald-400" />
          <span>4. What to Do If Your Order is Delayed</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          If your payment was completed successfully and you have waited 15–30 minutes but your credits have not yet appeared in your game:
        </p>
        <ol className="space-y-2 text-xs text-zinc-300 list-decimal list-inside leading-relaxed">
          <li>Restart your game client to refresh your in-game diamond/credit balance and check your in-game mail tab.</li>
          <li>Check your order status using our website's <strong>"Verify Order"</strong> feature using your Order ID (e.g. UMT-XXXXXX-XXXX).</li>
          <li>
            Contact our WhatsApp support team at <strong className="text-emerald-400">0742235836</strong> with your Order ID and Player UID. Our operators will check the game server queue and ensure your order is completed.
          </li>
        </ol>
      </div>
    </PolicyLayout>
  );
};
