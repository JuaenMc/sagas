import React, { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { PRODUCTS } from '../data/products';
import { Product } from '../types';
import { 
  ArrowLeft, ShoppingBag, Search, X, SlidersHorizontal, Check, 
  Star, Heart, ArrowUpDown, ShieldCheck, RefreshCw 
} from 'lucide-react';

export const CategoriesScreen: React.FC = () => {
  const { openProductDetail, toggleFavorite, isFavorite, setCurrentTab, cart, products } = useCart();
  const allProducts = products && products.length > 0 ? products : PRODUCTS;
  
  const [searchTerm, setSearchTerm] = useState('Vestidos e conjuntos');
  const [filterFreeShipping, setFilterFreeShipping] = useState(true);
  const [filterMax50, setFilterMax50] = useState(true);
  const [filterAgeRange, setFilterAgeRange] = useState(true);
  const [sortBy, setSortBy] = useState<'mais_vendidos' | 'menor_preco' | 'maior_preco' | 'melhores_avaliados'>('mais_vendidos');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Active filter count
  const activeFiltersCount = (filterFreeShipping ? 1 : 0) + (filterMax50 ? 1 : 0) + (filterAgeRange ? 1 : 0);

  // Filtered and sorted products
  const displayedProducts = useMemo(() => {
    let list = [...allProducts];

    if (searchTerm.trim() && searchTerm !== 'Vestidos e conjuntos') {
      const q = searchTerm.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.category.includes(q) || p.subCategory?.toLowerCase().includes(q));
    }

    if (filterMax50) {
      list = list.filter(p => p.price <= 50.00);
    }

    if (filterFreeShipping) {
      // Products with free shipping or over R$ 40
      list = list.filter(p => p.secondaryBadge === 'Frete Grátis' || p.price >= 45.00);
    }

    if (sortBy === 'menor_preco') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'maior_preco') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'melhores_avaliados') {
      list.sort((a, b) => b.rating - a.rating);
    } else {
      // mais vendidos
      list.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    }

    return list;
  }, [allProducts, searchTerm, filterMax50, filterFreeShipping, sortBy]);

  return (
    <div className="flex flex-col w-full pb-28 text-[#171b2b] relative">
      {/* Top Header Bar matching Image 3 */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#EAE6DF] px-4 py-3 flex items-center justify-between shadow-xs">
        <button
          onClick={() => setCurrentTab('home')}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 text-[#171b2b] transition-colors"
          aria-label="Voltar para Home"
        >
          <ArrowLeft size={22} />
        </button>

        <div className="flex flex-col items-center text-center">
          <h1 className="font-extrabold text-base text-[#171b2b]">Moda Infantil</h1>
          <span className="text-[11px] text-gray-500 font-medium">Coleção Verão • 2 a 10 anos</span>
        </div>

        <button
          onClick={() => setCurrentTab('carrinho')}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 relative text-[#171b2b]"
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

      {/* Search Bar with clear button */}
      <div className="px-4 pt-3 pb-2 bg-white">
        <div className="relative flex items-center w-full">
          <Search size={18} className="absolute left-3.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Vestidos e conjuntos"
            className="w-full h-11 pl-10 pr-10 rounded-full bg-[#f3f2ff]/60 border border-[#dee1f8] text-sm text-[#171b2b] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#ff6b57]/20"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips Horizontal Strip matching Image 3 */}
      <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar bg-white border-b border-[#EAE6DF]">
        {/* Filtrar Button with badge */}
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-gray-300 text-xs font-bold text-gray-800 shadow-xs shrink-0 active:scale-95 transition-all"
        >
          <SlidersHorizontal size={14} className="text-gray-600" />
          <span>Filtrar</span>
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#ff6b57] text-white text-[10px] flex items-center justify-center font-black">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Frete Grátis chip */}
        <button
          onClick={() => setFilterFreeShipping(!filterFreeShipping)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
            filterFreeShipping
              ? 'bg-[#bfedd1] text-[#254f3a] shadow-xs'
              : 'bg-gray-100 text-gray-600 border border-gray-200'
          }`}
        >
          <Check size={14} />
          <span>Frete Grátis</span>
        </button>

        {/* Até R$ 50 chip */}
        {filterMax50 && (
          <button
            onClick={() => setFilterMax50(false)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-gray-300 text-xs font-semibold text-gray-800 shrink-0 shadow-xs hover:bg-gray-50"
          >
            <span>Até R$ 50</span>
            <X size={13} className="text-gray-500" />
          </button>
        )}

        {/* 3-7 anos chip */}
        {filterAgeRange && (
          <button
            onClick={() => setFilterAgeRange(false)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-gray-300 text-xs font-semibold text-gray-800 shrink-0 shadow-xs hover:bg-gray-50"
          >
            <span>3-7 anos</span>
            <X size={13} className="text-gray-500" />
          </button>
        )}
      </div>

      {/* Results Header: Count & Sorting */}
      <div className="px-4 py-3 flex items-center justify-between text-xs text-gray-600">
        <span className="font-semibold">
          <strong className="text-[#171b2b]">{displayedProducts.length > 0 ? '128' : '0'}</strong> produtos encontrados
        </span>

        <div className="flex items-center gap-1">
          <span className="text-gray-500">Ordenar:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent font-bold text-[#171b2b] border-none focus:outline-none cursor-pointer text-xs"
          >
            <option value="mais_vendidos">Mais Vendidos</option>
            <option value="menor_preco">Menor Preço</option>
            <option value="maior_preco">Maior Preço</option>
            <option value="melhores_avaliados">Melhor Avaliados</option>
          </select>
        </div>
      </div>

      {/* 2-Column Product Grid matching Image 3 */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {displayedProducts.map(product => {
          const favorited = isFavorite(product.id);
          return (
            <article
              key={product.id}
              onClick={() => openProductDetail(product)}
              className="cursor-pointer flex flex-col bg-white rounded-2xl overflow-hidden shadow-xs border border-[#EAE6DF] hover:shadow-md transition-all relative group"
            >
              {/* Photo Box */}
              <div className="relative w-full aspect-[3/4] bg-gray-100 overflow-hidden">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Badges on Top Left */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                  {product.secondaryBadge && (
                    <span className="px-2 py-0.5 rounded-full bg-[#ff6b57] text-white text-[10px] font-extrabold shadow-xs">
                      {product.secondaryBadge}
                    </span>
                  )}
                  {product.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-white/95 text-[#171b2b] text-[10px] font-bold shadow-xs">
                      {product.badge}
                    </span>
                  )}
                </div>

                {/* Floating Heart on Top Right */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(product.id);
                  }}
                  className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs active:scale-90 transition-transform ${
                    favorited ? 'text-[#ff6b57]' : 'text-gray-600 hover:text-black'
                  }`}
                  aria-label="Favoritar"
                >
                  <Heart size={16} className={favorited ? 'fill-[#ff6b57]' : ''} />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-3 flex flex-col flex-1 justify-between gap-1.5">
                <div>
                  {product.badge && (
                    <span className="inline-block px-2 py-0.5 rounded-md bg-[#ffdcc4]/60 text-[#8e4e14] text-[10px] font-bold mb-1">
                      {product.badge}
                    </span>
                  )}
                  <h3 className="text-xs font-semibold text-[#171b2b] line-clamp-1 leading-snug">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-500">
                    <Star size={13} className="text-amber-500 fill-amber-500" />
                    <span className="font-bold text-[#171b2b]">{product.rating}</span>
                    <span>({product.reviewsCount})</span>
                  </div>
                </div>

                <div className="flex flex-col pt-1">
                  {product.originalPrice && (
                    <span className="text-[11px] text-gray-400 line-through">
                      R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                  <span className="text-base font-black text-[#ae3123] leading-none mt-0.5">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Bottom Guarantee Banner matching Image 3 */}
      <div className="px-4 mt-6">
        <div className="p-3.5 bg-[#dee1f8]/40 border border-[#dee1f8] rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#3d6751] shrink-0 shadow-xs">
            <RefreshCw size={18} />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-[#171b2b]">Primeira troca grátis em até 30 dias</h4>
            <p className="text-[11px] text-gray-600 mt-0.5">Compre com segurança para os pequenos.</p>
          </div>
        </div>
      </div>

      {/* Floating Bottom Filter Pill matching Image 3 */}
      <button
        onClick={() => setIsFilterModalOpen(true)}
        className="fixed bottom-20 right-4 z-40 bg-[#ff6b57] hover:bg-[#ff5745] text-white px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 font-bold text-xs active:scale-95 transition-transform"
      >
        <SlidersHorizontal size={16} />
        <span>Filtros</span>
        {activeFiltersCount > 0 && (
          <span className="w-5 h-5 rounded-full bg-white text-[#ff6b57] text-[10px] font-black flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Filter Modal Drawer */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-[#171b2b]">Filtros de Busca</h3>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-800 block mb-1">Faixa de Preço</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilterMax50(!filterMax50)}
                    className={`px-3 py-1.5 rounded-full border font-bold ${
                      filterMax50 ? 'bg-[#ff6b57] text-white border-[#ff6b57]' : 'bg-gray-50 text-gray-700'
                    }`}
                  >
                    Até R$ 50,00
                  </button>
                  <button
                    onClick={() => setFilterMax50(false)}
                    className={`px-3 py-1.5 rounded-full border font-bold ${
                      !filterMax50 ? 'bg-[#ff6b57] text-white border-[#ff6b57]' : 'bg-gray-50 text-gray-700'
                    }`}
                  >
                    Qualquer valor
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">Benefícios</label>
                <button
                  onClick={() => setFilterFreeShipping(!filterFreeShipping)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-bold ${
                    filterFreeShipping ? 'bg-[#bfedd1] text-[#254f3a] border-emerald-400' : 'bg-gray-50 text-gray-700'
                  }`}
                >
                  <Check size={14} />
                  <span>Apenas Frete Grátis</span>
                </button>
              </div>

              <div>
                <label className="font-bold text-gray-800 block mb-1">Tamanhos Disponíveis</label>
                <div className="flex gap-2">
                  {['P', 'M', 'G', 'GG'].map(size => (
                    <span key={size} className="w-8 h-8 rounded-lg bg-gray-100 font-bold flex items-center justify-center text-gray-700 border">
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  setFilterFreeShipping(false);
                  setFilterMax50(false);
                  setFilterAgeRange(false);
                  setIsFilterModalOpen(false);
                }}
                className="flex-1 py-2.5 rounded-full border border-gray-300 text-xs font-bold text-gray-700"
              >
                Limpar Tudo
              </button>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="flex-1 py-2.5 rounded-full bg-[#ff6b57] text-white text-xs font-bold"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
