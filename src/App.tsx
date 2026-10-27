import React from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { BottomNavigation } from './components/BottomNavigation';
import { HomeScreen } from './components/HomeScreen';
import { CategoriesScreen } from './components/CategoriesScreen';
import { ProductDetailScreen } from './components/ProductDetailScreen';
import { CartScreen } from './components/CartScreen';
import { FavoritesScreen } from './components/FavoritesScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { LoginScreen } from './components/LoginScreen';
import { AddCardScreen } from './components/AddCardScreen';
import { PaymentCheckoutScreen } from './components/PaymentCheckoutScreen';
import { ComboSuggestionsScreen } from './components/ComboSuggestionsScreen';
import { OrdersScreen } from './components/OrdersScreen';
import { AddressesScreen } from './components/AddressesScreen';
import { AdminCatalogScreen } from './components/AdminCatalogScreen';
import { TechStackGuideModal } from './components/TechStackGuideModal';
import { CheckoutModal } from './components/CheckoutModal';

const MainAppContent: React.FC = () => {
  const { 
    currentTab, 
    subScreen,
    closeSubScreen,
    selectedProduct, 
    closeProductDetail, 
    toastMessage
  } = useCart();

  const renderActiveScreen = () => {
    // 1. Full Screen Sub-routes
    if (subScreen === 'login') {
      return <LoginScreen onBack={closeSubScreen} />;
    }
    if (subScreen === 'add-card') {
      return <AddCardScreen onBack={closeSubScreen} />;
    }
    if (subScreen === 'payment-checkout') {
      return <PaymentCheckoutScreen onBack={closeSubScreen} />;
    }
    if (subScreen === 'combo-suggestions') {
      return <ComboSuggestionsScreen onBack={closeSubScreen} />;
    }
    if (subScreen === 'orders') {
      return <OrdersScreen onBack={closeSubScreen} />;
    }
    if (subScreen === 'addresses') {
      return <AddressesScreen />;
    }
    if (subScreen === 'admin-catalog') {
      return <AdminCatalogScreen />;
    }

    // 2. Product Detail Page
    if (selectedProduct) {
      return (
        <ProductDetailScreen
          product={selectedProduct}
          onBack={closeProductDetail}
        />
      );
    }

    // 3. Tab Screens
    switch (currentTab) {
      case 'home':
        return <HomeScreen />;
      case 'categorias':
        return <CategoriesScreen />;
      case 'carrinho':
        return <CartScreen />;
      case 'favoritos':
        return <FavoritesScreen />;
      case 'perfil':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  const showBottomNav = !selectedProduct && subScreen === 'none';

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#171B2B] flex flex-col w-full antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
          <div className="bg-[#171B2B] text-white px-5 py-2.5 rounded-full shadow-2xl text-xs font-bold flex items-center gap-2 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#FF6B57]"></span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Clean Unified Responsive Header */}
      <Header />

      {/* Main Store Viewport (Fully Responsive without mobile phone shells) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-6">
        {renderActiveScreen()}
      </main>

      {/* Clean E-Commerce Desktop Footer */}
      <Footer />

      {/* Mobile-Only Bottom Navigation (Thumb friendly on mobile, hidden on desktop) */}
      {showBottomNav && (
        <div className="md:hidden">
          <BottomNavigation />
        </div>
      )}

      {/* Global Interactive Modals */}
      <TechStackGuideModal />
      <CheckoutModal />
    </div>
  );
};

export default function App() {
  return (
    <CartProvider>
      <MainAppContent />
    </CartProvider>
  );
}
