import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, MessageCircle, Mail, MapPin, Lock, FileText, ShieldCheck } from 'lucide-react';
import logoImg from '../assets/images/uchiha_marri_official_logo.jpeg';

interface FooterProps {
  onOpenSettings: () => void;
  businessWhatsApp: string;
}

export const Footer: React.FC<FooterProps> = ({ onOpenSettings, businessWhatsApp }) => {
  const digits = businessWhatsApp.replace(/[^0-9]/g, '');
  const cleanPhone = digits.startsWith('0') ? '94' + digits.slice(1) : digits.startsWith('94') ? digits : '94' + digits;
  const whatsappUrl = `https://wa.me/${cleanPhone}`;

  return (
    <footer className="border-t border-zinc-800 bg-[#060608] text-zinc-400 py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1 & 2: Brand Info & Description */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={logoImg}
                alt="Uchiha Marri Top Up"
                className="h-10 w-10 rounded-lg border border-red-500/40 object-cover shadow-sm"
                referrerPolicy="no-referrer"
              />
              <div>
                <h4 className="font-display font-black text-white text-base tracking-wide">
                  UCHIHA MARRI TOP UP
                </h4>
                <p className="text-[11px] text-red-400 font-semibold uppercase tracking-wider">
                  FAST, SAFE & EASY GAMING TOP UPS
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-400 max-w-md leading-relaxed">
              Sri Lanka's dedicated digital portal for Free Fire Diamonds, Mobile Legends, PUBG Mobile,
              Call of Duty, and gaming passes. Pay directly in LKR with Visa and Mastercard debit or credit
              cards via secure PayHere checkout.
            </p>

            <div className="pt-1 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>PayHere Hosted 3D-Secure 256-bit Checkout</span>
              </div>
              <div className="text-[11px] text-zinc-500">
                Digital gaming goods only. Credits delivered directly to player account UID.
              </div>
            </div>
          </div>

          {/* Col 3: Legal Policies (Required for PayHere merchant audit) */}
          <div className="space-y-3">
            <h5 className="font-display font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-red-400" />
              <span>Legal Policies</span>
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about-us" className="text-zinc-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-zinc-400 hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-zinc-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="text-zinc-400 hover:text-white transition-colors">
                  Refund & Cancellation Policy
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="text-zinc-400 hover:text-white transition-colors">
                  Shipping & Delivery Policy
                </Link>
              </li>
              <li>
                <Link to="/how-to-order" className="text-zinc-400 hover:text-white transition-colors">
                  How to Order Guide
                </Link>
              </li>
              <li>
                <Link to="/receipt" className="text-pink-400 hover:text-pink-300 font-semibold transition-colors flex items-center gap-1">
                  <span>★ Official Payment Receipts</span>
                </Link>
              </li>
              <li>
                <Link to="/contact-us" className="text-zinc-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Official Contact Details */}
          <div className="space-y-3">
            <h5 className="font-display font-bold text-white text-xs uppercase tracking-wider">
              Contact Details
            </h5>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">WhatsApp Support:</span>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-emerald-400 font-bold hover:underline"
                  >
                    {businessWhatsApp}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Business Email:</span>
                  <span className="font-mono text-[11px] text-rose-300">
                    uchihamarri@gmail.com
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Business Address:</span>
                  <span className="text-[11px] text-zinc-300">
                    No.138/4a, Temple Rd, Madulawa, Padukka
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* Col 5: Payment Gateways & Card Security */}
          <div className="space-y-3">
            <h5 className="font-display font-bold text-white text-xs uppercase tracking-wider">
              Payment Methods
            </h5>
            <div className="flex flex-wrap gap-2">
              <div className="rounded bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-[11px] font-bold text-white flex items-center gap-1.5">
                <span className="text-blue-400 italic">VISA</span>
              </div>
              <div className="rounded bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-[11px] font-bold text-white flex items-center gap-1.5">
                <span className="text-amber-400">Mastercard</span>
              </div>
              <div className="rounded bg-zinc-900 border border-zinc-800 px-3 py-1.5 text-[11px] font-bold text-white flex items-center gap-1.5">
                <span className="text-red-400 font-extrabold">PayHere</span>
              </div>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Currency: <strong>LKR</strong>. All transactions are authenticated with bank SMS OTPs via PayHere.
            </p>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-zinc-400 text-center sm:text-left">
            © {new Date().getFullYear()} UCHIHA MARRI TOP UP. All rights reserved. Sri Lanka.
          </p>

          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="text-zinc-500 hover:text-zinc-400">
              Privacy
            </Link>
            <span className="text-zinc-700">·</span>
            <Link to="/terms-of-service" className="text-zinc-500 hover:text-zinc-400">
              Terms
            </Link>
            <span className="text-zinc-700">·</span>
            <button
              onClick={onOpenSettings}
              className="cursor-pointer text-zinc-400 hover:text-zinc-300 flex items-center gap-1 transition-colors"
              title="Merchant Settings"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Gateway Settings</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
