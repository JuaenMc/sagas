import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { PRODUCTS } from '../data/products';
import { 
  Heart, ShoppingBag, ArrowLeft, Trash2, Star, 
  Flame, Check, Plus, Tag, ArrowRight 
} from 'lucide-react';
import { Product } from '../types';

export const FavoritesScreen: React.FC = () => {
  const { 
    favorites, 
    toggleFavorite, 
    openProductDetail, 
    addToCart, 
    setCurrentTab, 
    cart, 
    showToast,
    products
  } = useCart();
  const allProducts = products && products.length > 0 ? products : PRODUCTS;

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'todos' | 'feminino' | 'infantil'>('todos');
  const [addedIds, setAddedIds] = useState<string[]>([]);

  // Favorited products
  const favoritedProducts = allProducts.filter(p => favorites.includes(p.id));

  const filteredProducts = favoritedProducts.filter(p => {
    if (activeCategoryFilter === 'feminino') return p.category === 'feminino';
    if (activeCategoryFilter === 'infantil') return p.category === 'infantil';
    return true;
  });

  const handleAddAllToCart = () => {
    favoritedProducts.forEach(product => {
      addToCart(product, product.colors[0]?.name || 'Padrão', product.sizes[0] || 'M');
    });
    showToast('Todos os favoritos foram adicionados ao carrinho!');
    setCurrentTab('carrinho');
  };

  const handleAddSingleToCombo = (product: Product) => {
    addToCart(product, product.colors[0]?.name || 'Padrão', product.sizes[0] || 'M');
    setAddedIds(prev => [...prev, product.id]);
    setTimeout(() => {
      setAddedIds(prev => prev.filter(id => id !== product.id));
    }, 1500);
  };

  const comboCountInCart = cart.reduce((acc, item) => item.isComboEligible ? acc + item.quantity : acc, 0);

  return (
    <div className="flex flex-col w-full pb-32 text-[#171B2B] bg-[#FAF9F6] min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#FAF9F6]/90 backdrop-blur-xl border-b border-[#F0ECE6]/80 px-4 h-16 flex items-center justify-between shadow-2xs">
        <button
          onClick={() => setCurrentTab('home')}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#171B2B]"
          aria-label="Voltar"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <h1 className="font-extrabold text-base text-[#171B2B]">Meus Favoritos</h1>
          <span className="text-[11px] text-gray-500 font-medium">
            ({favoritedProducts.length} itens salvos)
          </span>
        </div>

        <button
          onClick={() => {
            favorites.forEach(id => toggleFavorite(id));
            showToast('Lista de favoritos limpa');
          }}
          className="text-xs font-bold text-[#3D6751] hover:underline"
        >
          Limpar
        </button>
      </header>

      <div className="px-4 py-3 flex flex-col w-full max-w-md mx-auto space-y-3">
        {/* Combo Progress & Incentive Banner matching HTML */}
        <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#EBF7F0] to-white rounded-2xl p-4 shadow-xs border border-[#A8D5BA]/50">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-full bg-[#FF6B57] text-white flex items-center justify-center shadow-xs">
                <Flame size={14} className="fill-white" />
              </span>
              <h3 className="text-xs font-extrabold text-[#171B2B] tracking-tight">
                Economize mais no seu Combo!
              </h3>
            </div>
            <span className="bg-[#3D6751] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Tag 3x100
            </span>
          </div>

          <p className="text-xs text-gray-600 mb-3 leading-relaxed">
            Você tem <strong className="text-[#171B2B]">{comboCountInCart} peças</strong> no carrinho. Adicione mais <strong className="text-[#FF6B57]">1 dos seus favoritos</strong> para fechar 3 peças por apenas <strong className="text-[#3D6751]">R$ 100!</strong>
          </p>

          {/* Mini Stepper / Slots */}
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-1.5 bg-white/95 px-2.5 py-1.5 rounded-xl shadow-2xs border border-gray-100">
              <span className="w-4 h-4 rounded-full bg-[#3D6751] text-white flex items-center justify-center text-[10px]">✓</span>
              <span className="text-[10px] font-bold text-gray-700 truncate">Peça 1 no carrinho</span>
            </div>
            <div className="flex-1 flex items-center gap-1.5 bg-white/95 px-2.5 py-1.5 rounded-xl shadow-2xs border border-gray-100">
              <span className="w-4 h-4 rounded-full bg-[#3D6751] text-white flex items-center justify-center text-[10px]">✓</span>
              <span className="text-[10px] font-bold text-gray-700 truncate">Peça 2 no carrinho</span>
            </div>
            <div className="flex-1 flex items-center gap-1.5 bg-[#FFF3E0] px-2.5 py-1.5 rounded-xl shadow-2xs border border-[#FFE0B2] animate-pulse">
              <span className="w-4 h-4 rounded-full bg-[#D6894A] text-white flex items-center justify-center text-[10px] font-bold">+</span>
              <span className="text-[10px] font-extrabold text-[#8E4E14] truncate">Falta 1!</span>
            </div>
          </div>
        </section>

        {/* Filter Chips */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveCategoryFilter('todos')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeCategoryFilter === 'todos'
                  ? 'bg-[#171B2B] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Todos ({favoritedProducts.length})
            </button>
            <button
              onClick={() => setActiveCategoryFilter('feminino')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeCategoryFilter === 'feminino'
                  ? 'bg-[#171B2B] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Feminino
            </button>
            <button
              onClick={() => setActiveCategoryFilter('infantil')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeCategoryFilter === 'infantil'
                  ? 'bg-[#171B2B] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Infantil
            </button>
          </div>

          {favoritedProducts.length > 0 && (
            <button
              type="button"
              onClick={handleAddAllToCart}
              className="text-[#FF6B57] text-[11px] font-extrabold flex items-center gap-1 hover:underline shrink-0"
            >
              <ShoppingBag size={14} />
              <span>Mover todos</span>
            </button>
          )}
        </div>

        {/* Products List matching HTML */}
        {filteredProducts.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-red-50 text-[#FF6B57] flex items-center justify-center">
              <Heart size={30} />
            </div>
            <h3 className="font-bold text-sm text-[#171B2B]">Nenhum produto nesta categoria</h3>
            <p className="text-xs text-gray-500">Salve suas peças favoritas navegando pela vitrine.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map(product => {
              const isAdded = addedIds.includes(product.id);
              return (
                <article
                  key={product.id}
                  className="bg-white rounded-2xl p-3 shadow-xs border border-[#F0ECE6] flex gap-3 transition-all hover:shadow-md"
                >
                  <div
                    onClick={() => openProductDetail(product)}
                    className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100 cursor-pointer"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1.5 left-1.5 bg-[#FF6B57] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shadow-2xs">
                      3x100
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4
                          onClick={() => openProductDetail(product)}
                          className="text-xs font-extrabold text-[#171B2B] truncate cursor-pointer hover:text-[#FF6B57]"
                        >
                          {product.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => toggleFavorite(product.id)}
                          className="text-gray-400 hover:text-red-500 p-0.5"
                          title="Remover"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                        Tam: {product.sizes[0] || 'M'} • Cor: {product.colors[0]?.name || 'Padrão'}
                      </p>

                      <div className="flex items-center gap-1 mt-0.5 text-[11px] text-gray-500">
                        <Star size={12} className="text-amber-500 fill-amber-500" />
                        <span className="font-bold text-[#171B2B]">{product.rating}</span>
                        <span>({product.reviewsCount})</span>
                      </div>
                    </div>

                    <div className="flex items-end justify-between gap-1 pt-1 border-t border-gray-50 mt-1">
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-black text-[#2E6945]">R$ 33,33</span>
                          <span className="text-[9px] text-[#2E6945] font-bold">no combo</span>
                        </div>
                        <p className="text-[10px] text-gray-400 line-through">
                          R$ {product.originalPrice?.toFixed(2).replace('.', ',') || '59,90'} ind.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddSingleToCombo(product)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold shadow-2xs active:scale-95 transition-all ${
                          isAdded
                            ? 'bg-[#2E6945] text-white'
                            : 'bg-[#FF6B57] hover:bg-[#E05340] text-white'
                        }`}
                      >
                        {isAdded ? <Check size={14} /> : <Plus size={14} />}
                        <span>{isAdded ? 'No Combo!' : 'Ao Combo'}</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky Bottom Floating Combo Bar */}
      <aside className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md p-3 px-4 border-t border-gray-200 shadow-xl max-w-md mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#EBF7F0] text-[#2E6945] flex items-center justify-center shrink-0">
            <Tag size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-gray-500 truncate leading-none">Falta apenas 1 peça!</p>
            <p className="text-xs font-bold text-[#171B2B] truncate mt-0.5">Combo de R$ 100</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCurrentTab('carrinho')}
          className="bg-[#FF6B57] hover:bg-[#E05340] text-white px-4 py-2 rounded-full font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5"
        >
          <span>Ver Carrinho</span>
          <span className="bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
            {cart.length}
          </span>
        </button>
      </aside>
    </div>
  );
};
