import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { PRODUCTS } from '../data/products';
import { 
  ArrowLeft, Trash2, Gift, Plus, Minus, Tag, Check, 
  ShieldCheck, Zap, CreditCard, FileText, Lock, ShoppingBag, ArrowRight,
  MapPin, Truck, Loader2
} from 'lucide-react';
import { fetchAddressByCep, formatCep, cleanCep } from '../lib/viaCep';

export const CartScreen: React.FC = () => {
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    subtotal, 
    totalDiscount, 
    total, 
    pixTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    selectedPayment,
    setSelectedPayment,
    setCurrentTab,
    setIsCheckoutOpen,
    openSubScreen,
    openProductDetail
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [isEditingCoupon, setIsEditingCoupon] = useState(false);

  // ViaCEP Shipping state in Cart
  const [cartCep, setCartCep] = useState('01310-200');
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [shippingResult, setShippingResult] = useState<{ city: string; uf: string; street?: string } | null>({
    city: 'São Paulo',
    uf: 'SP',
    street: 'Avenida Paulista'
  });

  const handleCalculateShipping = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const raw = cleanCep(cartCep);
    if (raw.length !== 8) {
      return;
    }
    setIsCalculatingShipping(true);
    try {
      const data = await fetchAddressByCep(raw);
      if (data) {
        setShippingResult({
          city: data.localidade,
          uf: data.uf,
          street: data.logradouro
        });
      }
    } catch (err) {
      console.warn('ViaCEP cart calc error:', err);
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Check how many combo items are in the cart
  const comboPiecesInCart = cart.reduce((acc, item) => item.isComboEligible ? acc + item.quantity : acc, 0);
  const piecesRemainder = comboPiecesInCart % 3;
  const piecesNeeded = piecesRemainder === 0 && comboPiecesInCart > 0 ? 0 : (3 - piecesRemainder);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCoupon(couponInput.trim());
      setIsEditingCoupon(false);
      setCouponInput('');
    }
  };

  return (
    <div className="flex flex-col w-full pb-36 text-[#171b2b] bg-[#FAF9F6] min-h-screen">
      {/* Top Header matching Image 1 */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#EAE6DF] px-4 py-3 flex items-center justify-between shadow-xs">
        <button
          onClick={() => setCurrentTab('home')}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#171b2b] transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft size={22} />
        </button>

        <div className="flex flex-col items-center text-center">
          <h1 className="font-extrabold text-base text-[#171b2b]">Meu Carrinho</h1>
          <span className="text-[11px] text-gray-500 font-medium">
            ({totalItemsCount} {totalItemsCount === 1 ? 'item selecionado' : 'itens selecionados'})
          </span>
        </div>

        <button
          onClick={clearCart}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
          title="Limpar carrinho"
          aria-label="Limpar carrinho"
        >
          <Trash2 size={20} />
        </button>
      </header>

      {cart.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 my-12">
          <div className="w-20 h-20 rounded-full bg-orange-100 text-[#ff6b57] flex items-center justify-center">
            <ShoppingBag size={36} />
          </div>
          <h2 className="text-lg font-black text-gray-800">Sua sacola está vazia</h2>
          <p className="text-xs text-gray-500 max-w-xs">
            Aproveite a Coleção Primavera/Verão com o combo especial de 3 peças por R$ 100!
          </p>
          <button
            onClick={() => setCurrentTab('categorias')}
            className="px-6 py-3 rounded-full bg-[#ff6b57] text-white text-xs font-bold hover:bg-[#ff5745] active:scale-95 transition-all shadow-md"
          >
            Explorar Produtos
          </button>
        </div>
      ) : (
        <div className="p-4 flex flex-col gap-3.5">
          {/* Top Dynamic Combo Progress Banner matching Image 1 */}
          <div className="p-4 rounded-3xl bg-[#d6f2e2]/60 border border-[#b2e2c5] flex flex-col gap-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#ff6b57] shadow-xs">
                  <Gift size={18} />
                </div>
                <div className="text-xs font-black text-[#1d3d2c]">
                  {piecesNeeded === 0 ? (
                    <span>Combo 3 por R$ 100 Ativado com Sucesso!</span>
                  ) : (
                    <span>Falta apenas {piecesNeeded} {piecesNeeded === 1 ? 'peça' : 'peças'} para o <strong className="text-[#ae3123]">Combo 3 por R$ 100!</strong></span>
                  )}
                </div>
              </div>

              <button
                onClick={() => openSubScreen('combo-suggestions')}
                className="px-3 py-1 rounded-full bg-white hover:bg-gray-50 text-[#ff6b57] text-xs font-bold shadow-xs active:scale-95 transition-all border border-[#b2e2c5]"
              >
                + Adicionar
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-white rounded-full overflow-hidden p-0.5 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[#ff6b57] to-[#ff8c7a] rounded-full transition-all duration-500"
                style={{
                  width: `${piecesNeeded === 0 ? 100 : Math.min(100, ((3 - piecesNeeded) / 3) * 100)}%`
                }}
              ></div>
            </div>

            {/* Check Step Indicators matching Image 1 */}
            <div className="flex items-center justify-between text-xs font-bold text-[#254f3a] pt-1">
              <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1 rounded-full shadow-2xs">
                <Check size={14} className="text-[#3d6751]" />
                <span>Peça 1</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1 rounded-full shadow-2xs">
                <Check size={14} className="text-[#3d6751]" />
                <span>Peça 2</span>
              </div>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-2xs ${
                piecesNeeded === 0 ? 'bg-white/80 text-[#254f3a]' : 'bg-white/40 text-gray-400'
              }`}>
                <span className={`w-3.5 h-3.5 rounded-full border-2 ${piecesNeeded === 0 ? 'bg-[#3d6751] border-[#3d6751]' : 'border-gray-400'}`}></span>
                <span>Peça 3</span>
              </div>
            </div>
          </div>

          {/* Cart Item Cards List matching Image 1 */}
          <div className="flex flex-col gap-3">
            {cart.map(item => (
              <div
                key={item.id}
                className="p-3.5 rounded-3xl bg-white border border-[#EAE6DF] shadow-xs flex items-center gap-3 relative"
              >
                {/* Photo Thumbnail */}
                <div 
                  onClick={() => {
                    const prod = PRODUCTS.find(p => p.id === item.productId || p.name.toLowerCase().includes(item.name.toLowerCase().slice(0, 10))) || PRODUCTS[0];
                    openProductDetail(prod);
                  }}
                  className="relative w-20 h-24 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100 cursor-pointer group"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {item.comboTag && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-[#ff6b57] text-white text-[9px] font-black shadow-xs">
                      {item.comboTag}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between h-24 py-0.5">
                  <div className="pr-6">
                    <h3 
                      onClick={() => {
                        const prod = PRODUCTS.find(p => p.id === item.productId || p.name.toLowerCase().includes(item.name.toLowerCase().slice(0, 10))) || PRODUCTS[0];
                        openProductDetail(prod);
                      }}
                      className="text-xs sm:text-sm font-extrabold text-[#171b2b] line-clamp-1 cursor-pointer hover:text-[#ff6b57] transition-colors"
                    >
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Tam: <strong className="text-gray-800">{item.selectedSize}</strong> • Cor: <strong className="text-gray-800">{item.selectedColor}</strong>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-black text-[#171b2b]">
                      R$ {item.price.toFixed(2).replace('.', ',')}
                    </span>

                    {/* Stepper */}
                    <div className="flex items-center bg-[#f3f2ff] rounded-full p-1 border border-[#dee1f8]">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-gray-700 shadow-2xs hover:bg-gray-100"
                        aria-label="Diminuir"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-7 text-center text-xs font-black text-[#171b2b]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-gray-700 shadow-2xs hover:bg-gray-100"
                        aria-label="Aumentar"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Trash Button */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="absolute top-3.5 right-3.5 text-gray-300 hover:text-red-500 transition-colors p-1"
                  aria-label="Remover item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Coupon Section matching Image 1 */}
          <div className="p-3.5 rounded-3xl bg-white border border-[#EAE6DF] shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-[#ff6b57]">
                <Tag size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Cupom de Desconto
                </span>
                <span className="text-xs font-black text-[#171b2b]">
                  {appliedCoupon || 'Nenhum cupom aplicado'}
                </span>
              </div>
            </div>

            {appliedCoupon ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#bfedd1] text-[#254f3a] text-xs font-bold">
                  <Check size={14} />
                  <span>-R$ 14,98</span>
                </span>
                <button
                  onClick={removeCoupon}
                  className="text-gray-400 hover:text-red-500 text-xs font-bold ml-1"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingCoupon(!isEditingCoupon)}
                className="text-xs font-bold text-[#ff6b57] hover:underline"
              >
                Adicionar
              </button>
            )}
          </div>

          {isEditingCoupon && !appliedCoupon && (
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Digite BEMVINDA10"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2 text-xs font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-[#ff6b57]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-full bg-[#ff6b57] text-white text-xs font-bold shadow-xs"
              >
                Aplicar
              </button>
            </form>
          )}

          {/* Frete & Prazo via ViaCEP */}
          <div className="p-3.5 rounded-3xl bg-white border border-[#EAE6DF] shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#EBF7F0] text-[#2E6945] flex items-center justify-center">
                  <Truck size={16} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Frete & Prazo (ViaCEP)
                  </span>
                  <span className="text-xs font-black text-[#171b2b]">
                    {shippingResult ? `${shippingResult.city} - ${shippingResult.uf}` : 'Calcular para seu CEP'}
                  </span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full bg-[#bfedd1] text-[#254f3a] text-[10px] font-extrabold uppercase">
                Grátis
              </span>
            </div>

            <form onSubmit={handleCalculateShipping} className="flex gap-2 pt-1">
              <div className="relative flex-1">
                <input
                  type="text"
                  maxLength={9}
                  placeholder="00000-000"
                  value={cartCep}
                  onChange={(e) => setCartCep(formatCep(e.target.value))}
                  className="w-full bg-[#FAF9F6] border border-gray-200 rounded-full px-3.5 py-1.5 text-xs font-mono font-bold text-[#171b2b] focus:outline-none focus:ring-2 focus:ring-[#ff6b57]"
                />
              </div>
              <button
                type="submit"
                disabled={isCalculatingShipping}
                className="px-4 py-1.5 rounded-full bg-[#171b2b] text-white text-xs font-bold hover:bg-black transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
              >
                {isCalculatingShipping ? <Loader2 size={13} className="animate-spin" /> : null}
                <span>Calcular</span>
              </button>
            </form>

            {shippingResult && (
              <div className="text-[11px] text-[#2E6945] font-semibold flex items-center justify-between px-1 pt-0.5">
                <span>✓ Chega em 2 a 4 dias úteis no seu endereço</span>
                <span className="font-bold">R$ 0,00</span>
              </div>
            )}
          </div>

          {/* Resumo do Pedido matching Image 1 */}
          <div className="p-4 rounded-3xl bg-white border border-[#EAE6DF] shadow-xs space-y-2.5">
            <div className="flex items-center gap-1.5 pb-1 border-b border-gray-100">
              <FileText size={16} className="text-[#ff6b57]" />
              <h3 className="text-xs font-black text-[#171b2b]">Resumo do Pedido</h3>
            </div>

            <div className="flex justify-between text-xs text-gray-600">
              <span>Subtotal ({totalItemsCount} peças)</span>
              <span className="font-bold text-[#171b2b]">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
            </div>

            <div className="flex justify-between text-xs text-[#ae3123]">
              <span className="flex items-center gap-1">
                <Tag size={13} /> Desconto Combo & Cupom
              </span>
              <span className="font-bold">-R$ {totalDiscount.toFixed(2).replace('.', ',')}</span>
            </div>

            <div className="flex justify-between text-xs text-gray-600 items-center">
              <span>Frete Brasil</span>
              <span className="px-2 py-0.5 rounded-full bg-[#bfedd1] text-[#254f3a] text-[10px] font-extrabold">
                GRÁTIS
              </span>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-baseline justify-between">
              <div>
                <span className="text-base font-black text-[#171b2b]">Total</span>
                <p className="text-[10px] text-gray-400">
                  em até 3x de R$ {(total / 3).toFixed(2).replace('.', ',')} sem juros
                </p>
              </div>
              <div className="text-xl font-black text-[#171b2b]">
                R$ {total.toFixed(2).replace('.', ',')}
              </div>
            </div>
          </div>

          {/* Security assurance */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#3d6751] font-semibold pt-1">
            <ShieldCheck size={16} />
            <span>Compra 100% Segura • Criptografia de ponta</span>
          </div>

          {/* Payment Methods Cards matching Image 1 */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {/* Pix */}
            <button
              onClick={() => setSelectedPayment('pix')}
              className={`p-3 rounded-2xl flex flex-col items-center text-center gap-1 transition-all border ${
                selectedPayment === 'pix'
                  ? 'bg-white border-[#ff6b57] ring-2 ring-[#ff6b57]/20 shadow-xs'
                  : 'bg-white border-[#EAE6DF] hover:bg-gray-50'
              }`}
            >
              <Zap size={18} className="text-[#3d6751]" />
              <span className="text-[11px] font-extrabold text-[#171b2b]">Pix Instantâneo</span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#bfedd1] text-[#254f3a] text-[9px] font-bold">
                -5% extra
              </span>
            </button>

            {/* Cartão */}
            <button
              onClick={() => setSelectedPayment('credit_card')}
              className={`p-3 rounded-2xl flex flex-col items-center text-center gap-1 transition-all border ${
                selectedPayment === 'credit_card'
                  ? 'bg-white border-[#ff6b57] ring-2 ring-[#ff6b57]/20 shadow-xs'
                  : 'bg-white border-[#EAE6DF] hover:bg-gray-50'
              }`}
            >
              <CreditCard size={18} className="text-gray-700" />
              <span className="text-[11px] font-extrabold text-[#171b2b]">Cartão de Crédito</span>
              <span className="text-[9px] text-gray-500">Até 3x s/juros</span>
            </button>

            {/* Boleto */}
            <button
              onClick={() => setSelectedPayment('boleto')}
              className={`p-3 rounded-2xl flex flex-col items-center text-center gap-1 transition-all border ${
                selectedPayment === 'boleto'
                  ? 'bg-white border-[#ff6b57] ring-2 ring-[#ff6b57]/20 shadow-xs'
                  : 'bg-white border-[#EAE6DF] hover:bg-gray-50'
              }`}
            >
              <FileText size={18} className="text-gray-700" />
              <span className="text-[11px] font-extrabold text-[#171b2b]">Boleto Bancário</span>
              <span className="text-[9px] text-gray-500">À vista</span>
            </button>
          </div>

          {/* Desktop Checkout CTA */}
          <div className="hidden lg:flex items-center justify-between pt-4 mt-2 border-t border-gray-100">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 font-bold uppercase">Total a pagar</span>
              <div className="text-2xl font-black text-[#171b2b]">
                R$ {total.toFixed(2).replace('.', ',')}
              </div>
              <span className="text-xs font-bold text-[#3d6751]">
                R$ {pixTotal.toFixed(2).replace('.', ',')} com 5% OFF no Pix
              </span>
            </div>

            <button
              onClick={() => openSubScreen('payment-checkout')}
              className="py-4 px-8 rounded-full bg-[#ff6b57] hover:bg-[#ff5745] text-white font-extrabold text-sm shadow-md active:scale-95 transition-all flex items-center gap-2"
            >
              <span>Avançar para Pagamento</span>
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      )}

      {/* Sticky Bottom Bar on Mobile */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EAE6DF] p-3 px-4 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] w-full lg:hidden flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-medium">Total a pagar</span>
            <div className="text-lg font-black text-[#171b2b] leading-tight">
              R$ {total.toFixed(2).replace('.', ',')}
            </div>
            <span className="text-[10px] font-bold text-[#3d6751]">
              R$ {pixTotal.toFixed(2).replace('.', ',')} no Pix
            </span>
          </div>

          <button
            onClick={() => openSubScreen('payment-checkout')}
            className="py-3.5 px-6 rounded-full bg-[#ff6b57] hover:bg-[#ff5745] text-white font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center gap-2"
          >
            <span>Finalizar Compra</span>
            <Lock size={15} />
          </button>
        </div>
      )}
    </div>
  );
};
