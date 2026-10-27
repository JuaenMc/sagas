import React from 'react';
import { useCart } from '../context/CartContext';
import { Home, Grid, ShoppingBag, Heart, User } from 'lucide-react';
import { ScreenTab } from '../types';

export const BottomNavigation: React.FC = () => {
  const { currentTab, setCurrentTab, cart, favorites, selectedProduct, closeProductDetail } = useCart();

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navItems: { tab: ScreenTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      tab: 'home',
      label: 'Home',
      icon: <Home size={22} />
    },
    {
      tab: 'categorias',
      label: 'Categorias',
      icon: <Grid size={22} />
    },
    {
      tab: 'carrinho',
      label: 'Carrinho',
      icon: <ShoppingBag size={22} />,
      badge: totalCartCount
    },
    {
      tab: 'favoritos',
      label: 'Favoritos',
      icon: <Heart size={22} />,
      badge: favorites.length > 0 ? favorites.length : undefined
    },
    {
      tab: 'perfil',
      label: 'Perfil',
      icon: <User size={22} />
    }
  ];

  const handleSelectTab = (tab: ScreenTab) => {
    if (selectedProduct) {
      closeProductDetail();
    }
    setCurrentTab(tab);
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-xl border-t border-[#EAE6DF] shadow-[0_-4px_16px_rgba(0,0,0,0.04)] w-full">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(item => {
          const isActive = currentTab === item.tab && !selectedProduct;
          return (
            <button
              key={item.tab}
              onClick={() => handleSelectTab(item.tab)}
              className={`flex flex-col items-center justify-center w-16 h-full transition-all relative ${
                isActive ? 'text-[#ff6b57] font-semibold' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#ff6b57] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 ${isActive ? 'font-bold' : 'font-normal'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
