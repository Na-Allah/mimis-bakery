import React from 'react';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { HeroBanner } from './components/home/HeroBanner';
import { SectionCards } from './components/home/SectionCards';
import { FeaturedProducts } from './components/home/FeaturedProducts';
import { AboutSection } from './components/home/AboutSection';
import { MenuBrowser } from './components/catalog/MenuBrowser';
import { CartDrawer } from './components/cart/CartDrawer';
import { CartPage } from './components/cart/CartPage';
import { CheckoutPage } from './components/checkout/CheckoutPage';
import { OrderConfirmationPage } from './components/orders/OrderConfirmationPage';
import { OrderTrackerModal } from './components/orders/OrderTrackerModal';
import { OrderStatusPage } from './components/orders/OrderStatusPage';
import { ProductDetailModal } from './components/catalog/ProductDetailModal';
import { AdminPortal } from './components/admin/AdminPortal';
import { AdminLoginForm } from './components/admin/AdminLoginForm';
import { MyOrdersPage } from './components/orders/MyOrdersPage';
import { AuthModal } from './components/auth/AuthModal';
import { AuthScreen } from './components/auth/AuthScreen';
import { CourierPage } from './components/orders/CourierPage';
import { ProfilePage } from './components/profile/ProfilePage';

const MainContent: React.FC = () => {
  const { activeView, isAuthenticated, openAuthModal, navigateTo } = useRestaurant();

  if (!isAuthenticated) {
    return (
      <main id="view-auth-required" className="min-h-[55vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold text-[#111827]">Sign in to continue</h1>
          <p className="text-sm text-[#475569]">
            Sign in to access the website and place orders.
          </p>
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className="px-6 py-3 rounded-xl bg-[#C8102E] text-white font-semibold min-h-[44px]"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => openAuthModal('register')}
            className="ml-3 px-6 py-3 rounded-xl border border-[#E5E7EB] font-semibold min-h-[44px]"
          >
            Create Account
          </button>
        </div>
      </main>
    );
  }

  switch (activeView.type) {
    case 'home':
      return (
        <main id="view-home">
          <HeroBanner />
          {isAuthenticated ? (
            <>
              <SectionCards />
              <FeaturedProducts />
            </>
          ) : (
            <section className="px-4 py-12 text-center bg-white">
              <h2 className="text-xl font-bold text-[#111827]">Sign in to explore our menu</h2>
              <p className="mt-2 text-sm text-[#475569]">Create an account or sign in to view products and place an order.</p>
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="mt-4 px-6 py-3 rounded-xl bg-[#C8102E] text-white font-semibold min-h-[44px]"
              >
                Sign In to View Menu
              </button>
            </section>
          )}
          <AboutSection />
        </main>
      );

    case 'menu':
      return (
        <main id="view-menu">
          <MenuBrowser
            initialSectionSlug={'sectionSlug' in activeView ? activeView.sectionSlug : undefined}
            initialCategorySlug={'categorySlug' in activeView ? activeView.categorySlug : undefined}
          />
        </main>
      );

    case 'cart':
      return (
        <main id="view-cart">
          <CartPage />
        </main>
      );

    case 'checkout':
      return (
        <main id="view-checkout">
          <CheckoutPage />
        </main>
      );

    case 'order-success':
      return (
        <main id="view-order-success">
          <OrderConfirmationPage
            orderNumber={activeView.orderNumber}
            trackingToken={activeView.trackingToken}
          />
        </main>
      );

    case 'track-order':
      return (
        <main id="view-track-order">
          <OrderTrackerModal
            initialOrderNumber={activeView.orderNumber}
            initialTrackingToken={activeView.trackingToken}
          />
        </main>
      );

    case 'my-orders':
      return (
        <main id="view-my-orders">
          <MyOrdersPage />
        </main>
      );
    case 'order-status':
      return (
        <main id="view-order-status">
          <OrderStatusPage orderNumber={activeView.orderNumber} />
        </main>
      );
    case 'profile':
      return (
        <main id="view-profile">
          <ProfilePage />
        </main>
      );
    case 'courier':
      return (
        <main id="view-courier">
          {activeView.type === 'courier' && <CourierPage />}
        </main>
      );

    case 'admin':
      return (
        <main id="view-admin">
          <AdminPortal />
        </main>
      );

    default:
      return (
        <main id="view-default">
          <HeroBanner />
          <SectionCards />
          <FeaturedProducts />
          <AboutSection />
        </main>
      );
  }
};

const AppShell: React.FC = () => {
  const {
    authLoading,
    authRestoreError,
    retryAuthRestore,
    currentUser,
    realtimeStatus,
  } = useRestaurant();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8ED] text-[#111827]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#F4B942] border-t-[#C8102E]" />
          <p className="mt-3 text-sm font-medium text-slate-600">Loading your session…</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF8ED] text-[#111827] selection:bg-[#C8102E] selection:text-white">
      {authRestoreError && (
        <div role="alert" className="flex items-center justify-center gap-3 bg-amber-50 px-4 py-2 text-sm text-amber-900">
          <span>We couldn&apos;t verify your session. Your sign-in has not been cleared.</span>
          <button type="button" onClick={() => void retryAuthRestore()} className="font-semibold underline">
            Try again
          </button>
        </div>
      )}
      {(realtimeStatus === 'reconnecting' || realtimeStatus === 'error' || realtimeStatus === 'unauthorized') && (
        <div role="status" className="flex items-center justify-center gap-2 bg-amber-50 px-4 py-2 text-sm text-amber-900">
          {realtimeStatus === 'unauthorized'
            ? 'Live updates could not authenticate. Please sign in again.'
            : 'Live updates are reconnecting. Changes will appear when the connection is restored.'}
        </div>
      )}
      <Navbar />
      <div className="flex-1 pb-24 lg:pb-0">
        <MainContent />
      </div>
      <Footer />

      {/* Global Overlays & Modals */}
      <CartDrawer />
      <ProductDetailModal />
      <ToastContainer />

      {/* Unified Authentication Modal (Customer Register/Login + Admin Access) */}
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <RestaurantProvider>
      <AppShell />
    </RestaurantProvider>
  );
}
