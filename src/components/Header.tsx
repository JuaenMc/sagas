import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { 
  Search, ShoppingBag, Heart, User, Menu, X, ArrowLeft, 
  Flame, Layers, ChevronRight, LogIn, Sparkles, MapPin, PackageCheck
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    cart, 
    favorites, 
    currentTab, 
    setCurrentTab, 
    subScreen, 
    closeSubScreen, 
    openSubScreen,
    selectedProduct, 
    closeProductDetail,
    currentUser, 
    firebaseAuthUser,
    searchQuery,
    setSearchQuery,
    total
  } = useCart();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogoClick = () => {
    if (selectedProduct) closeProductDetail();
    if (subScreen !== 'none') closeSubScreen();
    setCurrentTab('home');
    setIsMobileMenuOpen(false);
  };

  const handleCategoryClick = (category: string) => {
    if (selectedProduct) closeProductDetail();
    if (subScreen !== 'none') closeSubScreen();
    setCurrentTab('categorias');
    setSearchQuery(category === 'todos' ? '' : category);
    setIsMobileMenuOpen(false);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (selectedProduct) closeProductDetail();
    if (subScreen !== 'none') closeSubScreen();
    if (currentTab !== 'home' && currentTab !== 'categorias') {
      setCurrentTab('home');
    }
  };

  return (
    <>
      {/* Top Announcement Strip */}
      <div className="w-full bg-[#171B2B] text-white text-[11px] font-medium py-1.5 px-4 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B57] animate-pulse"></span>
            <span className="hidden sm:inline text-gray-300">Frete Grátis acima de R$ 149</span>
            <span className="sm:hidden text-gray-300">Frete Grátis &gt; R$ 149</span>
            <span className="text-gray-400">•</span>
            <span className="text-amber-300 font-bold">Combo 3 por R$ 100</span>
          </div>

          <div className="flex items-center gap-4 text-gray-300">
            <span className="hidden md:inline">Parcele em até 6x s/ juros</span>
            {firebaseAuthUser ? (
              <span className="text-emerald-300 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                {currentUser?.displayName?.split(' ')[0] || 'Cliente'}
              </span>
            ) : (
              <button 
                onClick={() => openSubScreen('login')}
                className="hover:text-white transition flex items-center gap-1"
              >
                <LogIn size={11} />
                <span>Entrar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Responsive Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE6DF] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          
          {/* Left: Mobile Hamburger & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-10 h-10 -ml-1.5 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#171B2B] transition-colors"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Back button if in subScreen or product detail */}
            {(selectedProduct || subScreen !== 'none') && (
              <button
                onClick={() => {
                  if (selectedProduct) closeProductDetail();
                  else closeSubScreen();
                }}
                className="hidden sm:flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-[#171B2B] p-1.5 rounded-lg hover:bg-gray-100 transition mr-1"
                title="Voltar"
              >
                <ArrowLeft size={16} />
                <span>Voltar</span>
              </button>
            )}

            <button 
              onClick={handleLogoClick}
              className="flex items-center gap-1.5 focus:outline-none group text-left"
            >
              <span className="text-2xl font-black tracking-tighter text-[#FF6B57] group-hover:opacity-90 transition-opacity">
                SAGAS
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-[#BFEDD1] text-[#254F3A] uppercase tracking-wider">
                Brasil
              </span>
            </button>

            {/* Desktop Navigation Category Links */}
            <nav className="hidden lg:flex items-center gap-5 ml-6 text-xs font-bold text-[#171B2B]">
              <button 
                onClick={() => {
                  if (selectedProduct) closeProductDetail();
                  if (subScreen !== 'none') closeSubScreen();
                  setCurrentTab('home');
                }}
                className={`hover:text-[#FF6B57] transition py-1 ${currentTab === 'home' && !selectedProduct && subScreen === 'none' ? 'text-[#FF6B57] border-b-2 border-[#FF6B57]' : ''}`}
              >
                Início
              </button>
              <button 
                onClick={() => handleCategoryClick('Feminino')}
                className="hover:text-[#FF6B57] transition py-1"
              >
                Feminino
              </button>
              <button 
                onClick={() => handleCategoryClick('Infantil')}
                className="hover:text-[#FF6B57] transition py-1"
              >
                Infantil
              </button>
              <button 
                onClick={() => handleCategoryClick('Vestido')}
                className="hover:text-[#FF6B57] transition py-1"
              >
                Vestidos
              </button>
              <button 
                onClick={() => handleCategoryClick('Conjunto')}
                className="hover:text-[#FF6B57] transition py-1"
              >
                Conjuntos
              </button>
              <button 
                onClick={() => handleCategoryClick('Combo')}
                className="hover:text-[#FF6B57] transition py-1 inline-flex items-center gap-1 text-[#2E6945] bg-[#EBF7F0] px-2 py-0.5 rounded-full text-[11px]"
              >
                <Layers size={12} />
                <span>Combos 3x100</span>
              </button>
              <button 
                onClick={() => handleCategoryClick('Promoção')}
                className="hover:text-[#FF6B57] transition py-1 inline-flex items-center gap-1 text-[#FF6B57]"
              >
                <Flame size={13} className="fill-[#FF6B57]" />
                <span>Ofertas</span>
              </button>
            </nav>
          </div>

          {/* Center: Search Bar (Desktop & Tablet) */}
          <div className="hidden sm:flex relative flex-1 max-w-md mx-2 lg:mx-6">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <Search size={17} />
            </div>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar vestidos, conjuntos, infantil, tricôs..."
              className="w-full h-10 pl-10 pr-9 rounded-full bg-[#F3F2FF]/50 hover:bg-[#F3F2FF]/80 focus:bg-white text-[#171B2B] placeholder:text-gray-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B57]/30 border border-[#EAE6DF] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 flex items-center justify-center transition"
                title="Limpar busca"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Right: Quick Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile search toggle */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="sm:hidden w-9 h-9 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 transition"
              aria-label="Abrir busca"
            >
              <Search size={19} />
            </button>

            {/* Wishlist / Favoritos */}
            <button
              onClick={() => {
                if (selectedProduct) closeProductDetail();
                if (subScreen !== 'none') closeSubScreen();
                setCurrentTab('favoritos');
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-gray-700 hover:text-[#FF6B57] hover:bg-gray-100 relative transition-all active:scale-95"
              aria-label="Favoritos"
              title="Favoritos"
            >
              <Heart size={20} className={favorites.length > 0 ? 'text-[#FF6B57] fill-[#FF6B57]' : ''} />
              {favorites.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#FF6B57] ring-2 ring-white"></span>
              )}
            </button>

            {/* Cart / Sacola */}
            <button
              onClick={() => {
                if (selectedProduct) closeProductDetail();
                if (subScreen !== 'none') closeSubScreen();
                setCurrentTab('carrinho');
              }}
              className="flex items-center gap-1.5 h-9 sm:h-10 px-2.5 sm:px-3 rounded-full hover:bg-gray-100 text-gray-800 transition active:scale-95 relative"
              aria-label="Sacola de Compras"
              title="Sacola de Compras"
            >
              <div className="relative">
                <ShoppingBag size={20} className="text-[#171B2B]" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 bg-[#FF6B57] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {totalCartCount}
                  </span>
                )}
              </div>
              <div className="hidden lg:flex flex-col text-left text-xs ml-1 leading-tight">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Sacola</span>
                <span className="font-extrabold text-[#171B2B]">
                  R$ {total.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </button>

            {/* User Account / Profile */}
            <button
              onClick={() => {
                if (firebaseAuthUser) {
                  if (selectedProduct) closeProductDetail();
                  if (subScreen !== 'none') closeSubScreen();
                  setCurrentTab('perfil');
                } else {
                  openSubScreen('login');
                }
              }}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-full hover:bg-gray-100 transition active:scale-95 text-[#171B2B]"
              aria-label="Conta do Usuário"
              title={currentUser?.displayName || 'Minha Conta'}
            >
              {currentUser?.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-full object-cover border border-gray-200" 
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#FF6B57] text-white flex items-center justify-center shadow-xs font-bold text-xs">
                  <User size={16} />
                </div>
              )}
              <div className="hidden md:flex flex-col text-left leading-tight">
                <span className="text-[10px] text-gray-400 font-bold uppercase">
                  {firebaseAuthUser ? 'Olá,' : 'Entrar'}
                </span>
                <span className="text-xs font-extrabold text-[#171B2B] truncate max-w-[100px]">
                  {currentUser?.displayName?.split(' ')[0] || 'Minha Conta'}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Search Expandable Bar */}
        {isMobileSearchOpen && (
          <div className="sm:hidden px-4 pb-3 pt-1 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="relative flex items-center w-full">
              <Search size={16} className="absolute left-3 text-gray-400 pointer-events-none" />
              <input
                type="search"
                autoFocus
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Buscar produtos, categorias..."
                className="w-full h-10 pl-9 pr-9 rounded-full bg-[#F3F2FF]/60 text-xs text-[#171B2B] placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FF6B57]/30 border border-[#EAE6DF]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Sidebar / Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          {/* Drawer Content */}
          <aside className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-in slide-in-from-left duration-200">
            <div>
              {/* Drawer Top */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-[#FAF9F6]">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-[#FF6B57]">SAGAS</span>
                  <span className="text-[9px] font-extrabold bg-[#BFEDD1] text-[#254F3A] px-2 py-0.5 rounded-full uppercase">
                    Brasil
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-black"
                >
                  <X size={18} />
                </button>
              </div>

              {/* User Greeting Box */}
              <div className="p-4 bg-gradient-to-r from-orange-50/40 via-white to-white border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {currentUser?.photoURL ? (
                    <img src={currentUser.photoURL} alt="Foto" className="w-10 h-10 rounded-full object-cover border" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#FF6B57] text-white flex items-center justify-center font-bold text-sm">
                      <User size={18} />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xs font-bold text-[#171B2B]">
                      {currentUser?.displayName || 'Visitante'}
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      {firebaseAuthUser ? currentUser?.email : 'Faça login para salvar pedidos'}
                    </p>
                  </div>
                </div>

                {!firebaseAuthUser && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openSubScreen('login');
                    }}
                    className="px-3 py-1.5 rounded-full bg-[#FF6B57] text-white text-xs font-bold shadow-xs active:scale-95"
                  >
                    Entrar
                  </button>
                )}
              </div>

              {/* Navigation Categories */}
              <div className="p-4 flex flex-col space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2 block">
                  Departamentos
                </span>

                <button
                  onClick={() => handleCategoryClick('todos')}
                  className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 text-xs font-bold text-[#171B2B]"
                >
                  <span>Ver Todos os Produtos</span>
                  <ChevronRight size={15} className="text-gray-400" />
                </button>

                <button
                  onClick={() => handleCategoryClick('Feminino')}
                  className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 text-xs font-bold text-[#171B2B]"
                >
                  <span>Moda Feminina</span>
                  <ChevronRight size={15} className="text-gray-400" />
                </button>

                <button
                  onClick={() => handleCategoryClick('Infantil')}
                  className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 text-xs font-bold text-[#171B2B]"
                >
                  <span>Moda Infantil</span>
                  <ChevronRight size={15} className="text-gray-400" />
                </button>

                <button
                  onClick={() => handleCategoryClick('Vestido')}
                  className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 text-xs font-bold text-[#171B2B]"
                >
                  <span>Vestidos & Looks</span>
                  <ChevronRight size={15} className="text-gray-400" />
                </button>

                <button
                  onClick={() => handleCategoryClick('Conjunto')}
                  className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 text-xs font-bold text-[#171B2B]"
                >
                  <span>Conjuntos Primavera/Verão</span>
                  <ChevronRight size={15} className="text-gray-400" />
                </button>

                <button
                  onClick={() => handleCategoryClick('Combo')}
                  className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-[#EBF7F0] text-xs font-bold text-[#2E6945]"
                >
                  <div className="flex items-center gap-2">
                    <Layers size={15} />
                    <span>Combo Especial: 3 por R$ 100</span>
                  </div>
                  <span className="bg-[#2E6945] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                    Oferta
                  </span>
                </button>

                <button
                  onClick={() => handleCategoryClick('Promoção')}
                  className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl bg-orange-50/70 text-xs font-bold text-[#FF6B57]"
                >
                  <div className="flex items-center gap-2">
                    <Flame size={15} className="fill-[#FF6B57]" />
                    <span>Ofertas Relâmpago ⚡</span>
                  </div>
                  <ChevronRight size={15} className="text-gray-400" />
                </button>

                <hr className="my-3 border-gray-100" />

                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2 block">
                  Minha Área
                </span>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openSubScreen('orders');
                  }}
                  className="w-full flex items-center gap-2.5 py-2.5 px-3 rounded-xl hover:bg-gray-50 text-xs font-bold text-gray-700"
                >
                  <PackageCheck size={16} className="text-[#FF6B57]" />
                  <span>Meus Pedidos</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openSubScreen('addresses');
                  }}
                  className="w-full flex items-center gap-2.5 py-2.5 px-3 rounded-xl hover:bg-gray-50 text-xs font-bold text-gray-700"
                >
                  <MapPin size={16} className="text-[#3D6751]" />
                  <span>Endereços de Entrega</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setCurrentTab('favoritos');
                  }}
                  className="w-full flex items-center gap-2.5 py-2.5 px-3 rounded-xl hover:bg-gray-50 text-xs font-bold text-gray-700"
                >
                  <Heart size={16} className="text-red-500" />
                  <span>Meus Favoritos</span>
                </button>
              </div>
            </div>

            {/* Drawer Bottom Info */}
            <div className="p-4 border-t border-gray-100 bg-[#FAF9F6] text-[11px] text-gray-500 flex flex-col gap-1">
              <span className="font-bold text-[#171B2B]">SAGAS Brasil E-Commerce</span>
              <span>Moda Feminina & Infantil com preço justo</span>
              <span>SAC WhatsApp: (67) 9118-8356</span>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
