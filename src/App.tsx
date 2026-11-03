import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PaymentForm } from './components/PaymentForm';
import { MembershipPriceList } from './components/MembershipPriceList';
import { SuccessView } from './components/SuccessView';
import { FailedView } from './components/FailedView';
import { GamesSection } from './components/GamesSection';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { OrderLookupModal } from './components/OrderLookupModal';
import { SettingsModal } from './components/SettingsModal';
import { Footer } from './components/Footer';
import { PayHereConfig } from './types';

// Policy Pages
import { AboutUs } from './pages/AboutUs';
import { ContactUs } from './pages/ContactUs';
import { TermsOfService } from './pages/TermsOfService';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { RefundPolicy } from './pages/RefundPolicy';
import { ShippingPolicy } from './pages/ShippingPolicy';
import { HowToOrder } from './pages/HowToOrder';
import { ReceiptPage } from './pages/ReceiptPage';

// Customer Auth & Account Pages
import { AuthProvider } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { DashboardPage } from './pages/DashboardPage';
import { ErrorBoundary } from './components/ErrorBoundary';

// Scroll to top on route change helper
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation / View state for PayHere checkout feedback
  const [viewState, setViewState] = useState<'HOME' | 'SUCCESS' | 'FAILED'>('HOME');
  const [currentTransaction, setCurrentTransaction] = useState<any | null>(null);
  const [failedDetails, setFailedDetails] = useState<any | null>(null);

  // Selected package from membership price list
  const [selectedPackageId, setSelectedPackageId] = useState<string | undefined>('weekly_membership');
  const [selectedAmount, setSelectedAmount] = useState<number | undefined>(570);

  // Modals
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // App configuration (defaulting to official WhatsApp 0742235836)
  const [config, setConfig] = useState<PayHereConfig>({
    merchantId: '',
    isSandbox: true,
    businessWhatsApp: '0742235836',
    businessName: 'UCHIHA MARRI TOP UP',
    hasCustomSecret: false,
  });

  const paymentFormRef = useRef<HTMLDivElement>(null);

  // Fetch store configuration on mount
  const fetchConfig = () => {
    fetch('/api/payhere/config')
      .then(async (res) => {
        if (!res.ok) return null;
        return res.json().catch(() => null);
      })
      .then((data: any) => {
        if (data && typeof data === 'object' && !data.error) {
          setConfig((prev) => ({
            ...prev,
            merchantId: typeof data.merchantId === 'string' ? data.merchantId : prev.merchantId,
            isSandbox: typeof data.isSandbox === 'boolean' ? data.isSandbox : prev.isSandbox,
            businessWhatsApp:
              typeof data.businessWhatsApp === 'string' && data.businessWhatsApp.trim()
                ? data.businessWhatsApp.trim()
                : prev.businessWhatsApp,
            businessName:
              typeof data.businessName === 'string' && data.businessName.trim()
                ? data.businessName.trim()
                : prev.businessName,
            hasCustomSecret: Boolean(data.hasCustomSecret),
          }));
        }
      })
      .catch((err) => console.error('Failed to load store config:', err));
  };

  useEffect(() => {
    fetchConfig();

    // Check URL parameters for PayHere return_url or cancel_url
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const orderId = urlParams.get('order_id');

    if (location.pathname === '/' && orderId) {
      // Always route to the server-verified Receipt Page (never mark order successful based only on frontend redirect)
      const statusSuffix = status ? `&status=${encodeURIComponent(status)}` : '';
      navigate(`/receipt?order_id=${encodeURIComponent(orderId)}${statusSuffix}`, { replace: true });
    } else if (location.pathname === '/' && (status === 'failed' || status === 'cancel' || status === 'cancelled')) {
      setFailedDetails({
        orderId: orderId || 'UMT-CANCELLED',
        reason: 'Payment transaction was declined by bank or cancelled on PayHere checkout page.',
      });
      setViewState('FAILED');
    }
  }, [navigate, location.pathname]);

  const scrollToPayment = () => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        setViewState('HOME');
        const el = document.getElementById('payment-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    } else {
      setViewState('HOME');
      setTimeout(() => {
        const el = document.getElementById('payment-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    }
  };

  const handleSelectMembership = (pkgId: string, pkgAmount: number) => {
    setSelectedPackageId(pkgId);
    setSelectedAmount(pkgAmount);
    scrollToPayment();
  };

  // Selected game ID state (e.g. 'free_fire', 'mobile_legends')
  const [selectedGameId, setSelectedGameId] = useState<string>('free_fire');

  const handleGameSelect = (gameId: string) => {
    setSelectedGameId(gameId);
    scrollToPayment();
  };

  const handlePaymentSuccess = (transaction: any) => {
    setCurrentTransaction(transaction);
    setViewState('SUCCESS');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentFailure = (errorDetails: any) => {
    setFailedDetails(errorDetails);
    setViewState('FAILED');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTryAgain = () => {
    setViewState('HOME');
    setTimeout(() => {
      scrollToPayment();
    }, 50);
  };

  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
          <ScrollToTop />

          {/* Top Navigation Bar with Real URL Routing */}
          <Navbar
            onPayNowClick={scrollToPayment}
            onOpenLookup={() => setIsLookupOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />

          {/* Main Content with Route Switching */}
          <main className="flex-1">
            <Routes>
              {/* Main Top Up Portal Route */}
              <Route
                path="/"
                element={
                  viewState === 'SUCCESS' && currentTransaction ? (
                    <SuccessView
                      transaction={currentTransaction}
                      onNewTopUp={() => {
                        setViewState('HOME');
                        window.history.replaceState({}, '', '/');
                      }}
                      businessWhatsApp={config.businessWhatsApp}
                    />
                  ) : viewState === 'FAILED' ? (
                    <FailedView
                      errorDetails={failedDetails}
                      onTryAgain={handleTryAgain}
                      businessWhatsApp={config.businessWhatsApp}
                    />
                  ) : (
                    <>
                      {/* Hero Section */}
                      <Hero
                        onPayNowClick={scrollToPayment}
                        businessWhatsApp={config.businessWhatsApp}
                      />

                      {/* Official 2026 Membership Price List Section */}
                      <MembershipPriceList onSelectMembership={handleSelectMembership} />

                      {/* Payment Form Section */}
                      <div ref={paymentFormRef} id="payment-section">
                        <PaymentForm
                          onPaymentSuccess={handlePaymentSuccess}
                          onPaymentFailure={handlePaymentFailure}
                          isSandboxMode={config.isSandbox}
                          preselectedPackageId={selectedPackageId}
                          preselectedAmount={selectedAmount}
                          selectedGameId={selectedGameId}
                          onSelectGameId={setSelectedGameId}
                        />
                      </div>

                      {/* Supported Games Catalog */}
                      <GamesSection onSelectGame={handleGameSelect} />
                    </>
                  )
                }
              />

              {/* Customer Authentication & Account Dashboard Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route
                path="/dashboard"
                element={<DashboardPage businessWhatsApp={config.businessWhatsApp} />}
              />

              {/* 7 Required Legal Policy Pages */}
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/contact-us" element={<ContactUs />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/shipping-policy" element={<ShippingPolicy />} />
              <Route path="/how-to-order" element={<HowToOrder />} />

              {/* Customer Receipt & Verification Routes */}
              <Route path="/receipt" element={<ReceiptPage businessWhatsApp={config.businessWhatsApp} />} />
              <Route path="/receipt/:orderId" element={<ReceiptPage businessWhatsApp={config.businessWhatsApp} />} />

              {/* Fallback route */}
              <Route
                path="*"
                element={
                  <div className="py-20 text-center space-y-4">
                    <h2 className="text-2xl font-bold text-white">Page Not Found</h2>
                    <p className="text-sm text-zinc-400">The requested page does not exist.</p>
                    <button
                      onClick={() => navigate('/')}
                      className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500"
                    >
                      Return to Home
                    </button>
                  </div>
                }
              />
            </Routes>
          </main>

          {/* Footer with Links to All 7 Policy Pages */}
          <Footer
            onOpenSettings={() => setIsSettingsOpen(true)}
            businessWhatsApp={config.businessWhatsApp}
          />

          {/* Floating WhatsApp Support Button (0742235836) */}
          <FloatingWhatsApp businessWhatsApp={config.businessWhatsApp} />

          {/* Order Lookup & PDF Receipt Retrieval Modal */}
          <OrderLookupModal
            isOpen={isLookupOpen}
            onClose={() => setIsLookupOpen(false)}
            businessWhatsApp={config.businessWhatsApp}
          />

          {/* PayHere & Business Settings Modal */}
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            onConfigUpdated={fetchConfig}
          />
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}
