import React from 'react';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { MobileCartBar } from './components/common/MobileCartBar';
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
import { ProductDetailModal } from './components/catalog/ProductDetailModal';
import { AdminPortal } from './components/admin/AdminPortal';

const MainContent: React.FC = () => {
  const { activeView } = useRestaurant();

  switch (activeView.type) {
    case 'home':
      return (
        <main id="view-home">
          <HeroBanner />
          <SectionCards />
          <FeaturedProducts />
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
          <OrderConfirmationPage orderNumber={activeView.orderNumber} />
        </main>
      );

    case 'track-order':
      return (
        <main id="view-track-order">
          <OrderTrackerModal initialOrderNumber={activeView.orderNumber} />
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

export default function App() {
  return (
    <RestaurantProvider>
      <div className="flex flex-col min-h-screen bg-stone-50 text-stone-900 selection:bg-amber-500 selection:text-white">
        <Navbar />
        <div className="flex-1">
          <MainContent />
        </div>
        <Footer />

        {/* Global Overlays & Modals */}
        <CartDrawer />
        <ProductDetailModal />
        <ToastContainer />
        <MobileCartBar />
      </div>
    </RestaurantProvider>
  );
}
