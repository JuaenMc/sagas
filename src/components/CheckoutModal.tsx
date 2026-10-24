import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { X, Check, Copy, QrCode, ShieldCheck, Lock, Sparkles, Truck, CreditCard } from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const { isCheckoutOpen, setIsCheckoutOpen, total, pixTotal, selectedPayment, clearCart, setCurrentTab } = useCart();
  const [copied, setCopied] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isCheckoutOpen) return null;

  const simulatedPixCode = "00020126580014BR.GOV.BCB.PIX0136sagasbrasil-pix-store-994825204000053039865405114.005802BR5916SAGAS BRASIL MOD6009SAO PAULO62070503***6304E8A2";

  const handleCopyPix = () => {
    navigator.clipboard.writeText(simulatedPixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConfirmPayment = () => {
    setIsSuccess(true);
    setTimeout(() => {
      clearCart();
      setIsSuccess(false);
      setIsCheckoutOpen(false);
      setCurrentTab('home');
    }, 3200);
  };

  const amountToPay = selectedPayment === 'pix' ? pixTotal : total;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-100">
        {/* Header */}
        <div className="bg-[#171b2b] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#ff6b57] flex items-center justify-center text-white">
              <Lock size={16} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-tight">Finalizar Pedido Seguro</h3>
              <p className="text-[11px] text-gray-400">SAGAS Brasil • Criptografia 256-bit</p>
            </div>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X size={18} />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
              <Check size={36} />
            </div>
            <h4 className="text-xl font-extrabold text-gray-900">Pedido Realizado com Sucesso!</h4>
            <p className="text-xs text-gray-600 max-w-xs">
              Enviamos os detalhes do pedido e o código de rastreamento para o seu e-mail e WhatsApp.
            </p>
            <div className="p-3 bg-emerald-50 rounded-2xl text-xs text-emerald-800 font-semibold border border-emerald-200 w-full">
              Código do Pedido: <span className="font-mono font-bold">#SAGAS-8942</span>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-5 space-y-4">
            {/* Value card */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 font-medium">Total a Pagar</span>
                <div className="text-2xl font-black text-[#171b2b]">
                  R$ {amountToPay.toFixed(2).replace('.', ',')}
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  {selectedPayment === 'pix' ? 'Pix (-5% aplicado)' : 'Frete Grátis Brasil'}
                </span>
              </div>
            </div>

            {selectedPayment === 'pix' && (
              <div className="space-y-3 text-center">
                <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-[#ff6b57]/40 flex flex-col items-center justify-center">
                  <div className="w-36 h-36 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200 relative overflow-hidden">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(simulatedPixCode)}`}
                      alt="QR Code Pix"
                      className="w-32 h-32 object-contain"
                    />
                  </div>
                  <span className="text-[11px] text-gray-500 mt-2 font-medium">
                    Abra o app do seu banco e escaneie o QR Code
                  </span>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-bold text-gray-600">Código Pix Copia e Cola:</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={simulatedPixCode}
                      className="flex-1 bg-gray-50 text-[11px] font-mono p-2 rounded-xl border border-gray-200 text-gray-600 truncate focus:outline-none"
                    />
                    <button
                      onClick={handleCopyPix}
                      className="px-3 py-2 bg-[#ff6b57] text-white text-xs font-bold rounded-xl flex items-center gap-1 hover:bg-[#ff5745] active:scale-95 transition-all shadow-xs"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedPayment === 'credit_card' && (
              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="font-bold text-gray-700">Número do Cartão</label>
                  <div className="relative mt-1">
                    <input
                      type="text"
                      placeholder="•••• •••• •••• 4242"
                      defaultValue="4532 8920 1823 4242"
                      className="w-full p-2.5 pl-9 rounded-xl border border-gray-200 bg-gray-50 font-mono"
                    />
                    <CreditCard size={16} className="absolute left-2.5 top-3 text-gray-400" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-gray-700">Validade</label>
                    <input
                      type="text"
                      placeholder="12/28"
                      defaultValue="08/29"
                      className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-center font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700">CVV</label>
                    <input
                      type="password"
                      placeholder="•••"
                      defaultValue="982"
                      className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-center font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-bold text-gray-700">Parcelamento</label>
                  <select className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 bg-gray-50 font-medium">
                    <option>1x de R$ {total.toFixed(2)} (sem juros)</option>
                    <option>2x de R$ {(total / 2).toFixed(2)} (sem juros)</option>
                    <option selected>3x de R$ {(total / 3).toFixed(2)} (sem juros)</option>
                  </select>
                </div>
              </div>
            )}

            {selectedPayment === 'boleto' && (
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-center space-y-2">
                <span className="font-bold text-gray-800">Boleto Bancário Registrado</span>
                <p className="text-gray-500 text-[11px]">
                  O boleto com compensação rápida será gerado com vencimento para 3 dias úteis.
                </p>
              </div>
            )}

            {/* Guarantee badges */}
            <div className="flex items-center justify-center gap-4 text-[11px] text-gray-500 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-600" /> Garantia SAGAS
              </span>
              <span className="flex items-center gap-1">
                <Truck size={14} className="text-blue-600" /> Rastreamento no WhatsApp
              </span>
            </div>

            {/* Action */}
            <button
              onClick={handleConfirmPayment}
              className="w-full py-3.5 rounded-full bg-[#ff6b57] hover:bg-[#ff5745] text-white font-extrabold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              <Check size={18} />
              <span>Simular Pagamento Concluído</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
