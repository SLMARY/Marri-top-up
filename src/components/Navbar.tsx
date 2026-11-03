import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Menu,
  X,
  Flame,
  ChevronDown,
  FileText,
  User,
  LogIn,
  UserPlus,
  LogOut,
} from 'lucide-react';
import logoImg from '../assets/images/uchiha_marri_official_logo.jpeg';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onPayNowClick: () => void;
  onOpenLookup: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onPayNowClick,
  onOpenLookup,
}) => {
  const { customer, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [policiesDropdownOpen, setPoliciesDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handlePayNow = () => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        onPayNowClick();
      }, 100);
    } else {
      onPayNowClick();
    }
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const isHome = location.pathname === '/';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#09090d]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <Link
          to="/"
          className="flex items-center gap-3 text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 transition-opacity hover:opacity-90"
        >
          <img
            src={logoImg}
            alt="Uchiha Marri Top Up Logo"
            className="h-10 w-10 rounded-lg border border-red-500/40 object-cover shadow-sm shadow-red-950"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col">
            <span className="font-display text-base sm:text-lg font-black tracking-wider uppercase bg-gradient-to-r from-red-500 via-rose-400 to-red-600 bg-clip-text text-transparent">
              UCHIHA MARRI
            </span>
            <span className="text-[10px] tracking-widest text-zinc-400 font-semibold -mt-1 uppercase">
              TOP UP PORTAL
            </span>
          </div>
        </Link>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-zinc-300">
          <Link
            to="/"
            className={`transition-colors whitespace-nowrap shrink-0 ${
              isHome ? 'text-red-400 font-bold' : 'hover:text-red-400'
            }`}
          >
            Top Up Portal
          </Link>

          <button
            onClick={() => {
              if (location.pathname !== '/') {
                navigate('/');
                setTimeout(() => {
                  document.getElementById('memberships')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              } else {
                document.getElementById('memberships')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="cursor-pointer hover:text-amber-400 text-zinc-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 font-semibold"
          >
            <span>👑 Memberships</span>
          </button>

          <Link
            to="/how-to-order"
            className={`transition-colors whitespace-nowrap shrink-0 ${
              location.pathname === '/how-to-order' ? 'text-red-400 font-bold' : 'hover:text-red-400'
            }`}
          >
            How to Order
          </Link>

          {/* Legal Policies Dropdown */}
          <div className="relative">
            <button
              onClick={() => setPoliciesDropdownOpen(!policiesDropdownOpen)}
              onMouseEnter={() => setPoliciesDropdownOpen(true)}
              className="flex items-center gap-1 hover:text-red-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1"
            >
              <span>Policies</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {policiesDropdownOpen && (
              <div
                onMouseLeave={() => setPoliciesDropdownOpen(false)}
                className="absolute top-full left-0 mt-1 w-56 rounded-xl border border-zinc-800 bg-[#101016] p-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 space-y-1 z-50 text-xs"
              >
                <Link
                  to="/about-us"
                  onClick={() => setPoliciesDropdownOpen(false)}
                  className="block px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-800/80 hover:text-white"
                >
                  About Us
                </Link>
                <Link
                  to="/terms-of-service"
                  onClick={() => setPoliciesDropdownOpen(false)}
                  className="block px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-800/80 hover:text-white"
                >
                  Terms & Conditions
                </Link>
                <Link
                  to="/privacy-policy"
                  onClick={() => setPoliciesDropdownOpen(false)}
                  className="block px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-800/80 hover:text-white"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/refund-policy"
                  onClick={() => setPoliciesDropdownOpen(false)}
                  className="block px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-800/80 hover:text-white"
                >
                  Refund & Cancellation
                </Link>
                <Link
                  to="/shipping-policy"
                  onClick={() => setPoliciesDropdownOpen(false)}
                  className="block px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-800/80 hover:text-white"
                >
                  Shipping & Delivery
                </Link>
                <Link
                  to="/contact-us"
                  onClick={() => setPoliciesDropdownOpen(false)}
                  className="block px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-800/80 hover:text-white"
                >
                  Contact Us
                </Link>
              </div>
            )}
          </div>

          <Link
            to="/receipt"
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              location.pathname === '/receipt' ? 'text-pink-400 font-bold' : 'hover:text-pink-400'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-pink-500" />
            <span>Receipts</span>
          </Link>

          <button
            onClick={onOpenLookup}
            className="flex items-center gap-1.5 hover:text-red-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-red-400" />
            <span>Verify Order</span>
          </button>
        </nav>

        {/* Zone 3: Customer Auth & Primary Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          {customer ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/dashboard"
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${
                  location.pathname === '/dashboard'
                    ? 'border-red-500 bg-red-950/50 text-white'
                    : 'border-zinc-800 bg-[#14141d] text-zinc-200 hover:border-red-500/50 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5 text-red-400" />
                <span className="max-w-[110px] truncate">{customer.fullName.split(' ')[0]}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                title="Logout"
                className="cursor-pointer rounded-lg border border-zinc-800 bg-[#14141d] p-2 text-zinc-400 hover:text-red-400 hover:border-red-500/40 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#14141d] px-3 py-2 text-xs font-bold text-zinc-200 hover:border-red-500/50 hover:text-white transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-red-400" />
                <span>Login</span>
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-900/50 hover:text-white transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </Link>
            </div>
          )}

          <button
            onClick={handlePayNow}
            className="cursor-pointer group relative inline-flex items-center gap-2 overflow-hidden rounded-md bg-gradient-to-r from-red-600 to-red-700 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/60 transition-all duration-200 hover:from-red-500 hover:to-red-600 hover:shadow-red-700/40 active:scale-95 whitespace-nowrap shrink-0"
          >
            <Flame className="w-4 h-4 text-red-200 transition-transform group-hover:scale-110" />
            <span>PAY NOW</span>
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-zinc-400 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#0c0c10] px-4 py-4 space-y-2.5 text-sm">
          {/* Customer Account Strip on Mobile */}
          <div className="pb-3 mb-2 border-b border-zinc-800">
            {customer ? (
              <div className="flex items-center justify-between gap-2">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-2.5 text-xs font-bold text-white"
                >
                  <User className="w-4 h-4 text-red-400" />
                  <span>My Dashboard ({customer.fullName.split(' ')[0]})</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#14141d] px-3 py-2.5 text-xs font-bold text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-800 bg-[#14141d] py-2.5 text-xs font-bold text-white"
                >
                  <LogIn className="w-4 h-4 text-red-400" />
                  <span>Customer Login</span>
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 py-2.5 text-xs font-bold text-white"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={handlePayNow}
            className="w-full text-left py-2 font-bold text-white hover:text-red-400 flex items-center justify-between"
          >
            <span>Top Up Payment Portal</span>
            <span className="text-xs text-red-400">LKR</span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (location.pathname !== '/') {
                navigate('/');
                setTimeout(() => {
                  document.getElementById('memberships')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              } else {
                document.getElementById('memberships')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="w-full text-left py-2 font-bold text-amber-300 hover:text-amber-200 flex items-center justify-between"
          >
            <span>👑 Membership Price List (7 Packs)</span>
            <span className="text-xs text-amber-400">LKR</span>
          </button>

          <Link
            to="/how-to-order"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-zinc-300 hover:text-red-400"
          >
            How to Order Guide
          </Link>

          <Link
            to="/about-us"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-zinc-300 hover:text-red-400"
          >
            About Us
          </Link>

          <div className="pt-2 border-t border-zinc-800 space-y-2">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
              Legal Policies & Compliance
            </span>
            <Link
              to="/terms-of-service"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 text-xs text-zinc-300 hover:text-red-400"
            >
              • Terms & Conditions
            </Link>
            <Link
              to="/privacy-policy"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 text-xs text-zinc-300 hover:text-red-400"
            >
              • Privacy Policy
            </Link>
            <Link
              to="/refund-policy"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 text-xs text-zinc-300 hover:text-red-400"
            >
              • Refund & Cancellation Policy
            </Link>
            <Link
              to="/shipping-policy"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 text-xs text-zinc-300 hover:text-red-400"
            >
              • Shipping & Delivery Policy
            </Link>
            <Link
              to="/contact-us"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 text-xs text-zinc-300 hover:text-red-400"
            >
              • Contact Us
            </Link>
          </div>

          <Link
            to="/receipt"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-pink-400 hover:text-pink-300 font-semibold flex items-center gap-2 border-t border-zinc-800"
          >
            <FileText className="w-4 h-4 text-pink-400" />
            <span>Official Receipts & Verification</span>
          </Link>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenLookup();
            }}
            className="w-full text-left pt-2 border-t border-zinc-800 text-zinc-300 hover:text-red-400 flex items-center gap-2"
          >
            <Search className="w-4 h-4 text-red-400" />
            <span>Verify Order & Download Receipt</span>
          </button>
        </div>
      )}
    </header>
  );
};

