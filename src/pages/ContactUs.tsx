import React, { useState } from 'react';
import { PolicyLayout } from '../components/PolicyLayout';
import { MessageCircle, Mail, MapPin, Clock, Send, ShieldCheck, Check, AlertCircle } from 'lucide-react';

export const ContactUs: React.FC = () => {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [orderId, setOrderId] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const encodedText = encodeURIComponent(
      `Hello Uchiha Marri Top Up!
Name: ${name}
WhatsApp: ${whatsapp}
${orderId ? `Order ID: ${orderId}\n` : ''}Message: ${message}`
    );
    window.open(`https://wa.me/94742235836?text=${encodedText}`, '_blank');
    setSubmitted(true);
  };

  return (
    <PolicyLayout
      title="Contact Us"
      subtitle="Reach our customer care team directly. We are here to assist with top-up queries, order verifications, and technical support."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Contact Information Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-[#101016] p-6 space-y-5">
            <h2 className="font-display text-lg font-bold text-white border-b border-zinc-800 pb-3">
              Official Business Contact Details
            </h2>

            {/* Business Name */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Business Name
              </span>
              <p className="font-display font-black text-white text-base">
                UCHIHA MARRI TOP UP
              </p>
              <span className="text-xs text-red-400 font-medium block">
                Gaming Top-Up & Digital Services — Sri Lanka
              </span>
            </div>

            {/* WhatsApp */}
            <div className="space-y-1 pt-2 border-t border-zinc-800/80">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Official WhatsApp Support (Primary)
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://wa.me/94742235836"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-base font-bold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>0742235836</span>
                </a>
              </div>
              <p className="text-[11px] text-zinc-400">
                International: +94 74 223 5836 (Direct chat for fast inquiries & receipts)
              </p>
            </div>

            {/* Business Email */}
            <div className="space-y-1 pt-2 border-t border-zinc-800/80">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Business Email
              </span>
              <div className="flex items-center gap-2 text-zinc-300 font-mono text-xs">
                <Mail className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="p-1 px-2 rounded bg-zinc-900 border border-zinc-800 text-rose-300">
                  [ADD MY REAL BUSINESS EMAIL]
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Formal legal inquiries, merchant communications, and payment audit requests.
              </p>
            </div>

            {/* Business Address */}
            <div className="space-y-1 pt-2 border-t border-zinc-800/80">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Business Address
              </span>
              <div className="flex items-start gap-2 text-zinc-300 text-xs">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="p-1 px-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                  [ADD MY REAL BUSINESS ADDRESS]
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Operating in Sri Lanka. Digital services only; all deliveries are electronic.
              </p>
            </div>

            {/* Operating Hours */}
            <div className="space-y-1 pt-2 border-t border-zinc-800/80">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>Operating Hours</span>
              </span>
              <p className="text-xs text-white font-medium">
                Online Top-Up Portal: 24 Hours / 7 Days a Week
              </p>
              <p className="text-[11px] text-zinc-400">
                WhatsApp Active Support: 8:00 AM – 11:30 PM (Sri Lanka Time / UTC+5:30)
              </p>
            </div>
          </div>

          {/* Quick WhatsApp Action Button */}
          <a
            href="https://wa.me/94742235836?text=Hello%20Uchiha%20Marri%20Top%20Up,%20I%20need%20assistance%20with%20my%20top-up."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-sm font-bold text-white shadow-xl shadow-emerald-950/60 hover:from-emerald-500 hover:to-teal-500 transition-all"
          >
            <MessageCircle className="w-5 h-5 text-white" />
            <span>Open WhatsApp Chat Directly (0742235836)</span>
          </a>
        </div>

        {/* Message / Support Inquiry Form (7 cols) */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-zinc-800 bg-[#101016] p-6 sm:p-8 space-y-5">
            <div>
              <h3 className="font-display text-lg font-bold text-white">
                Send a Support Inquiry
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Have a question about a pending top-up, incorrect Player ID, or need a payment status check? Fill out the details below to open a direct WhatsApp support ticket.
              </p>
            </div>

            {submitted && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-950/70 border border-emerald-500/40 p-4 text-xs text-emerald-300">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Inquiry opened in WhatsApp. Our representative will respond promptly.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Your Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dineth Silva"
                  className="w-full rounded-lg border border-zinc-800 bg-[#161622] px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    WhatsApp Mobile Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="e.g. 077 123 4567"
                    className="w-full rounded-lg border border-zinc-800 bg-[#161622] px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Transaction / Order ID (If Applicable)
                  </label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. UMT-892140-5219"
                    className="w-full rounded-lg border border-zinc-800 bg-[#161622] px-3.5 py-2.5 text-sm font-mono text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Message / Details of Your Inquiry <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe your question or issue, including your in-game UID and game name if relevant..."
                  className="w-full rounded-lg border border-zinc-800 bg-[#161622] p-3 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full cursor-pointer flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950 hover:from-red-500 hover:to-rose-600 transition-all"
              >
                <Send className="w-4 h-4 text-white" />
                <span>Submit Inquiry via WhatsApp</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </PolicyLayout>
  );
};
