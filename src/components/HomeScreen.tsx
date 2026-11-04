import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import {
  Search,
  Heart,
  Star,
  ChevronRight,
  ShoppingBag,
  ArrowRight,
  Layers,
  Flame,
  Sparkles,
  AlertCircle,
  RefreshCw,
  PackageOpen,
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const {
    openProductDetail,
    toggleFavorite,
    isFavorite,
    setCurrentTab,
    addToCart,
    products,
    isLoadingProducts,
    productsError,
    fetchProductsFromERP,
    searchQuery,
    setSearchQuery,
  } = useCart();

  const [activeCategoryChip, setActiveCategoryChip] = useState<
    'novidades' | 'feminino' | 'infantil' | 'promocoes' | 'combos' | 'acessorios'
  >('feminino');

  // Garantir sincronização com a API do ERP ao montar a tela
  useEffect(() => {
    fetchProductsFromERP();
  }, []);

  const allProducts = products || [];

  // Filtro de busca em tempo real exclusivamente sobre os produtos reais da API
  const searchFilteredProducts = searchQuery.trim()
    ? allProducts.filter((p) => {
        const q = searchQuery.toLowerCase().trim();
        const pName = (p.title || p.name || '').toLowerCase();
        const matchesName = pName.includes(q);
        const matchesCategory = (p.category || '').toLowerCase().includes(q);
        const matchesSubCategory = p.subCategory
          ? p.subCategory.toLowerCase().includes(q)
          : false;
        return matchesName || matchesCategory || matchesSubCategory;
      })
    : [];

  const flashSaleItems = allProducts.filter(
    (p) =>
      p.isFlashSale ||
      p.badge?.includes('OFF') ||
      p.badge?.includes('Combo') ||
      (p.variations && p.variations.length > 1)
  );
  const bestSellers = allProducts;

  return (
    <div className="flex flex-col w-full pb-12 text-[#171b2b]">
      {/* Banner de Erro de Conexão com a API */}
      {productsError && (
        <div className="my-3 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-xs text-red-800">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="text-red-600 shrink-0" />
            <div>
              <span className="font-bold block">Erro ao carregar produtos do servidor</span>
              <span className="text-[11px] text-red-600">{productsError}</span>
            </div>
          </div>
          <button
            onClick={() => fetchProductsFromERP()}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition shrink-0"
          >
            <RefreshCw size={12} />
            <span>Tentar Novamente</span>
          </button>
        </div>
      )}

      {searchQuery.trim().length > 0 ? (
        /* Resultados de Busca em Tempo Real */
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
                {searchFilteredProducts.length}{' '}
                {searchFilteredProducts.length === 1 ? 'item' : 'itens'}
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
                Não encontramos peças correspondentes a "{searchQuery}".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5 mt-2 w-full">
              {searchFilteredProducts.map((product) => {
                const favorited = isFavorite(product.id);
                const displayImg =
                  product.coverImageUrl ||
                  (product.images && product.images.length > 0 ? product.images[0] : '');
                const displayName = product.title || product.name;
                const isOutOfStock = (product.stock ?? 1) <= 0;

                return (
                  <article
                    key={product.id}
                    onClick={() => openProductDetail(product)}
                    className="cursor-pointer flex flex-col bg-white rounded-2xl overflow-hidden shadow-xs border border-[#EAE6DF] hover:shadow-md transition-all relative group"
                  >
                    <div className="relative w-full aspect-[3/4] bg-gray-100 overflow-hidden flex items-center justify-center">
                      {displayImg ? (
                        <img
                          src={displayImg}
                          alt={displayName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <ShoppingBag size={32} className="text-gray-300" />
                      )}
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
                          3x de{' '}
                          <strong className="text-[#171b2b]">
                            R$ {(product.price / 3).toFixed(2).replace('.', ',')}
                          </strong>{' '}
                          s/ juros
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isOutOfStock) return;
                            addToCart(
                              product,
                              product.colors[0]?.name || 'Padrão',
                              product.sizes[0] || 'M'
                            );
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
          {/* Chips de Categorias */}
          <section className="w-full pt-3 pb-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 px-0 w-max">
              <button
                onClick={() => setActiveCategoryChip('novidades')}
                className={`flex items-center gap-1.5 py-2 px-3.5 rounded-full text-xs font-semibold shadow-xs active:scale-95 transition-all ${
                  activeCategoryChip === 'novidades'
                    ? 'bg-[#171b2b] text-white'
                    : 'bg-white text-[#171b2b] border border-[#EAE6DF]'
                }`}
              >
                <span>Novidades</span>
                <span className="bg-[#ff6b57] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  Novo
                </span>
              </button>

              <button
                onClick={() => setActiveCategoryChip('feminino')}
                className={`flex items-center gap-1.5 py-2 px-4 rounded-full text-xs font-semibold shadow-xs active:scale-95 transition-all ${
                  activeCategoryChip === 'feminino'
                    ? 'bg-[#171b2b] text-white'
                    : 'bg-white text-[#171b2b] border border-[#EAE6DF]'
                }`}
              >
                <span>Feminino</span>
              </button>

              <button
                onClick={() => {
                  setActiveCategoryChip('infantil');
                  setCurrentTab('categorias');
                }}
                className={`flex items-center gap-1.5 py-2 px-4 rounded-full text-xs font-semibold shadow-xs active:scale-95 transition-all ${
                  activeCategoryChip === 'infantil'
                    ? 'bg-[#171b2b] text-white'
                    : 'bg-white text-[#171b2b] border border-[#EAE6DF]'
                }`}
              >
                <span>Infantil</span>
              </button>

              <button
                onClick={() => setActiveCategoryChip('promocoes')}
                className="flex items-center gap-1.5 py-2 px-4 rounded-full bg-[#bfedd1] text-[#254f3a] text-xs font-bold shadow-xs active:scale-95 transition-all"
              >
                <Flame size={15} className="text-[#ff6b57] fill-[#ff6b57]" />
                <span>Promoções</span>
              </button>

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

              <button
                onClick={() => setActiveCategoryChip('acessorios')}
                className="flex items-center gap-1.5 py-2 px-4 rounded-full bg-white text-[#171b2b] border border-[#EAE6DF] text-xs font-semibold shadow-xs active:scale-95 transition-all"
              >
                <span>Acessórios</span>
              </button>
            </div>
          </section>

          {/* Se estiver carregando: Skeletons */}
          {isLoadingProducts ? (
            <section className="mt-6 flex flex-col gap-4 w-full">
              <div className="flex items-center justify-between">
                <div className="h-6 w-48 bg-stone-200 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-stone-200 rounded animate-pulse"></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5 w-full">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-xs border border-[#EAE6DF] animate-pulse"
                  >
                    <div className="w-full aspect-[3/4] bg-stone-200"></div>
                    <div className="p-3 flex flex-col gap-2">
                      <div className="h-3 w-16 bg-stone-200 rounded"></div>
                      <div className="h-4 w-3/4 bg-stone-200 rounded"></div>
                      <div className="h-5 w-20 bg-stone-200 rounded mt-1"></div>
                      <div className="h-8 w-full bg-stone-200 rounded-xl mt-2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : allProducts.length === 0 ? (
            /* EmptyState oficial quando a API retorna [] (0 produtos no banco) */
            <section className="mt-6 py-16 px-6 bg-white rounded-3xl border border-[#EAE6DF] shadow-xs flex flex-col items-center justify-center text-center max-w-2xl mx-auto w-full">
              <div className="w-16 h-16 rounded-2xl bg-[#FFF0ED] text-[#FF6B57] flex items-center justify-center mb-4 shadow-2xs">
                <PackageOpen size={32} />
              </div>
              <span className="px-3 py-1 rounded-full bg-[#bfedd1] text-[#254f3a] text-[11px] font-extrabold uppercase tracking-wider mb-2">
                Em Breve
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#171b2b] tracking-tight">
                Nenhum produto cadastrado no momento
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mt-2 leading-relaxed">
                Nosso catálogo está sendo preparado com as novas peças oficiais da coleção{' '}
                <strong>SAGAS.MODA</strong>. Assim que os produtos forem publicados no ERP, eles
                aparecerão automaticamente aqui.
              </p>
              <button
                onClick={() => fetchProductsFromERP()}
                className="mt-6 px-6 py-3 rounded-full bg-[#171b2b] hover:bg-black text-white text-xs font-bold flex items-center gap-2 shadow-md active:scale-95 transition"
              >
                <RefreshCw size={14} />
                <span>Atualizar Catálogo</span>
              </button>
            </section>
          ) : (
            <>
              {/* Seção Ofertas Relâmpago (apenas se houver itens reais elegíveis) */}
              {flashSaleItems.length > 0 && (
                <section className="mt-4 py-3 bg-white shadow-xs rounded-2xl border border-[#EAE6DF]/70 flex flex-col gap-3 w-full">
                  <div className="px-3 sm:px-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base sm:text-lg font-black text-[#171b2b]">
                        Destaques & Combos
                      </span>
                      <span className="text-amber-500">⚡</span>
                    </div>
                    <button
                      onClick={() => setCurrentTab('categorias')}
                      className="text-xs font-bold text-[#ff6b57] flex items-center gap-0.5 hover:underline"
                    >
                      <span>Ver todos</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="w-full overflow-x-auto no-scrollbar">
                    <div className="flex items-stretch gap-3 px-3 sm:px-4 w-max pb-1">
                      {flashSaleItems.map((item) => {
                        const itemImg =
                          item.coverImageUrl ||
                          (item.images && item.images.length > 0 ? item.images[0] : '');
                        const itemName = item.title || item.name;
                        const isOutOfStock = (item.stock ?? 1) <= 0;

                        return (
                          <article
                            key={item.id}
                            onClick={() => openProductDetail(item)}
                            className="w-36 sm:w-44 flex flex-col bg-[#FAF9F6] rounded-2xl overflow-hidden shadow-xs cursor-pointer border border-[#EAE6DF] hover:shadow-md transition-all active:scale-98"
                          >
                            <div className="relative w-full aspect-[3/4] bg-gray-100 overflow-hidden flex items-center justify-center">
                              {itemImg ? (
                                <img
                                  src={itemImg}
                                  alt={itemName}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                />
                              ) : (
                                <ShoppingBag size={28} className="text-gray-300" />
                              )}
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
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                </section>
              )}

              {/* Grade Principal de Produtos Sincronizados do ERP */}
              <section className="mt-8 flex flex-col gap-4 w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-lg sm:text-xl font-black text-[#171b2b]">
                      Catálogo Oficial
                    </h2>
                    <Sparkles size={18} className="text-[#ff6b57]" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    {bestSellers.length} {bestSellers.length === 1 ? 'produto' : 'produtos'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5 w-full">
                  {bestSellers.map((product) => {
                    const favorited = isFavorite(product.id);
                    const pImg =
                      product.coverImageUrl ||
                      (product.images && product.images.length > 0 ? product.images[0] : '');
                    const pName = product.title || product.name;
                    const isOutOfStock = (product.stock ?? 1) <= 0;

                    return (
                      <article
                        key={product.id}
                        onClick={() => openProductDetail(product)}
                        className="cursor-pointer flex flex-col bg-white rounded-2xl overflow-hidden shadow-xs border border-[#EAE6DF] hover:shadow-md transition-all relative group"
                      >
                        <div className="relative w-full aspect-[3/4] bg-gray-100 overflow-hidden flex items-center justify-center">
                          {pImg ? (
                            <img
                              src={pImg}
                              alt={pName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <ShoppingBag size={32} className="text-gray-300" />
                          )}
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
                            <h3 className="text-xs font-semibold text-[#171b2b] line-clamp-2 leading-snug">
                              {pName}
                            </h3>
                            <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-500">
                              <Star size={13} className="text-amber-500 fill-amber-500" />
                              <span className="font-bold text-[#171b2b]">{product.rating}</span>
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
                              3x de{' '}
                              <strong className="text-[#171b2b]">
                                R$ {(product.price / 3).toFixed(2).replace('.', ',')}
                              </strong>{' '}
                              s/ juros
                            </span>

                            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                              {isOutOfStock ? (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[9px] font-bold">
                                  Sem estoque
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#bfedd1] text-[#254f3a] text-[9px] font-bold">
                                  {product.secondaryBadge || 'Em estoque'}
                                </span>
                              )}
                              {product.variations && product.variations.length > 0 && (
                                <span className="text-[9px] text-stone-500 font-medium">
                                  {product.variations.length}{' '}
                                  {product.variations.length === 1 ? 'variação' : 'variações'}
                                </span>
                              )}
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isOutOfStock) return;
                                addToCart(
                                  product,
                                  product.colors[0]?.name || 'Padrão',
                                  product.sizes[0] || 'M'
                                );
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
                  })}
                </div>
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
};
