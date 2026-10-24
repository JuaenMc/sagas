import React from 'react';
import { useCart } from '../context/CartContext';
import { Smartphone, Monitor, Code2, Heart, ShoppingBag, ArrowLeft, Search, User } from 'lucide-react';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, showBack, onBack }) => {
  const { cart, favorites, currentTab, setCurrentTab, viewMode, setViewMode, setIsTechGuideOpen, currentUser } = useCart();

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE6DF] shadow-xs">
      {/* Top Device & Tech Guide Toolstrip (only in web view or preview controls) */}
      <div className="bg-[#171b2b] text-white px-3 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-gray-300">SAGAS Store:</span>
          <span className="text-amber-300 font-bold hidden sm:inline">Web & APK Demo</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Switcher: Mobile Phone APK vs Web View */}
          <div className="flex items-center bg-gray-800 rounded-lg p-0.5 border border-gray-700">
            <button
              onClick={() => setViewMode('mobile')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                viewMode === 'mobile' ? 'bg-[#ff6b57] text-white shadow-xs' : 'text-gray-300 hover:text-white'
              }`}
              title="Simulador de Smartphone / APK Android"
            >
              <Smartphone size={13} />
              <span>APK</span>
            </button>
            <button
              onClick={() => setViewMode('web')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                viewMode === 'web' ? 'bg-[#ff6b57] text-white shadow-xs' : 'text-gray-300 hover:text-white'
              }`}
              title="Visão Web Desktop / Tablet"
            >
              <Monitor size={13} />
              <span>Web</span>
            </button>
          </div>

          {/* Tech stack question answer button */}
          <button
            onClick={() => setIsTechGuideOpen(true)}
            className="flex items-center gap-1 bg-[#3d6751] hover:bg-[#2e5240] text-emerald-100 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border border-emerald-600 transition-all active:scale-95 shadow-xs"
          >
            <Code2 size={13} />
            <span className="truncate max-w-[140px] sm:max-w-none">Dúvida APK & Next.js</span>
          </button>
        </div>
      </div>

      {/* Screen-Specific App Header */}
      {title ? (
        <div className="h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showBack && (
              <button
                onClick={onBack}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#171b2b] transition-colors"
                aria-label="Voltar"
              >
                <ArrowLeft size={22} />
              </button>
            )}
            <h1 className="font-bold text-base sm:text-lg text-[#171b2b] uppercase tracking-tight truncate">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentTab('carrinho')}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 relative text-[#171b2b]"
              aria-label="Carrinho"
            >
              <ShoppingBag size={22} />
              {totalCartCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#ff6b57] text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ff6b57] text-[28px]">
              storefront
            </span>
            <span className="font-extrabold text-xl tracking-tight text-[#171b2b] uppercase">
              Home
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentTab('categorias')}
              className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 hover:text-black hover:bg-gray-100 transition-colors"
              aria-label="Pesquisar produtos"
            >
              <Search size={22} />
            </button>

            <button
              onClick={() => setCurrentTab('favoritos')}
              className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 hover:text-[#ff6b57] hover:bg-gray-100 relative transition-colors"
              aria-label="Favoritos"
            >
              <Heart size={22} />
              {favorites.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#ff6b57]"></span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('perfil')}
              className="w-8 h-8 rounded-full overflow-hidden border border-white/60 bg-[#FF6B57] flex items-center justify-center text-white ml-1 shadow-xs hover:opacity-90 transition-opacity"
              aria-label="Perfil de usuário"
            >
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={18} />
              )}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
