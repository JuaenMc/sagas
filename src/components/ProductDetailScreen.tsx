import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import { 
  ArrowLeft, Share2, Heart, Star, ChevronRight, Eye, 
  Minus, Plus, ShieldCheck, Truck, RotateCcw, ChevronDown, 
  ChevronUp, Tag, Sparkles, Check, ShoppingBag, Lock
} from 'lucide-react';
import { VirtualFittingModal } from './VirtualFittingModal';
import { SizeGuideModal } from './SizeGuideModal';

interface ProductDetailScreenProps {
  product: Product;
  onBack: () => void;
}

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({ product, onBack }) => {
  const { addToCart, toggleFavorite, isFavorite, setCurrentTab, setIsCheckoutOpen, openSubScreen, closeProductDetail } = useCart();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || 'Rosê Floral');
  const [selectedSize, setSelectedSize] = useState(product.sizes[1] || 'M');
  const [quantity, setQuantity] = useState(1);
  const [isVirtualFittingOpen, setIsVirtualFittingOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Accordion toggle states
  const [isDescOpen, setIsDescOpen] = useState(true);
  const [isFabricOpen, setIsFabricOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);

  const favorited = isFavorite(product.id);

  const handleAddToCart = () => {
    addToCart(product, selectedColor, selectedSize, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedColor, selectedSize, quantity);
    closeProductDetail();
    openSubScreen('payment-checkout');
  };

  const galleryImages = product.images.length > 0 ? product.images : [
    'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=900&q=80'
  ];

  return (
    <div className="flex flex-col w-full pb-32 text-[#171b2b] bg-[#FAF9F6]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE6DF] px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#171b2b] transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="font-extrabold text-xs sm:text-sm text-[#171b2b] tracking-tight uppercase truncate max-w-[200px]">
            Detalhes Do Produto
          </h1>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: product.name, url: window.location.href });
              }
            }}
            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-600 hover:text-black hover:bg-gray-100 transition-colors"
            aria-label="Compartilhar"
          >
            <Share2 size={20} />
          </button>
          <div className="w-8 h-8 rounded-full bg-[#ff6b57] flex items-center justify-center text-white font-bold text-xs shadow-xs ml-1">
            S
          </div>
        </div>
      </header>

      {/* Breadcrumb Context & Actions */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span className="text-[#3d6751] font-bold">Infantil</span>
          <ChevronRight size={14} />
          <span className="text-[#171b2b] font-semibold">{product.subCategory || 'Vestidos'}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleFavorite(product.id)}
            className="w-9 h-9 rounded-full bg-white border border-[#EAE6DF] flex items-center justify-center shadow-xs active:scale-90 transition-transform"
            aria-label="Favoritar"
          >
            <Heart size={18} className={favorited ? 'text-[#ff6b57] fill-[#ff6b57]' : 'text-gray-500'} />
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: product.name, url: window.location.href });
              }
            }}
            className="w-9 h-9 rounded-full bg-white border border-[#EAE6DF] flex items-center justify-center text-gray-500 shadow-xs"
            aria-label="Compartilhar"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* Main Hero Visual Gallery */}
      <div className="px-4 mb-4">
        <div className="relative w-full aspect-[3/4] rounded-[28px] overflow-hidden bg-gray-100 shadow-md border border-[#EAE6DF]">
          <img
            src={galleryImages[currentImageIndex] || galleryImages[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-300"
          />

          {/* Badges Layer */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
            <span className="bg-[#ff6b57] text-white text-xs font-black px-3 py-1 rounded-full shadow-xs tracking-wide">
              -30% OFF
            </span>
            <span className="bg-[#bfedd1] text-[#254f3a] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs">
              Mais Vendido
            </span>
          </div>

          {/* Prev / Next Navigation Buttons */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentImageIndex((currentImageIndex - 1 + galleryImages.length) % galleryImages.length);
            }}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 hover:bg-white text-[#2D3142] shadow-md flex items-center justify-center active:scale-90 transition-all backdrop-blur-xs z-10"
            aria-label="Imagem anterior"
          >
            <ChevronRight size={18} className="rotate-180" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentImageIndex((currentImageIndex + 1) % galleryImages.length);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/85 hover:bg-white text-[#2D3142] shadow-md flex items-center justify-center active:scale-90 transition-all backdrop-blur-xs z-10"
            aria-label="Próxima imagem"
          >
            <ChevronRight size={18} />
          </button>

          {/* Action Floating Badge: Ver no Corpinho */}
          <button
            onClick={() => setIsVirtualFittingOpen(true)}
            className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-full flex items-center gap-1.5 shadow-md active:scale-95 transition-all border border-gray-100 z-10"
          >
            <Eye size={17} className="text-[#ff6b57]" />
            <span className="text-xs font-bold text-[#171b2b]">Ver no Corpinho</span>
          </button>

          {/* Counter Indicator */}
          <div className="absolute bottom-4 right-4 bg-black/75 text-white backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold tracking-wider flex items-center gap-1 z-10">
            <span>{currentImageIndex + 1}</span>
            <span className="opacity-60">/</span>
            <span className="opacity-60">{galleryImages.length}</span>
          </div>
        </div>

        {/* Quick Carousel Thumbnails Bar */}
        <div className="flex items-center gap-2.5 mt-3 overflow-x-auto no-scrollbar py-1">
          {galleryImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`w-14 h-14 rounded-xl overflow-hidden shadow-xs shrink-0 transition-all ${
                currentImageIndex === idx ? 'ring-2 ring-[#ff6b57] scale-105' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}

          {/* +1 Vídeo chip matching mockup */}
          <div
            onClick={() => setIsVirtualFittingOpen(true)}
            className="w-14 h-14 rounded-xl overflow-hidden shadow-xs shrink-0 bg-[#e4e7fe] text-[#171b2b] text-[10px] font-extrabold flex items-center justify-center cursor-pointer border border-[#dee1f8] active:scale-95 transition-transform"
          >
            +1 Vídeo
          </div>
        </div>
      </div>

      {/* Product Vital Information */}
      <div className="px-4 flex flex-col gap-3">
        {/* Collection & Rating */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold text-[#3d6751] uppercase tracking-wider">
            Coleção Verão 2025
          </span>
          <div className="flex items-center gap-1 text-xs">
            <Star size={14} className="text-amber-500 fill-amber-500" />
            <span className="font-extrabold text-[#171b2b]">{product.rating}</span>
            <span className="text-gray-500">({product.reviewsCount} avaliações)</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-black text-[#171b2b] tracking-tight leading-snug">
          {product.name}
        </h2>

        {/* Pricing & Installments */}
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#ff6b57]">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                R$ {product.originalPrice.toFixed(2).replace('.', ',')}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500 mt-0.5">
            ou até 3x de <strong className="text-[#171b2b]">R$ {(product.price / 3).toFixed(2).replace('.', ',')}</strong> sem juros
          </span>
        </div>

        {/* Active Combo Promotion Card */}
        <div className="p-3.5 rounded-2xl bg-[#bfedd1]/30 border border-[#bfedd1] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#bfedd1] flex items-center justify-center text-[#254f3a] shrink-0">
            <Tag size={16} />
          </div>
          <div>
            <span className="text-xs font-black text-[#254f3a] block">
              Promoção Ativa: Leve 3 peças por R$ 100
            </span>
            <span className="text-[11px] text-gray-600">
              Economize adicionando mais itens da categoria infantil!
            </span>
          </div>
        </div>

        {/* Color Selector */}
        <div className="space-y-2 pt-1">
          <div className="flex justify-between text-xs">
            <span className="font-bold text-gray-800">
              Cor: <strong className="text-[#171b2b]">{selectedColor}</strong>
            </span>
            <span className="text-gray-500">{product.colors.length} opções</span>
          </div>

          <div className="flex items-center gap-3">
            {product.colors.map(col => (
              <button
                key={col.name}
                onClick={() => setSelectedColor(col.name)}
                className={`w-9 h-9 rounded-full transition-all flex items-center justify-center shadow-xs ${
                  selectedColor === col.name ? 'ring-3 ring-[#ff6b57] ring-offset-2 scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: col.hex }}
                title={col.name}
              >
                {selectedColor === col.name && (
                  <Check size={14} className={col.hex === '#F7DE9B' || col.hex === '#F9F5EC' ? 'text-gray-800' : 'text-white'} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Size Selector */}
        <div className="space-y-2 pt-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-gray-800">Tamanho</span>
            <button
              onClick={() => setIsSizeGuideOpen(true)}
              className="text-[#ff6b57] font-bold text-xs flex items-center gap-1 hover:underline"
            >
              <span>Tabela de Medidas</span>
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {product.sizes.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`py-3 rounded-2xl text-xs font-extrabold border transition-all ${
                  selectedSize === size
                    ? 'bg-[#171b2b] text-white border-[#171b2b] shadow-md'
                    : 'bg-white text-gray-800 border-[#EAE6DF] hover:bg-gray-50'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity Stepper */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-gray-800">Quantidade</span>
            <span className="text-[11px] text-emerald-700 font-bold">Estoque disponível no Brasil</span>
          </div>

          <div className="flex items-center justify-between bg-white border border-[#EAE6DF] rounded-2xl p-1.5 w-32 shadow-xs">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="font-black text-sm text-[#171b2b]">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Trust Badges 3-Col Grid matching Image 6 */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="p-3 rounded-2xl bg-white border border-[#EAE6DF] flex flex-col items-center text-center gap-1 shadow-xs">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700">
              <Truck size={16} />
            </div>
            <span className="text-[11px] font-extrabold text-[#171b2b]">Frete Grátis</span>
            <span className="text-[9px] text-gray-500">Acima de R$ 149</span>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-[#EAE6DF] flex flex-col items-center text-center gap-1 shadow-xs">
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-[#ff6b57]">
              <Sparkles size={16} />
            </div>
            <span className="text-[11px] font-extrabold text-[#171b2b]">Pix -5%</span>
            <span className="text-[9px] text-gray-500">
              R$ {(product.price * 0.95).toFixed(2).replace('.', ',')} à vista
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-[#EAE6DF] flex flex-col items-center text-center gap-1 shadow-xs">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-700">
              <RotateCcw size={16} />
            </div>
            <span className="text-[11px] font-extrabold text-[#171b2b]">Troca Fácil</span>
            <span className="text-[9px] text-gray-500">Em até 30 dias</span>
          </div>
        </div>

        {/* Accordions */}
        <div className="space-y-2 pt-2">
          {/* Descrição */}
          <div className="rounded-2xl bg-white border border-[#EAE6DF] overflow-hidden shadow-xs">
            <button
              onClick={() => setIsDescOpen(!isDescOpen)}
              className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-[#171b2b]"
            >
              <span>Descrição do Produto</span>
              {isDescOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {isDescOpen && (
              <div className="px-4 pb-4 text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                {product.description}
              </div>
            )}
          </div>

          {/* Medidas e Tecido */}
          <div className="rounded-2xl bg-white border border-[#EAE6DF] overflow-hidden shadow-xs">
            <button
              onClick={() => setIsFabricOpen(!isFabricOpen)}
              className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-[#171b2b]"
            >
              <span>Medidas e Tecido</span>
              {isFabricOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {isFabricOpen && (
              <div className="px-4 pb-4 text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-3 space-y-2">
                <p><strong>Composição:</strong> {product.fabricInfo}</p>
                {product.measurementsInfo && (
                  <pre className="whitespace-pre-wrap font-sans bg-gray-50 p-2.5 rounded-xl text-[11px]">
                    {product.measurementsInfo}
                  </pre>
                )}
              </div>
            )}
          </div>

          {/* Avaliações */}
          <div className="rounded-2xl bg-white border border-[#EAE6DF] overflow-hidden shadow-xs">
            <button
              onClick={() => setIsReviewsOpen(!isReviewsOpen)}
              className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-[#171b2b]"
            >
              <span>Avaliações das Clientes ({product.reviewsCount})</span>
              {isReviewsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {isReviewsOpen && (
              <div className="px-4 pb-4 text-xs text-gray-600 border-t border-gray-100 pt-3 space-y-3">
                {/* Score & Breakdown */}
                <div className="flex items-center gap-4 bg-[#FAF9F6] p-3 rounded-xl border border-gray-100">
                  <div className="flex flex-col items-center justify-center pr-3 border-r border-gray-200">
                    <span className="text-2xl font-black text-[#171B2B]">4.9</span>
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} className="fill-amber-500" />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-500 mt-0.5">324 opiniões</span>
                  </div>
                  <div className="flex-1 flex flex-col gap-1 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 text-[#171B2B] font-semibold">5</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-amber-400 h-full rounded-full" style={{ width: '92%' }}></div>
                      </div>
                      <span className="text-[9px] text-gray-500">92%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 text-[#171B2B] font-semibold">4</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-amber-400 h-full rounded-full" style={{ width: '7%' }}></div>
                      </div>
                      <span className="text-[9px] text-gray-500">7%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 text-[#171B2B] font-semibold">3</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-amber-400 h-full rounded-full" style={{ width: '1%' }}></div>
                      </div>
                      <span className="text-[9px] text-gray-500">1%</span>
                    </div>
                  </div>
                </div>

                {/* Review 1 */}
                <div className="border-b border-gray-100 pb-2.5 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#FFEBE8] text-[#FF6B57] font-bold text-[10px] flex items-center justify-center">
                        CL
                      </div>
                      <span className="font-bold text-[#171B2B] text-[11px]">Camila Lima</span>
                    </div>
                    <span className="text-[10px] text-gray-400">Há 3 dias</span>
                  </div>
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className="fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-[11px] text-[#171B2B] font-medium leading-relaxed">
                    "Lindo demais! Tecido super macio e fresquinho. Ficou perfeito na minha menina de 4 anos, caimento soltinho e não esquenta nada no calor."
                  </p>
                  <span className="text-[10px] text-[#2E6945] font-semibold flex items-center gap-1">
                    ✓ Compra Verificada
                  </span>
                </div>

                {/* Review 2 */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#EBF7F0] text-[#2E6945] font-bold text-[10px] flex items-center justify-center">
                        MS
                      </div>
                      <span className="font-bold text-[#171B2B] text-[11px]">Mariana Silva</span>
                    </div>
                    <span className="text-[10px] text-gray-400">Há 1 semana</span>
                  </div>
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className="fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-[11px] text-[#171B2B] font-medium leading-relaxed">
                    "Minha filha amou, acabamento impecável! Os botões de madeira e o laço nas costas dão um charme todo especial. Já vou pedir outra estampa."
                  </p>
                  <span className="text-[10px] text-[#2E6945] font-semibold flex items-center gap-1">
                    ✓ Compra Verificada
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar matching Image 6 */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EAE6DF] p-3 px-4 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] max-w-md mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddToCart}
            className="flex-1 py-3 px-3 rounded-full border-2 border-[#ff6b57] text-[#ff6b57] font-bold text-xs hover:bg-[#ff6b57]/5 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <ShoppingBag size={16} />
            <span>Adicionar ao Carrinho</span>
          </button>

          <button
            onClick={handleBuyNow}
            className="flex-1 py-3 px-3 rounded-full bg-[#ff6b57] hover:bg-[#ff5745] text-white font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Lock size={15} />
            <span>Comprar Agora</span>
          </button>
        </div>
      </div>

      {/* Interactive Modals */}
      <VirtualFittingModal
        product={product}
        selectedColor={selectedColor}
        selectedSize={selectedSize}
        isOpen={isVirtualFittingOpen}
        onClose={() => setIsVirtualFittingOpen(false)}
      />

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />
    </div>
  );
};
