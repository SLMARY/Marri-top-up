import React, { useState } from 'react';
import { MessageCircle, X, Send, ShieldCheck } from 'lucide-react';

interface FloatingWhatsAppProps {
  businessWhatsApp: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ businessWhatsApp }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMsg, setUserMsg] = useState('');

  const digits = businessWhatsApp.replace(/[^0-9]/g, '');
  const cleanPhone = digits.startsWith('0') ? '94' + digits.slice(1) : digits.startsWith('94') ? digits : '94' + digits;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalMsg = userMsg.trim() || 'Hello Uchiha Marri Top Up! I need help with my gaming top-up.';
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(finalMsg)}`;
    window.open(url, '_blank');
    setIsOpen(false);
    setUserMsg('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Quick Popover Chat Box */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-88 rounded-2xl border border-emerald-500/30 bg-[#101016] p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md">
                <MessageCircle className="h-5 w-5" />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#101016]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">Uchiha Support</h4>
                <span className="text-[11px] text-emerald-400 font-medium">Online · Ready to Top Up</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Body */}
          <div className="py-3 text-xs text-zinc-300 space-y-2">
            <p className="p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-zinc-200 leading-relaxed">
              👋 Hey gamer! Need help paying with Visa/Mastercard or want to verify your UID top-up delivery?
              Chat directly with our team on WhatsApp.
            </p>
          </div>

          {/* Input & Send Form */}
          <form onSubmit={handleSend} className="flex gap-2 pt-1">
            <input
              type="text"
              value={userMsg}
              onChange={(e) => setUserMsg(e.target.value)}
              placeholder="Type your message or UID..."
              className="flex-1 rounded-lg border border-zinc-800 bg-[#161622] px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
            />
            <button
              type="submit"
              className="cursor-pointer inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[10px] text-zinc-500">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Official WhatsApp Support: {businessWhatsApp}</span>
          </div>
        </div>
      )}

      {/* Floating Action Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Contact Uchiha Marri Top Up on WhatsApp"
        className="cursor-pointer group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white shadow-2xl shadow-emerald-950/80 transition-all duration-300 hover:scale-110 active:scale-95"
      >
        {/* Glow Ring */}
        <span className="absolute -inset-1 rounded-full bg-emerald-500/30 blur-sm animate-pulse" />

        {/* Unread dot or icon */}
        <MessageCircle className="relative h-7 w-7 text-white transition-transform group-hover:scale-105" />

        {/* Mini text tooltip label on desktop */}
        <span className="sr-only">WhatsApp Support</span>
      </button>
    </div>
  );
};
