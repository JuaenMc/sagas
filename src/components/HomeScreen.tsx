import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { PRODUCTS } from '../data/products';
import { Search, Mic, Heart, Star, ChevronRight, Zap, ShoppingBag, ArrowRight, Layers, Flame, Sparkles, X, AlertCircle, RefreshCw } from 'lucide-react';
import { Product } from '../types';

export const HomeScreen: React.FC = () => {
  const { 
    openProductDetail, 
    toggleFavorite, 
    isFavorite, 
    setCurrentTab, 
    addToCart, 
    cart, 
    currentUser,
    products,
    isLoadingProducts,
    productsError,
    fetchProductsFromERP,
    isSyncedWithErp,
    openSubScreen,
    searchQuery,
    setSearchQuery
  } = useCart();
  const [activeCategoryChip, setActiveCategoryChip] = useState<'novidades' | 'feminino' | 'infantil' | 'promocoes' | 'combos' | 'acessorios'>('feminino');

  // Catálogo sincronizado com o ERP
  const allProducts = products && products.length > 0 ? products : PRODUCTS;

  // Live Countdown timer matching Image 8: 04 : 28 : 12
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 12 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 28, seconds: 12 }; // reset loop
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Real-time search filter based on name or category using component state
  const searchFilteredProducts = searchQuery.trim()
    ? allProducts.filter((p) => {
        const q = searchQuery.toLowerCase().trim();
        const pName = (p.title || p.name).toLowerCase();
        const matchesName = pName.includes(q);
        const matchesCategory = p.category.toLowerCase().includes(q);
        const matchesSubCategory = p.subCategory ? p.subCategory.toLowerCase().includes(q) : false;
        return matchesName || matchesCategory || matchesSubCategory;
      })
    : [];

  const flashSaleItems = allProducts.filter(p => p.isFlashSale || p.badge?.includes('OFF') || p.badge?.includes('Combo') || (p.variations && p.variations.length > 2));
  const bestSellers = allProducts.slice(0, 8);

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="flex flex-col w-full pb-12 text-[#171b2b]">

      {searchQuery.trim().length > 0 ? (
        /* Real-Time Live Search Results Grid */
        <section className="px-4 py-4 flex flex-col gap-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-1 border-b border-gray-100">
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold block">
                Filtro em tempo real
              </span>
              <h2 className="text-base font-black text-[#171b2b]">
                Resultados para "{searchQuery}"
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-[#bfedd1] text-[#254f3a] text-xs font-bold">
                {searchFilteredProducts.length} {searchFilteredProducts.length === 1 ? 'item' : 'itens'}
              </span>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#ff6b57] font-bold hover:underline"
              >
                Limpar
              </button>
            </div>
          </div>

          {searchFilteredProducts.length === 0 ? (
            <div className="p-8 bg-white rounded-3xl border border-gray-200 text-center flex flex-col items-center gap-3 mt-2">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <Search size={24} />
              </div>
              <h3 className="font-bold text-sm text-[#171b2b]">Nenhum produto encontrado</h3>
              <p className="text-xs text-gray-500 max-w-xs">
                Não encontramos peças correspondentes a "{searchQuery}". Tente buscar por categorias ou modelos populares:
              </p>
              <div className="flex flex-wrap gap-1.5 justify-center pt-2">
                {['Vestido', 'Tricot', 'Infantil', 'Feminino', 'Conjunto', 'Combo', 'Floral'].map((sug) => (
                  <button
                    key={sug}
                    onClick={() => setSearchQuery(sug)}
                    className="px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:border-[#ff6b57] text-xs font-semibold text-gray-700 hover:text-[#ff6b57] transition shadow-2xs"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5 mt-2 w-full">
              {searchFilteredProducts.map((product) => {
                const favorited = isFavorite(product.id);
                const displayImg = product.coverImageUrl || (product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=900&q=80');
                const displayName = product.title || product.name;
                const isOutOfStock = (product.stock ?? 1) <= 0;

                return (
                  <article
                    key={product.id}
                    onClick={() => openProductDetail(product)}
                    className="cursor-pointer flex flex-col bg-white rounded-2xl overflow-hidden shadow-xs border border-[#EAE6DF] hover:shadow-md transition-all relative group"
                  >
                    <div className="relative w-full aspect-[3/4] bg-gray-100 overflow-hidden">
                      <img
                        src={displayImg}
                        alt={displayName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                        {isOutOfStock ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold shadow-xs">
                            Esgotado
                          </span>
                        ) : product.badge ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#ff6b57] text-white text-[10px] font-bold shadow-xs">
                            {product.badge}
                          </span>
                        ) : null}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(product.id);
                        }}
                        className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs active:scale-90 transition-transform ${
                          favorited ? 'text-[#ff6b57]' : 'text-gray-600 hover:text-black'
                        }`}
                        aria-label="Favoritar Produto"
                      >
                        <Heart size={16} className={favorited ? 'fill-[#ff6b57]' : ''} />
                      </button>
                    </div>

                    <div className="p-3 flex flex-col flex-1 justify-between gap-1.5">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                          {product.category === 'infantil' ? 'Moda Infantil' : 'Moda Feminina'}
                        </span>
                        <h3 className="text-xs font-semibold text-[#171b2b] line-clamp-2 leading-snug">
                          {displayName}
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
                        <span className="text-base font-black text-[#171b2b] leading-none mt-0.5">
                          R$ {product.price.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-[10px] text-gray-500 mt-1">
                          3x de <strong className="text-[#171b2b]">R$ {(product.price / 3).toFixed(2).replace('.', ',')}</strong> s/ juros
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isOutOfStock) return;
                            addToCart(product, product.colors[0]?.name || 'Padrão', product.sizes[0] || 'M');
                          }}
                          disabled={isOutOfStock}
                          className={`mt-2 w-full py-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition shadow-xs ${
                            isOutOfStock
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-[#ff6b57] hover:bg-[#e05340] text-white active:scale-95'
                          }`}
                        >
                          <ShoppingBag size={13} />
                          <span>{isOutOfStock ? 'Esgotado' : 'Adicionar à Sacola'}</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        <>
          {/* 2. Chips de Categorias com Rolagem Horizontal Suave */}
          <section className="w-full pt-3 pb-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 px-0 w-max">
              {/* Chip Novidades */}
              <button
                onClick={() => setActiveCategoryChip('novidades')}
                className={`flex items-center gap-1.5 py-2 px-3.5 rounded-full text-xs font-semibold shadow-xs active:scale-95 transition-all ${
                  activeCategoryChip === 'novidades' ? 'bg-[#171b2b] text-white' : 'bg-white text-[#171b2b] border border-[#EAE6DF]'
                }`}
              >
                <span>Novidades</span>
                <span className="bg-[#ff6b57] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  Novo
                </span>
              </button>

          {/* Chip Feminino */}
          <button
            onClick={() => setActiveCategoryChip('feminino')}
            className={`flex items-center gap-1.5 py-2 px-4 rounded-full text-xs font-semibold shadow-xs active:scale-95 transition-all ${
              activeCategoryChip === 'feminino' ? 'bg-[#171b2b] text-white' : 'bg-white text-[#171b2b] border border-[#EAE6DF]'
            }`}
          >
            <span>Feminino</span>
          </button>

          {/* Chip Infantil */}
          <button
            onClick={() => {
              setActiveCategoryChip('infantil');
              setCurrentTab('categorias');
            }}
            className={`flex items-center gap-1.5 py-2 px-4 rounded-full text-xs font-semibold shadow-xs active:scale-95 transition-all ${
              activeCategoryChip === 'infantil' ? 'bg-[#171b2b] text-white' : 'bg-white text-[#171b2b] border border-[#EAE6DF]'
            }`}
          >
            <span>Infantil</span>
          </button>

          {/* Chip Promoções */}
          <button
            onClick={() => setActiveCategoryChip('promocoes')}
            className="flex items-center gap-1.5 py-2 px-4 rounded-full bg-[#bfedd1] text-[#254f3a] text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            <Flame size={15} className="text-[#ff6b57] fill-[#ff6b57]" />
            <span>Promoções</span>
          </button>

          {/* Chip Combos */}
          <button
            onClick={() => {
              setActiveCategoryChip('combos');
              setCurrentTab('categorias');
            }}
            className="flex items-center gap-1.5 py-2 px-4 rounded-full bg-white text-[#171b2b] border border-[#EAE6DF] text-xs font-semibold shadow-xs active:scale-95 transition-all"
          >
            <Layers size={14} className="text-gray-500" />
            <span>Combos</span>
          </button>

          {/* Chip Acessórios */}
          <button
            onClick={() => setActiveCategoryChip('acessorios')}
            className="flex items-center gap-1.5 py-2 px-4 rounded-full bg-white text-[#171b2b] border border-[#EAE6DF] text-xs font-semibold shadow-xs active:scale-95 transition-all"
          >
            <span>Acessórios</span>
          </button>
        </div>
      </section>

      {/* 3. Hero Banner Carrossel (Inspiração Lifestyle Boutique) */}
      <section className="pt-2 pb-1 w-full">
        <div
          onClick={() => setCurrentTab('categorias')}
          className="cursor-pointer relative w-full rounded-[24px] overflow-hidden shadow-md aspect-[16/10] sm:aspect-[21/9] lg:aspect-[24/9] min-h-[280px] sm:min-h-[380px] lg:min-h-[440px] bg-[#171b2b] flex flex-col justify-end p-5 sm:p-8 lg:p-12 group"
        >
          {/* Background image from HTML snippet */}
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8WV3VzZPD-dO1lXgmr4tqMtT36SbjxH_b0NcEyJRbpETMrvEmxzjkO9lA5wbZ5n0Tu70y63fxW32IQHkiQKwqHOzCNM8EeLd2UewgIsxN4pCW3OO8o5yn24dA5w2dB9MzmCsEsGtOdEFgs3el6Lffbinol2W5XKPxfxl45iXbzSYuh5h4FSG2vXjRBlAOy4e0cQ6HPTgPrjWgOZIsBDRhrENqjLyYqrGsdsptKzfweDlUydbHmiONMQ"
            alt="Mãe e filha sorrindo na coleção de verão"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />

          {/* Gradient Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"></div>

          {/* Banner Content */}
          <div className="relative z-10 flex flex-col items-start gap-1.5 text-white">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#ff6b57] text-white text-[11px] font-bold shadow-xs tracking-wide">
              Combo: 3 Peças por R$ 100
            </span>
            <h2 className="text-xl sm:text-2xl font-black leading-tight drop-shadow-xs">
              Coleção Primavera / Verão 2025
            </h2>
            <p className="text-xs text-gray-200 font-medium line-clamp-1 mb-1">
              Leveza, frescor e looks combinando para a família.
            </p>

            <div className="flex items-center justify-between w-full pt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentTab('categorias');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ff6b57] text-white text-xs font-bold shadow-md active:scale-95 transition-transform"
              >
                <span>Comprar Agora</span>
                <ArrowRight size={14} />
              </button>

              {/* Dots */}
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/40 backdrop-blur-xs">
                <span className="w-4 h-1.5 rounded-full bg-[#ff6b57]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/60"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/60"></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Seção Ofertas Relâmpago (Flash Sale) */}
      <section className="mt-4 py-3 bg-white shadow-xs rounded-2xl border border-[#EAE6DF]/70 flex flex-col gap-3 w-full">
        {/* Header with Title, Timer and Link */}
        <div className="px-3 sm:px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-base sm:text-lg font-black text-[#171b2b]">Ofertas Relâmpago</span>
              <span className="text-amber-500 animate-bounce">⚡</span>
            </div>

            {/* Countdown timer */}
            <div className="flex items-center gap-0.5 font-mono font-bold text-white text-[11px] ml-1">
              <span className="bg-[#171b2b] px-1.5 py-0.5 rounded">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[#171b2b] font-black">:</span>
              <span className="bg-[#171b2b] px-1.5 py-0.5 rounded">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[#171b2b] font-black">:</span>
              <span className="bg-[#ff6b57] px-1.5 py-0.5 rounded">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>

          <button
            onClick={() => setCurrentTab('categorias')}
            className="text-xs font-bold text-[#ff6b57] flex items-center gap-0.5 hover:underline"
          >
            <span>Ver todas</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Banner de Erro/Offline se houver */}
        {productsError && (
          <div className="mx-4 my-2 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-800">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-600 shrink-0" />
              <span>{productsError}</span>
            </div>
            <button
              onClick={() => fetchProductsFromERP()}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition"
            >
              <RefreshCw size={11} />
              <span>Reconectar</span>
            </button>
          </div>
        )}

        {/* Scroll Horizontal de Produtos Relâmpago */}
        <div className="w-full overflow-x-auto no-scrollbar">
          <div className="flex items-stretch gap-3 px-3 sm:px-4 w-max pb-1">
            {isLoadingProducts ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="w-36 sm:w-44 flex flex-col bg-white rounded-2xl overflow-hidden shadow-xs border border-[#EAE6DF] animate-pulse">
                  <div className="w-full aspect-[3/4] bg-stone-200"></div>
                  <div className="p-2.5 flex flex-col gap-2">
                    <div className="h-3 w-20 bg-stone-200 rounded"></div>
                    <div className="h-4 w-16 bg-stone-200 rounded"></div>
                  </div>
                </div>
              ))
            ) : (
              flashSaleItems.map(item => {
                const itemImg = item.coverImageUrl || (item.images && item.images.length > 0 ? item.images[0] : 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=900&q=80');
                const itemName = item.title || item.name;
                const isOutOfStock = (item.stock ?? 1) <= 0;

                return (
                  <article
                    key={item.id}
                    onClick={() => openProductDetail(item)}
                    className="w-36 sm:w-44 flex flex-col bg-[#FAF9F6] rounded-2xl overflow-hidden shadow-xs cursor-pointer border border-[#EAE6DF] hover:shadow-md transition-all active:scale-98"
                  >
                    <div className="relative w-full aspect-[3/4] bg-gray-100 overflow-hidden">
                      <img
                        src={itemImg}
                        alt={itemName}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                        {isOutOfStock ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-extrabold shadow-xs">
                            Esgotado
                          </span>
                        ) : item.badge ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#ff6b57] text-white text-[10px] font-extrabold shadow-xs">
                            {item.badge}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="p-2.5 flex flex-col flex-1 justify-between gap-1">
                      <h3 className="text-xs text-[#171b2b] line-clamp-1 font-semibold">
                        {itemName}
                      </h3>
                      <div className="flex flex-col">
                        {item.originalPrice && (
                          <span className="text-[10px] text-gray-400 line-through">
                            R$ {item.originalPrice.toFixed(2).replace('.', ',')}
                          </span>
                        )}
                        <span className="text-sm font-black text-[#ff6b57]">
                          R$ {item.price.toFixed(2).replace('.', ',')}
                        </span>
                      </div>

                      {/* Stock progress bar */}
                      <div className="w-full mt-1">
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#ff6b57] rounded-full transition-all"
                            style={{ width: `${item.soldPercentage || 75}%` }}
                          ></div>
                        </div>
                        <span className="text-[9px] font-bold text-gray-500 mt-0.5 block">
                          {isOutOfStock ? '0 restantes' : `${item.soldPercentage || 75}% vendido`}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })
            )}

            {/* Extra Explore Card */}
            <article
              onClick={() => setCurrentTab('categorias')}
              className="w-28 flex flex-col items-center justify-center bg-gray-100 rounded-2xl p-3 text-center gap-2 cursor-pointer border border-dashed border-gray-300 hover:bg-gray-200 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[#ff6b57]/15 flex items-center justify-center text-[#ff6b57]">
                <Flame size={20} />
              </div>
              <span className="text-xs font-bold text-[#171b2b] leading-tight">+25 Ofertas</span>
              <span className="text-[10px] font-extrabold text-[#ff6b57]">Descobrir</span>
            </article>
          </div>
        </div>
      </section>

      {/* 5. Tiles Promocionais em 2 Colunas */}
      <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full">
        {/* Tile Feminino */}
        <div
          onClick={() => setCurrentTab('categorias')}
          className="cursor-pointer relative rounded-2xl overflow-hidden aspect-[4/5] sm:aspect-[16/9] bg-gray-200 shadow-xs p-5 flex flex-col justify-end group"
        >
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSaSSkKP6zkEITiQBSyAYHQj7a5wlMvMRvJtwTO-VqSyohXw6yY0TuyTaKL0mptIJ6IwZDBC2gY4Wl51ZT9p2Mu3128OE-Oi8UlIttfe2Df6JLnm8Kxjeek1BM_TWy0iQXAQSShdn3qN5Vx9I2EjCwi2oQhcrWe2foz0dClwWAtQs9Olo7nV0tnaFFOWhLUqrvy4l1M6EsOReyTs9s__lLMulX6Ps2majwsZ8THY8ICkx0YDrbox6JOg"
            alt="Moda Feminina"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"></div>
          <div className="relative z-10 flex flex-col items-start gap-1">
            <span className="text-base sm:text-lg font-black text-white">Moda Feminina</span>
            <span className="text-xs font-bold text-[#bfedd1]">A partir de R$ 39,90</span>
            <button className="mt-2 px-4 py-1.5 rounded-full bg-white text-[#171b2b] text-xs font-bold shadow-xs active:scale-95 transition-transform">
              Ver Looks
            </button>
          </div>
        </div>

        {/* Tile Infantil */}
        <div
          onClick={() => setCurrentTab('categorias')}
          className="cursor-pointer relative rounded-2xl overflow-hidden aspect-[4/5] sm:aspect-[16/9] bg-gray-200 shadow-xs p-5 flex flex-col justify-end group"
        >
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAID3BRu9aO47gyQXLtbe0X3b-lfJHhicUGhAvDKHSs4bAmUZK8gOwZCFR7aonbfbo4H66Hxc9nWxzA2YFSeolsZ2sB8J0vf3tRXWpfmrVPCxBDcPsSoLE40bPsR7LmwHDHYnOL1KX22YtQdVh3xXUGm94llTsZyxXQEtltXomQ00ag4DoGJcW5DLLD-jd7YwolOTQbDgnSYvUGU0ZGcEl93e1WRpNzZkgUhdfKWZl4UolwLwveUkQZUQ"
            alt="Moda Infantil"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"></div>
          <div className="relative z-10 flex flex-col items-start gap-1">
            <span className="text-base sm:text-lg font-black text-white">Moda Infantil</span>
            <span className="text-xs font-bold text-[#bfedd1]">Tamanhos 1 ao 14</span>
            <button className="mt-2 px-4 py-1.5 rounded-full bg-white text-[#171b2b] text-xs font-bold shadow-xs active:scale-95 transition-transform">
              Explorar
            </button>
          </div>
        </div>
      </section>

      {/* 6. Grade de Produtos "Mais Vendidos" (Responsivo: 2 a 6 colunas) */}
      <section className="mt-8 flex flex-col gap-4 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h2 className="text-lg sm:text-xl font-black text-[#171b2b]">Mais Vendidos</h2>
            <Sparkles size={18} className="text-[#ff6b57]" />
          </div>
          <span className="text-xs text-gray-500 font-medium">Produtos do ERP Sincronizados</span>
        </div>

        {/* Grid Responsivo com Skeleton Loading */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5 w-full">
          {isLoadingProducts ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-xs border border-[#EAE6DF] animate-pulse">
                <div className="w-full aspect-[3/4] bg-stone-200"></div>
                <div className="p-3 flex flex-col gap-2">
                  <div className="h-3 w-16 bg-stone-200 rounded"></div>
                  <div className="h-4 w-3/4 bg-stone-200 rounded"></div>
                  <div className="h-5 w-20 bg-stone-200 rounded mt-1"></div>
                  <div className="h-8 w-full bg-stone-200 rounded-xl mt-2"></div>
                </div>
              </div>
            ))
          ) : (
            bestSellers.map(product => {
              const favorited = isFavorite(product.id);
              const pImg = product.coverImageUrl || (product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=900&q=80');
              const pName = product.title || product.name;
              const isOutOfStock = (product.stock ?? 1) <= 0;

              return (
                <article
                  key={product.id}
                  onClick={() => openProductDetail(product)}
                  className="cursor-pointer flex flex-col bg-white rounded-2xl overflow-hidden shadow-xs border border-[#EAE6DF] hover:shadow-md transition-all relative group"
                >
                  {/* Photo & badges */}
                  <div className="relative w-full aspect-[3/4] bg-gray-100 overflow-hidden">
                    <img
                      src={pImg}
                      alt={pName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                      {isOutOfStock ? (
                        <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold shadow-xs">
                          Esgotado
                        </span>
                      ) : product.badge ? (
                        <span className="px-2 py-0.5 rounded-full bg-[#ff6b57] text-white text-[10px] font-bold shadow-xs">
                          {product.badge}
                        </span>
                      ) : null}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product.id);
                      }}
                      className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs active:scale-90 transition-transform ${
                        favorited ? 'text-[#ff6b57]' : 'text-gray-600 hover:text-black'
                      }`}
                      aria-label="Favoritar Produto"
                    >
                      <Heart size={16} className={favorited ? 'fill-[#ff6b57]' : ''} />
                    </button>
                  </div>

                  {/* Details */}
                  <div className="p-3 flex flex-col flex-1 justify-between gap-1.5">
                    <div>
                      <h3 className="text-xs font-semibold text-[#171b2b] line-clamp-2 leading-snug">
                        {pName}
                      </h3>
                      <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-500">
                        <Star size={13} className="text-amber-500 fill-amber-500" />
                        <span className="font-bold text-[#171b2b]">{product.rating}</span>
                        <span>({product.reviewsCount})</span>
                      </div>
                    </div>

                    {/* Price & Installments */}
                    <div className="flex flex-col pt-1">
                      {product.originalPrice && (
                        <span className="text-[11px] text-gray-400 line-through">
                          R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                      <span className="text-base font-black text-[#171b2b] leading-none mt-0.5">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-[10px] text-gray-500 mt-1">
                        3x de <strong className="text-[#171b2b]">R$ {(product.price / 3).toFixed(2).replace('.', ',')}</strong> s/ juros
                      </span>

                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[9px] font-bold">
                            Sem estoque
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#bfedd1] text-[#254f3a] text-[9px] font-bold">
                            {product.secondaryBadge || 'Estoque no Brasil'}
                          </span>
                        )}
                        {product.variations && product.variations.length > 0 && (
                          <span className="text-[9px] text-stone-500 font-medium">
                            {product.variations.length} {product.variations.length === 1 ? 'variação' : 'variações'}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isOutOfStock) return;
                          addToCart(product, product.colors[0]?.name || 'Padrão', product.sizes[0] || 'M');
                        }}
                        disabled={isOutOfStock}
                        className={`mt-2.5 w-full py-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition shadow-xs ${
                          isOutOfStock
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-[#ff6b57] hover:bg-[#e05340] text-white active:scale-95'
                        }`}
                      >
                        <ShoppingBag size={13} />
                        <span>{isOutOfStock ? 'Esgotado' : 'Adicionar à Sacola'}</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Load more button */}
        <div className="w-full pt-2 flex justify-center">
          <button
            onClick={() => setCurrentTab('categorias')}
            className="w-full py-3 rounded-full bg-white hover:bg-gray-50 text-[#171b2b] font-bold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-transform shadow-xs border border-[#EAE6DF]"
          >
            <span>Carregar Mais Produtos</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </section>
        </>
      )}
    </div>
  );
};
