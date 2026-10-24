import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { PRODUCTS } from '../data/products';
import { 
  ArrowLeft, CheckCircle, Plus, Star, Heart, 
  ShoppingBag, ArrowRight, Check, Flame 
} from 'lucide-react';
import { Product } from '../types';

interface ComboSuggestionsScreenProps {
  onBack?: () => void;
}

export const ComboSuggestionsScreen: React.FC<ComboSuggestionsScreenProps> = ({ onBack }) => {
  const { cart, addToCart, setCurrentTab, closeSubScreen, openProductDetail, toggleFavorite, isFavorite } = useCart();
  const [activeFilter, setActiveFilter] = useState('Todos no Combo');
  const [addedItems, setAddedItems] = useState<string[]>([]);

  // Eligible combo items
  const comboProducts = PRODUCTS.filter(p => p.isComboEligible || p.price <= 60);

  const filterChips = [
    'Todos no Combo',
    'Vestidos',
    'Conjuntos Kids',
    'Blusas & Tops',
    'Até R$ 49,90',
    'Tamanho M'
  ];

  const handleQuickAdd = (product: Product) => {
    addToCart(product, product.colors[0]?.name || 'Padrão', product.sizes[0] || 'M');
    setAddedItems(prev => [...prev, product.id]);
    setTimeout(() => {
      setAddedItems(prev => prev.filter(id => id !== product.id));
    }, 1500);
  };

  const comboCountInCart = cart.reduce((acc, item) => item.isComboEligible ? acc + item.quantity : acc, 0);

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#FAF9F6] text-[#171B2B] pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FAF9F6]/90 backdrop-blur-xl border-b border-[#F0ECE6]/80 px-4 h-16 flex items-center justify-between">
        <button
          onClick={onBack || closeSubScreen}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#171B2B] transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="text-center">
          <h1 className="font-extrabold text-base text-[#171B2B]">Combo 3 por R$ 100</h1>
          <p className="text-[11px] text-gray-500 font-medium">Escolha suas peças favoritas</p>
        </div>

        <button
          onClick={() => {
            closeSubScreen();
            setCurrentTab('carrinho');
          }}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 relative"
          aria-label="Carrinho"
        >
          <ShoppingBag size={20} />
          {cart.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#FF6B57] text-white text-[10px] font-bold flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </button>
      </header>

      {/* Dynamic Combo Tracker Header Banner */}
      <section className="sticky top-16 z-30 px-4 pt-2 pb-3 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#F0ECE6]">
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#F0ECE6] flex flex-col gap-2">
          {/* Tracker Title & Savings Badge */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl">🎁</span>
              <span className="font-bold text-sm text-[#171B2B] truncate">
                {comboCountInCart >= 3 ? 'Combo Completo!' : `Falta apenas ${Math.max(1, 3 - (comboCountInCart % 3))} peça!`}
              </span>
            </div>
            <span className="bg-[#EBF7F0] text-[#2E6945] text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0">
              Economize R$ 49,70
            </span>
          </div>

          {/* Stepper / Progress Bar */}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-[#FF6B57] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((comboCountInCart % 3 || 2) / 3) * 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="flex items-center gap-0.5 text-[#2E6945] font-semibold">
                  <CheckCircle size={13} /> 1. Vestido Sol
                </span>
                <span className="flex items-center gap-0.5 text-[#2E6945] font-semibold">
                  <CheckCircle size={13} /> 2. Body Infantil
                </span>
                <span className="flex items-center gap-0.5 text-[#FF6B57] font-bold">
                  3. Sua Escolha ✨
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Filter Horizontal Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 no-scrollbar">
          {filterChips.map(chip => (
            <button
              key={chip}
              onClick={() => setActiveFilter(chip)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-2xs ${
                activeFilter === chip
                  ? 'bg-[#171B2B] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </section>

      {/* Section Narrative Header */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-[#171B2B]">Sugestões para fechar o trio</h2>
          <p className="text-xs text-gray-500">Qualquer peça desta lista sai a R$ 33,33 no combo</p>
        </div>
        <span className="text-xs font-bold text-[#FF6B57] cursor-pointer hover:underline">
          Filtrar ({comboProducts.length})
        </span>
      </div>

      {/* Product Discovery Grid (2 columns) */}
      <section className="px-4">
        <div className="grid grid-cols-2 gap-3">
          {comboProducts.map(product => {
            const isAdded = addedItems.includes(product.id);
            const favorited = isFavorite(product.id);
            return (
              <article
                key={product.id}
                className="bg-white rounded-2xl p-3 shadow-xs border border-[#F0ECE6] flex flex-col justify-between relative group hover:shadow-md transition-all"
              >
                <div
                  onClick={() => openProductDetail(product)}
                  className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 mb-2 cursor-pointer"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-2 left-2 bg-[#FF6B57] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                    Tag 3x100
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(product.id);
                    }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-gray-600 shadow-2xs active:scale-90 transition-transform"
                  >
                    <Heart size={14} className={favorited ? 'text-[#FF6B57] fill-[#FF6B57]' : ''} />
                  </button>
                </div>

                <div className="flex flex-col flex-1 justify-between">
                  <div onClick={() => openProductDetail(product)} className="cursor-pointer">
                    <div className="flex items-center gap-1 mb-1">
                      <Star size={12} className="text-amber-500 fill-amber-500" />
                      <span className="text-xs font-bold text-[#171B2B]">{product.rating}</span>
                      <span className="text-[10px] text-gray-400">({product.reviewsCount})</span>
                    </div>
                    <h3 className="text-xs font-bold text-[#171B2B] line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">
                      {product.subCategory || 'Tecido respirável leve'}
                    </p>
                  </div>

                  <div className="mt-2 pt-1 flex items-end justify-between border-t border-gray-50">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 line-through">
                        R$ {product.originalPrice?.toFixed(2).replace('.', ',') || '59,90'}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-black text-[#FF6B57]">R$ 33,33</span>
                        <span className="text-[10px] text-[#2E6945] font-bold">no combo</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleQuickAdd(product)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all ${
                        isAdded
                          ? 'bg-[#2E6945] text-white'
                          : 'bg-[#FF6B57] hover:bg-[#E05340] text-white'
                      }`}
                      aria-label="Adicionar ao Combo"
                    >
                      {isAdded ? <Check size={16} /> : <Plus size={18} />}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Sticky Bottom Floating Combo Bar */}
      <aside className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md p-3 px-4 border-t border-gray-200 shadow-xl max-w-md mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex -space-x-2.5 items-center">
            {cart.slice(0, 2).map((item, idx) => (
              <img
                key={idx}
                src={item.image}
                alt={item.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-xs"
              />
            ))}
            <div className="w-10 h-10 rounded-full bg-[#FFEBE8] ring-2 ring-white flex items-center justify-center text-[#FF6B57] shadow-xs">
              <Plus size={18} className="animate-bounce" />
            </div>
          </div>
          <div className="flex flex-col min-w-0 pl-1">
            <span className="text-xs font-bold text-[#171B2B] truncate">
              {cart.length} de 3 peças
            </span>
            <span className="text-[11px] font-bold text-[#FF6B57]">
              Falta R$ 33,33
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            closeSubScreen();
            setCurrentTab('carrinho');
          }}
          className="h-11 px-4 bg-[#FF6B57] hover:bg-[#E05340] text-white rounded-full font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0"
        >
          <span>Ver Carrinho</span>
          <ArrowRight size={14} />
        </button>
      </aside>
    </div>
  );
};
