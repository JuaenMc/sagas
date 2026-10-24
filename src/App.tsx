import React from 'react';
import { CartProvider, useCart } from './context/CartContext';
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
import { Smartphone, Monitor, Code2, Wifi, Battery, Signal, User, LogIn, ShoppingBag } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { 
    currentTab, 
    subScreen,
    closeSubScreen,
    openSubScreen,
    selectedProduct, 
    closeProductDetail, 
    viewMode, 
    setViewMode, 
    toastMessage, 
    setIsTechGuideOpen,
    currentUser,
    firebaseAuthUser
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
    <div className="min-h-screen bg-[#EDECE6] flex flex-col items-center justify-start text-[#171B2B]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 z-50 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
          <div className="bg-[#171B2B] text-white px-4 py-2 rounded-full shadow-xl text-xs font-bold flex items-center gap-2 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#FF6B57]"></span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Bar for Desktop Preview / View Controls */}
      <div className="w-full bg-[#171B2B] text-white px-4 py-2 border-b border-gray-800 flex items-center justify-between shadow-md text-xs">
        <div className="flex items-center gap-2.5">
          <span className="font-black text-[#FF6B57] tracking-tight">SAGAS BRASIL</span>
          <span className="hidden sm:inline text-gray-400">• E-Commerce & App Android</span>

          {firebaseAuthUser ? (
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {firebaseAuthUser.displayName}
            </span>
          ) : (
            <button
              onClick={() => openSubScreen('login')}
              className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 text-[11px] font-semibold"
            >
              <LogIn size={12} />
              <span>Entrar com Google</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="bg-gray-800 p-1 rounded-xl flex items-center border border-gray-700">
            <button
              onClick={() => setViewMode('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                viewMode === 'mobile'
                  ? 'bg-[#FF6B57] text-white shadow-xs'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Smartphone size={14} />
              <span>Simulador APK</span>
            </button>
            <button
              onClick={() => setViewMode('web')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                viewMode === 'web'
                  ? 'bg-[#FF6B57] text-white shadow-xs'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Monitor size={14} />
              <span>Modo Web</span>
            </button>
          </div>

          {/* Quick Shortcuts */}
          <button
            onClick={() => openSubScreen('login')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold border border-gray-700 transition-all"
            title="Login / Cadastro"
          >
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="User" className="w-4 h-4 rounded-full object-cover" />
            ) : (
              <User size={14} />
            )}
            <span className="hidden sm:inline">Conta</span>
          </button>

          {/* Tech Guide */}
          <button
            onClick={() => setIsTechGuideOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-extrabold text-xs shadow-md hover:opacity-95 active:scale-95 transition-all"
          >
            <Code2 size={15} />
            <span className="hidden md:inline">Guia APK & Next</span>
          </button>
        </div>
      </div>

      {/* Main Container: Mobile Phone Mockup vs Responsive Web */}
      <div className="w-full flex justify-center py-0 sm:py-6 px-0 sm:px-4">
        {viewMode === 'mobile' ? (
          /* Smartphone APK Shell with realistic bezel & status bar */
          <div className="relative w-full max-w-[420px] bg-white sm:rounded-[44px] shadow-[0_20px_60px_rgba(0,0,0,0.18)] sm:border-[8px] sm:border-[#1F222E] overflow-hidden flex flex-col min-h-[100dvh] sm:min-h-[850px] sm:max-h-[880px]">
            {/* Phone Top Notch / Status Bar */}
            <div className="bg-white px-6 pt-2 pb-1 hidden sm:flex items-center justify-between text-[#171B2B] text-[11px] font-bold select-none border-b border-gray-50">
              <span>09:41</span>
              {/* Dynamic Island / Camera hole */}
              <div className="w-20 h-4 bg-black rounded-full"></div>
              <div className="flex items-center gap-1.5 text-gray-700">
                <Signal size={12} />
                <Wifi size={12} />
                <Battery size={14} />
              </div>
            </div>

            {/* Inner App viewport with scroll */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden relative bg-[#FAF9F6] no-scrollbar">
              {renderActiveScreen()}
            </div>

            {/* Bottom Nav */}
            {showBottomNav && <BottomNavigation />}

            {/* Phone Home Bar Indicator */}
            <div className="hidden sm:flex justify-center py-1.5 bg-white border-t border-gray-100">
              <div className="w-32 h-1 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        ) : (
          /* Responsive Web View */
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-lg border border-[#EAE6DF] overflow-hidden flex flex-col min-h-[850px]">
            <div className="flex-1 overflow-y-auto bg-[#FAF9F6]">
              {renderActiveScreen()}
            </div>
            {showBottomNav && <BottomNavigation />}
          </div>
        )}
      </div>

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
