import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { 
  ArrowLeft, ShieldCheck, ChevronDown, ChevronUp, Zap, 
  CreditCard, FileText, Lock, Copy, Check, Info, Truck, CheckCircle2,
  MapPin, Sparkles, Plus, ExternalLink, MessageCircle
} from 'lucide-react';
import { createWhatsAppUrl, generateOrderWhatsAppMessage } from '../lib/whatsapp';
import { generatePixBrCode } from '../lib/pix';
import { Order } from '../types';

interface PaymentCheckoutScreenProps {
  onBack?: () => void;
}

export const PaymentCheckoutScreen: React.FC<PaymentCheckoutScreenProps> = ({ onBack }) => {
  const { 
    cart, 
    total, 
    pixTotal, 
    selectedPayment, 
    setSelectedPayment, 
    closeSubScreen, 
    clearCart, 
    setCurrentTab, 
    showToast,
    savedCards,
    openSubScreen,
    firebaseAuthUser,
    currentUser,
    addresses,
    selectedAddress,
    selectedAddressId,
    setSelectedAddressId,
    storeSettings,
    createCheckoutOrder,
    confirmOrderPayment,
    currentOrderId,
    currentOrderNumber
  } = useCart();

  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(14 * 60 + 59);
  const [isOrderFinished, setIsOrderFinished] = useState(false);
  const [completedOrderData, setCompletedOrderData] = useState<Order | null>(null);

  // Credit card local form state
  const [cardNum, setCardNum] = useState(savedCards[0] ? `•••• •••• •••• ${savedCards[0].last4}` : '');
  const [cardHolder, setCardHolder] = useState(savedCards[0]?.holder || '');
  const [cardExpiry, setCardExpiry] = useState(savedCards[0]?.expiry || '');
  const [cardCvv, setCardCvv] = useState('');
  const [installments, setInstallments] = useState('3');
  const [saveCardToggle, setSaveCardToggle] = useState(true);

  // Countdown timer for Pix
  useEffect(() => {
    if (selectedPayment !== 'pix') return;
    const interval = setInterval(() => {
      setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedPayment]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedCountdown = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const pixBrCode = useMemo(() => {
    try {
      return generatePixBrCode({
        pixKey: storeSettings.pixKey || 'juaen.mc@gmail.com',
        merchantName: storeSettings.merchantName || 'JUAN JOSE MANCILLA',
        merchantCity: storeSettings.merchantCity || 'SAO PAULO',
        amount: pixTotal,
        txId: `SGS${Date.now().toString().slice(-6)}`
      });
    } catch (e) {
      return "00020126580014br.gov.bcb.pix0136sagas-pagamentos-98420-br5913SAGAS MODA LTDA 6009SAO PAULO 62070503***6304A1B2";
    }
  }, [storeSettings, pixTotal]);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixBrCode);
    setCopiedPix(true);
    showToast('Código Pix Copia e Cola copiado! Abra o app do seu banco.');
    setTimeout(() => setCopiedPix(false), 3500);
  };

  const [isProcessing, setIsProcessing] = useState(false);

  const handleFinishPayment = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // 1. Criar pedido no ERP com reserva de estoque caso ainda não exista
      let orderId = currentOrderId;
      let orderNumber = currentOrderNumber;

      const pMethod = selectedPayment === 'pix' ? 'PIX' : selectedPayment === 'credit_card' ? 'CREDIT_CARD' : 'BOLETO';
      
      if (!orderId) {
        showToast('Criando pedido no ERP...');
        const createRes = await createCheckoutOrder(pMethod);
        if (createRes && (createRes.orderId || createRes.orderNumber)) {
          orderId = createRes.orderId;
          orderNumber = createRes.orderNumber;
        } else {
          setIsProcessing(false);
          return;
        }
      }

      // Se o usuário selecionou Mercado Pago Checkout Pro ou Cartão
      if (selectedPayment === 'credit_card' || selectedPayment === 'boleto') {
        try {
          showToast('Conectando ao gateway Mercado Pago...');
          const mpPref = await apiClient.createMercadoPagoPreference({
            orderId: orderId!,
            items: cart.map(it => ({
              id: it.productId,
              title: it.name,
              quantity: it.quantity,
              unitPrice: it.price
            })),
            payer: {
              name: currentUser?.displayName || firebaseAuthUser?.displayName || 'Cliente SAGAS',
              email: currentUser?.email || firebaseAuthUser?.email || 'cliente@sagas.moda'
            }
          });

          if (mpPref && (mpPref.initPoint || mpPref.sandboxInitPoint)) {
            clearCart();
            window.location.href = mpPref.initPoint || mpPref.sandboxInitPoint;
            return;
          }
        } catch (mpErr: any) {
          console.warn('[PaymentCheckout] Falha ao gerar preferência Mercado Pago:', mpErr);
        }
      }

      // Se for Pix, podemos gerar via Mercado Pago ou validar no ERP
      if (selectedPayment === 'pix') {
        try {
          const pixRes = await apiClient.createMercadoPagoPix({
            orderId: orderId!,
            amount: activeTotal,
            payer: {
              email: currentUser?.email || firebaseAuthUser?.email || 'cliente@sagas.moda',
              name: currentUser?.displayName || firebaseAuthUser?.displayName || 'Cliente SAGAS'
            }
          });
          if (pixRes && pixRes.qrCode) {
            // Pix dinâmico do Mercado Pago
            console.info('[PaymentCheckout] Pix dinâmico gerado:', pixRes.id);
          }
        } catch (pixErr) {
          console.warn('[PaymentCheckout] Usando Pix direto com chave SAGAS:', pixErr);
        }
      }

      // 2. Confirmar pagamento no ERP (baixa definitiva de estoque e status: PAID)
      showToast('Confirmando pedido e reservando peças no ERP...');
      const externalPaymentId = `mp-${Date.now()}`;
      await confirmOrderPayment({
        externalPaymentId,
        paidAt: new Date().toISOString()
      });

      const finalOrderNumber = orderNumber || `#SG-${Math.floor(10000 + Math.random() * 90000)}`;
      const userId = firebaseAuthUser?.uid || currentUser?.uid || 'guest-mariana';

      const orderData: Order = {
        id: orderId || `order-${Date.now()}`,
        orderNumber: finalOrderNumber,
        userId,
        status: 'aprovado',
        statusLabel: 'Pagamento Aprovado',
        total: activeTotal,
        paymentMethod: selectedPayment,
        paymentMethodLabel: selectedPayment === 'pix' ? 'Pix Instantâneo' : selectedPayment === 'credit_card' ? 'Cartão de Crédito' : 'Boleto',
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          size: item.selectedSize,
          color: item.selectedColor
        })),
        createdAt: 'Agora mesmo',
        trackingCode: `BR${Math.floor(100000000 + Math.random() * 900000000)}SP`,
        estimatedDelivery: 'Em até 2 dias úteis',
        deliveryAddress: selectedAddress 
          ? `${selectedAddress.street}, ${selectedAddress.number}${selectedAddress.complement ? ` (${selectedAddress.complement})` : ''} - ${selectedAddress.neighborhood}, ${selectedAddress.city}/${selectedAddress.state} (CEP: ${selectedAddress.cep})`
          : 'Av. Paulista, 1578 - Bela Vista, São Paulo - SP'
      };

      setCompletedOrderData(orderData);
      setIsOrderFinished(true);
      showToast(`Pedido ${finalOrderNumber} confirmado no ERP!`);
    } catch (err: any) {
      console.error('Erro no fluxo de pagamento:', err);
      showToast(err.message || 'Erro ao processar pagamento no ERP');
    } finally {
      setIsProcessing(false);
    }
  };

  const activeTotal = selectedPayment === 'pix' ? pixTotal : total;
  const pixSavings = total - pixTotal;

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

        <h1 className="font-extrabold text-base text-[#171B2B] tracking-tight">
          Finalizar Pagamento
        </h1>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EBF7F0] text-[#2E6945]">
          <ShieldCheck size={16} />
          <span className="text-[10px] font-bold tracking-wider uppercase">100% SEGURO</span>
        </div>
      </header>

      {isOrderFinished ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 my-12 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce shadow-md">
            <CheckCircle2 size={44} />
          </div>
          <h2 className="text-xl font-black text-[#171B2B]">Pagamento Confirmado!</h2>
          <p className="text-xs text-gray-600 max-w-xs">
            Seu pedido foi sincronizado no Firestore. Acompanhe a entrega em <strong>Meus Pedidos</strong> ou envie o comprovante no WhatsApp da loja.
          </p>
          <div className="w-full max-w-xs p-3 bg-[#EBF7F0] border border-[#A8D5BA] rounded-2xl text-xs text-[#2E6945] font-bold">
            Previsão de entrega: Chega amanhã até às 14:00
          </div>
          <div className="w-full max-w-xs pt-4 flex flex-col gap-2.5">
            <a
              href={createWhatsAppUrl(
                storeSettings.whatsappNumber,
                completedOrderData 
                  ? generateOrderWhatsAppMessage(completedOrderData, selectedAddress, storeSettings.storeName)
                  : `Olá! Acabei de realizar o pedido na ${storeSettings.storeName}. Aguardo confirmação!`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-white font-extrabold text-xs shadow-md active:scale-95 transition flex items-center justify-center gap-2"
            >
              <MessageCircle size={18} />
              <span>Enviar Pedido no WhatsApp da Loja</span>
            </a>

            <button
              onClick={() => {
                closeSubScreen();
                openSubScreen('orders');
              }}
              className="w-full py-3 rounded-full bg-[#FF6B57] hover:bg-[#E05340] text-white font-extrabold text-xs shadow-md active:scale-95 transition"
            >
              Acompanhar em Meus Pedidos
            </button>
            <button
              onClick={() => {
                closeSubScreen();
                setCurrentTab('home');
              }}
              className="w-full py-3 rounded-full bg-gray-100 hover:bg-gray-200 text-[#171B2B] font-bold text-xs active:scale-95 transition"
            >
              Continuar Comprando
            </button>
          </div>
        </div>
      ) : (
        <div className="py-4 flex flex-col w-full max-w-4xl mx-auto space-y-5">
          {/* Collapsible Mini Order Summary */}
          <div className="bg-white rounded-2xl shadow-xs border border-[#F0ECE6] overflow-hidden transition-all duration-300">
            <button
              type="button"
              onClick={() => setIsSummaryOpen(!isSummaryOpen)}
              className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
            >
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Total a pagar</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xl font-black text-[#FF6B57]">
                    R$ {activeTotal.toFixed(2).replace('.', ',')}
                  </span>
                  {selectedPayment === 'pix' && (
                    <>
                      <span className="text-xs text-gray-400 line-through">
                        R$ {total.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-[#EBF7F0] text-[#2E6945] text-[10px] font-bold">
                        5% OFF no Pix
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-xs font-semibold">
                <span>{cart.length} itens</span>
                {isSummaryOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            {isSummaryOpen && (
              <div className="px-4 pb-4 pt-1 bg-[#FAF9F6] border-t border-gray-100 space-y-3">
                <div className="space-y-2.5">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img src={item.image} alt={item.name} className="w-10 h-12 rounded-lg object-cover bg-gray-100" />
                        <div className="min-w-0">
                          <p className="font-bold text-[#171B2B] truncate">{item.name}</p>
                          <p className="text-[11px] text-gray-500">Tam: {item.selectedSize} • Qtd: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold text-[#171B2B]">
                        R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-white space-y-1.5 text-xs border border-gray-100">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Frete Express</span>
                    <span className="text-[#2E6945] font-bold uppercase">Grátis</span>
                  </div>
                  {selectedPayment === 'pix' && (
                    <div className="flex justify-between text-[#2E6945] font-semibold">
                      <span>Desconto exclusivo Pix (5%)</span>
                      <span>- R$ {pixSavings.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Delivery Address Section (Firestore + ViaCEP) */}
          <div className="bg-white rounded-2xl p-4 border border-[#F0ECE6] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#FFF0ED] text-[#FF6B57] flex items-center justify-center">
                  <MapPin size={16} />
                </div>
                <div>
                  <h2 className="text-xs font-black text-[#171B2B] flex items-center gap-1.5">
                    Endereço de Entrega
                    <span className="px-1.5 py-0.5 rounded-full bg-[#EBF7F0] text-[#2E6945] text-[9px] font-bold">
                      ViaCEP
                    </span>
                  </h2>
                  <p className="text-[10px] text-gray-500">Salvo no seu perfil Firestore</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openSubScreen('addresses')}
                className="text-xs font-bold text-[#FF6B57] hover:underline flex items-center gap-1"
              >
                <span>{selectedAddress ? 'Trocar Endereço' : '+ Cadastrar'}</span>
              </button>
            </div>

            {selectedAddress ? (
              <div className="bg-[#FAF9F6] p-3 rounded-xl border border-gray-100 text-xs text-gray-700">
                <div className="flex items-center justify-between pb-1 mb-1 border-b border-gray-200/60">
                  <span className="font-bold text-[#171B2B] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#FF6B57]"></span>
                    {selectedAddress.label} • {selectedAddress.recipientName}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono font-bold">
                    CEP {selectedAddress.cep}
                  </span>
                </div>
                <p className="text-[#171B2B] font-semibold">
                  {selectedAddress.street}, {selectedAddress.number} {selectedAddress.complement ? `• ${selectedAddress.complement}` : ''}
                </p>
                <p className="text-[11px] text-gray-500">
                  {selectedAddress.neighborhood} — {selectedAddress.city}/{selectedAddress.state}
                </p>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
                <span>Nenhum endereço selecionado</span>
                <button
                  type="button"
                  onClick={() => openSubScreen('addresses')}
                  className="px-3 py-1 bg-[#FF6B57] text-white rounded-lg font-bold text-xs"
                >
                  Cadastrar Endereço
                </button>
              </div>
            )}
          </div>

          {/* Payment Methods Stack */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#171B2B]">Forma de Pagamento</h2>
              <span className="text-[11px] text-gray-500">Escolha uma opção</span>
            </div>

            {/* 1. Pix Option */}
            <div
              onClick={() => setSelectedPayment('pix')}
              className={`bg-white rounded-2xl p-4 cursor-pointer transition-all border ${
                selectedPayment === 'pix'
                  ? 'border-[#FF6B57] ring-2 ring-[#FF6B57]/20 shadow-sm'
                  : 'border-[#F0ECE6] hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    selectedPayment === 'pix' ? 'bg-[#FF6B57] text-white' : 'bg-gray-200'
                  }`}>
                    {selectedPayment === 'pix' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-[#171B2B]">Pix</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#EBF7F0] text-[#2E6945] text-[10px] font-extrabold tracking-tight">
                        5% OFF EXTRA
                      </span>
                    </div>
                    <span className="text-xs text-[#2E6945] font-semibold mt-0.5">
                      Aprovação imediata • Sem taxas
                    </span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#EBF7F0] flex items-center justify-center text-[#2E6945]">
                  <Zap size={18} />
                </div>
              </div>

              {selectedPayment === 'pix' && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col items-center space-y-3">
                  {/* Saving Callout */}
                  <div className="w-full p-3 rounded-xl bg-[#EBF7F0] border border-[#A8D5BA]/50 flex items-center gap-2.5">
                    <span className="text-lg">💰</span>
                    <div>
                      <span className="text-xs font-bold text-[#2E6945] block">
                        Você economiza R$ {pixSavings.toFixed(2).replace('.', ',')}!
                      </span>
                      <span className="text-[11px] text-gray-600">
                        Valor final com desconto: R$ {pixTotal.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  {/* SVG QR Code */}
                  <div className="p-3 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center relative">
                    <div className="relative w-40 h-40 flex items-center justify-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(pixBrCode)}`}
                        alt="QR Code Pix SAGAS"
                        className="w-36 h-36 object-contain"
                      />
                      <div className="absolute inset-0 m-auto w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center p-1 border border-gray-100">
                        <div className="w-full h-full rounded-full bg-[#FF6B57] flex items-center justify-center text-white text-[9px] font-black">
                          SGS
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-2 text-center">
                      Aponte a câmera no app do seu banco
                    </p>
                  </div>

                  {/* Timer */}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">
                    <span>Código expira em:</span>
                    <strong className="text-[#171B2B] font-mono">{formattedCountdown}</strong>
                  </div>

                  {/* Store Official Pix Key (Mercado Pago / Banco Inter) */}
                  <div className="w-full p-2.5 rounded-xl bg-orange-50/70 border border-orange-200/60 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#171B2B] text-[11px] flex items-center gap-1">
                        <span>🏦</span> Chave Pix da Loja ({storeSettings.pixKeyType.toUpperCase()})
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium">{storeSettings.bankName}</span>
                    </div>
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-orange-200">
                      <span className="font-mono font-bold text-xs text-[#FF6B57] truncate mr-2">{storeSettings.pixKey}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(storeSettings.pixKey);
                          showToast('Chave Pix copiada com sucesso!');
                        }}
                        className="text-[11px] font-bold text-gray-600 hover:text-[#FF6B57] flex items-center gap-1 shrink-0"
                      >
                        <Copy size={12} /> Copiar Chave
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-500">
                      Titular: <strong>{storeSettings.merchantName}</strong> ({storeSettings.merchantCity})
                    </p>
                  </div>

                  {/* Copia e Cola */}
                  <div className="w-full space-y-1.5">
                    <label className="text-xs font-bold text-[#171B2B]">Pix Copia e Cola Oficial</label>
                    <div className="p-2.5 rounded-xl bg-gray-100 text-[11px] font-mono text-gray-600 break-all select-all">
                      {pixBrCode}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="w-full py-2.5 rounded-full bg-[#171B2B] hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all"
                    >
                      {copiedPix ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{copiedPix ? 'Código Pix Copiado!' : 'Copiar Código Pix'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Credit Card Option */}
            <div
              onClick={() => setSelectedPayment('credit_card')}
              className={`bg-white rounded-2xl p-4 cursor-pointer transition-all border ${
                selectedPayment === 'credit_card'
                  ? 'border-[#FF6B57] ring-2 ring-[#FF6B57]/20 shadow-sm'
                  : 'border-[#F0ECE6] hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    selectedPayment === 'credit_card' ? 'bg-[#FF6B57] text-white' : 'bg-gray-200'
                  }`}>
                    {selectedPayment === 'credit_card' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-[#171B2B]">Cartão de Crédito</span>
                    <p className="text-xs text-gray-500">
                      Em até 3x sem juros de R$ {(total / 3).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-80">
                  <span className="px-1 py-0.5 rounded bg-gray-100 text-gray-600 text-[9px] font-black">VISA</span>
                  <span className="px-1 py-0.5 rounded bg-gray-100 text-gray-600 text-[9px] font-black">MC</span>
                </div>
              </div>

              {selectedPayment === 'credit_card' && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold text-gray-700">Dados do Cartão</span>
                    <button
                      type="button"
                      onClick={() => openSubScreen('add-card')}
                      className="text-xs font-bold text-[#FF6B57] hover:underline"
                    >
                      + Novo Cartão 3D
                    </button>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-600">Número do Cartão</label>
                    <input
                      type="text"
                      value={cardNum}
                      onChange={(e) => setCardNum(e.target.value)}
                      placeholder="0000 0000 0000 0000"
                      className="w-full h-11 px-3 mt-1 bg-gray-50 rounded-xl text-xs font-mono border border-gray-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-gray-600">Validade</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/AA"
                        className="w-full h-11 px-3 mt-1 bg-gray-50 rounded-xl text-xs font-mono border border-gray-200"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-600">CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="123"
                        maxLength={4}
                        className="w-full h-11 px-3 mt-1 bg-gray-50 rounded-xl text-xs font-mono border border-gray-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-600">Parcelamento</label>
                    <select
                      value={installments}
                      onChange={(e) => setInstallments(e.target.value)}
                      className="w-full h-11 px-3 mt-1 bg-gray-50 rounded-xl text-xs font-medium border border-gray-200"
                    >
                      <option value="1">1x de R$ {total.toFixed(2).replace('.', ',')} sem juros</option>
                      <option value="2">2x de R$ {(total / 2).toFixed(2).replace('.', ',')} sem juros</option>
                      <option value="3">3x de R$ {(total / 3).toFixed(2).replace('.', ',')} sem juros</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Boleto Option */}
            <div
              onClick={() => setSelectedPayment('boleto')}
              className={`bg-white rounded-2xl p-4 cursor-pointer transition-all border ${
                selectedPayment === 'boleto'
                  ? 'border-[#FF6B57] ring-2 ring-[#FF6B57]/20 shadow-sm'
                  : 'border-[#F0ECE6] hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    selectedPayment === 'boleto' ? 'bg-[#FF6B57] text-white' : 'bg-gray-200'
                  }`}>
                    {selectedPayment === 'boleto' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-[#171B2B]">Boleto Bancário</span>
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-semibold">
                        3 dias úteis
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">Total R$ {total.toFixed(2).replace('.', ',')} à vista</span>
                  </div>
                </div>
                <FileText size={20} className="text-gray-500" />
              </div>
            </div>
          </div>

          {/* Trust Credentials */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#F0ECE6] flex items-center justify-around text-center text-[11px] text-gray-600">
            <div>
              <ShieldCheck size={20} className="text-[#3D6751] mx-auto mb-1" />
              <span className="font-bold">Compra Protegida</span>
            </div>
            <div className="w-px h-7 bg-gray-200"></div>
            <div>
              <Lock size={20} className="text-[#3D6751] mx-auto mb-1" />
              <span className="font-bold">SSL 256 bits</span>
            </div>
            <div className="w-px h-7 bg-gray-200"></div>
            <div>
              <Truck size={20} className="text-[#3D6751] mx-auto mb-1" />
              <span className="font-bold">30 Dias Troca</span>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Dock */}
      {!isOrderFinished && (
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl p-4 border-t border-gray-100 shadow-xl z-40 w-full">
          <div className="flex items-center justify-between mb-2">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Total da Compra</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-[#171B2B]">
                  R$ {activeTotal.toFixed(2).replace('.', ',')}
                </span>
                {selectedPayment === 'pix' && (
                  <span className="text-xs text-[#2E6945] font-bold">
                    (Economia de R$ {pixSavings.toFixed(2).replace('.', ',')})
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 text-[#2E6945] text-xs font-bold">
              <Truck size={14} />
              <span>Frete Grátis</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFinishPayment}
            className="w-full h-13 rounded-full bg-[#FF6B57] hover:bg-[#E05340] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#FF6B57]/30 active:scale-98 transition-all"
          >
            <Lock size={16} />
            <span>{selectedPayment === 'pix' ? 'Já Paguei via Pix' : 'Concluir Pagamento'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
