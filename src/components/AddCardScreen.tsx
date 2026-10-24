import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { 
  ArrowLeft, Lock, ShieldCheck, CreditCard, Camera, Info, 
  CheckCircle, RotateCcw, Shield, X, Sparkles, Check 
} from 'lucide-react';

interface AddCardScreenProps {
  onBack?: () => void;
}

export const AddCardScreen: React.FC<AddCardScreenProps> = ({ onBack }) => {
  const { closeSubScreen, saveCreditCard, showToast } = useCart();

  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cpf, setCpf] = useState('');
  const [installments, setInstallments] = useState('3');
  const [saveCard, setSaveCard] = useState(true);
  const [isDefault, setIsDefault] = useState(true);

  const [isFlipped, setIsFlipped] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCvvModalOpen, setIsCvvModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Detect card brand
  const detectBrand = (cleanNumber: string) => {
    if (/^4/.test(cleanNumber)) return { name: 'VISA', bg: 'from-blue-900 to-indigo-950' };
    if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(cleanNumber)) return { name: 'MASTERCARD', bg: 'from-slate-900 via-[#1b2234] to-[#0f1422]' };
    if (/^(4011|4389|4514|5041|5066|5090|6277|6362|6363)/.test(cleanNumber)) return { name: 'ELO', bg: 'from-stone-900 to-amber-950' };
    return { name: 'SAGAS CARD', bg: 'from-slate-900 via-[#1b2234] to-[#0f1422]' };
  };

  const cleanNum = cardNumber.replace(/\D/g, '');
  const brandInfo = detectBrand(cleanNum);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 16) val = val.substring(0, 16);
    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.substring(0, 4);
    if (val.length > 2) {
      val = val.substring(0, 2) + '/' + val.substring(2);
    }
    setExpiry(val);
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.substring(0, 11);
    let formatted = val;
    if (val.length > 9) {
      formatted = val.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (val.length > 6) {
      formatted = val.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (val.length > 3) {
      formatted = val.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }
    setCpf(formatted);
  };

  const handleSimulateScan = () => {
    setCardNumber('4123 5678 9012 3456');
    setCardHolder('MARIANA S OLIVEIRA');
    setExpiry('08/29');
    setCpf('389.284.198-40');
    setIsScannerOpen(false);
    setIsFlipped(true);
    showToast('Dados do cartão detectados com inteligência óptica!');
  };

  const handleSaveCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardHolder || !expiry || !cvv) {
      showToast('Por favor, preencha todos os dados do cartão.');
      return;
    }

    setIsSaving(true);
    await saveCreditCard({
      brand: brandInfo.name,
      last4: cleanNum.slice(-4) || '3456',
      holder: cardHolder.toUpperCase(),
      expiry: expiry || '12/28',
      isDefault
    });

    setTimeout(() => {
      setIsSaving(false);
      if (onBack) onBack();
      else closeSubScreen();
    }, 800);
  };

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
          Adicionar Cartão
        </h1>

        <div className="w-10 h-10 flex items-center justify-center text-[#3D6751]" title="Transação Segura">
          <Lock size={20} />
        </div>
      </header>

      <div className="px-4 py-3 flex flex-col w-full max-w-md mx-auto">
        {/* Security Notice Pill */}
        <section className="mb-4 flex items-center justify-between bg-white px-4 py-3 rounded-2xl shadow-2xs border border-[#F0ECE6]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#EBF7F0] flex items-center justify-center text-[#2E6945]">
              <ShieldCheck size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#171B2B]">Ambiente Blindado 256-bit</span>
              <span className="text-[11px] text-gray-500">Dados tokenizados e criptografados</span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] bg-[#EBF7F0] text-[#2E6945] font-extrabold px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2E6945]"></span>
            PCI-DSS Nível 1
          </span>
        </section>

        {/* 3D Flipable Credit Card Container */}
        <section className="mb-4" style={{ perspective: '1000px' }}>
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="relative w-full aspect-[1.586/1] rounded-2xl shadow-xl cursor-pointer transition-transform duration-700"
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
          >
            {/* Card Front */}
            <div
              className={`absolute inset-0 w-full h-full rounded-2xl p-5 flex flex-col justify-between text-white overflow-hidden bg-gradient-to-br ${brandInfo.bg} shadow-md`}
              style={{ backfaceVisibility: 'hidden' }}
            >
              {/* Shimmer decorative glow */}
              <div className="absolute -top-24 -right-24 w-52 h-52 bg-[#FF6B57]/20 rounded-full blur-3xl pointer-events-none"></div>

              {/* Top Row: Chip, Contactless & Brand */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* EMV Chip graphic */}
                  <div className="w-11 h-8 bg-gradient-to-br from-[#edd399] via-[#cbb175] to-[#9e8346] rounded-md shadow-inner flex flex-col justify-around p-1 relative overflow-hidden">
                    <div className="w-full h-[1px] bg-[#6c5929]/40"></div>
                    <div className="w-full h-[1px] bg-[#6c5929]/40"></div>
                    <div className="absolute inset-0 m-auto w-4 h-4 border border-[#6c5929]/50 rounded-xs"></div>
                  </div>
                  {/* Contactless Icon */}
                  <span className="text-white/70 text-xs font-mono rotate-90">(((</span>
                </div>

                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs">
                  <span className="text-[11px] font-bold text-white tracking-widest uppercase">
                    {brandInfo.name}
                  </span>
                  <CreditCard size={15} className="text-[#FF6B57]" />
                </div>
              </div>

              {/* Middle: Card Number */}
              <div className="relative z-10 my-auto">
                <div className="text-[10px] text-white/50 mb-1 tracking-wider uppercase">Número do Cartão</div>
                <div className="text-[19px] leading-6 tracking-[0.14em] text-white drop-shadow-xs font-mono font-bold">
                  {cardNumber || '•••• •••• •••• ••••'}
                </div>
              </div>

              {/* Bottom Row: Cardholder & Expiration */}
              <div className="relative z-10 flex items-end justify-between">
                <div className="flex flex-col max-w-[65%]">
                  <span className="text-[9px] text-white/50 tracking-wider uppercase">Titular do Cartão</span>
                  <span className="text-xs font-bold text-white tracking-wider truncate uppercase">
                    {cardHolder || 'NOME IMPRESSO'}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] text-white/50 tracking-wider uppercase">Validade</span>
                  <span className="text-xs font-bold text-white tracking-wider font-mono">
                    {expiry || 'MM/AA'}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Back */}
            <div
              className="absolute inset-0 w-full h-full rounded-2xl py-5 text-white overflow-hidden bg-gradient-to-br from-[#121622] via-[#2c3041] to-[#0c0f17] flex flex-col justify-between"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              {/* Magnetic Stripe */}
              <div className="w-full h-10 bg-black/80 mt-1"></div>

              {/* CVV Section */}
              <div className="px-5 flex flex-col gap-1">
                <div className="flex justify-between items-center text-white/60 text-[10px]">
                  <span>CÓDIGO DE SEGURANÇA</span>
                  <span>CVV</span>
                </div>
                <div className="w-full h-9 bg-white/95 rounded-lg flex items-center justify-end px-3">
                  <span className="text-xs text-[#171B2B] font-mono tracking-widest font-bold">
                    {cvv ? '•••' : '123'}
                  </span>
                </div>
              </div>

              <div className="px-5 flex items-center justify-between text-white/40 text-[11px]">
                <span>SAGAS Pagamentos Protegidos</span>
                <Lock size={14} />
              </div>
            </div>
          </div>

          {/* Flip Hint */}
          <div className="flex items-center justify-center gap-1.5 mt-2.5 text-gray-500 text-xs">
            <RotateCcw size={14} />
            <span>Toque no cartão para ver o verso</span>
          </div>
        </section>

        {/* Scan with Camera simulated button */}
        <button
          type="button"
          onClick={() => setIsScannerOpen(true)}
          className="w-full bg-white hover:bg-gray-50 p-3.5 rounded-2xl border border-[#F0ECE6] shadow-2xs flex items-center justify-between text-left group mb-4 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF6B57] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Camera size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#171B2B]">Escanear com a Câmera</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EBF7F0] text-[#2E6945] font-bold">
                  Auto-preencher
                </span>
              </div>
              <span className="text-[11px] text-gray-500">Posicione o cartão e detectaremos os dados</span>
            </div>
          </div>
          <span className="text-gray-400 group-hover:text-black">›</span>
        </button>

        {/* Card Form */}
        <form onSubmit={handleSaveCardSubmit} className="flex flex-col gap-3">
          {/* Card Number */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold text-[#171B2B]">Número do Cartão</label>
              <span className="text-[11px] text-[#2E6945] font-semibold flex items-center gap-0.5">
                <Shield size={12} /> Criptografia ponta a ponta
              </span>
            </div>
            <div className="relative flex items-center">
              <input
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                inputMode="numeric"
                maxLength={19}
                placeholder="0000 0000 0000 0000"
                className="w-full h-12 bg-white rounded-xl px-4 text-xs font-mono text-[#171B2B] placeholder:text-gray-400 shadow-2xs border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B57]"
              />
              <span className="absolute right-3 text-xs font-bold text-gray-500">
                {brandInfo.name}
              </span>
            </div>
          </div>

          {/* Cardholder */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold text-[#171B2B]">Nome Completo</label>
              <span className="text-[11px] text-gray-400">Como impresso no cartão</span>
            </div>
            <input
              type="text"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
              placeholder="EX: MARIA S OLIVEIRA"
              className="w-full h-12 bg-white rounded-xl px-4 text-xs uppercase text-[#171B2B] placeholder:text-gray-400 shadow-2xs border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B57]"
            />
          </div>

          {/* Expiry & CVV */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#171B2B] px-1">Validade</label>
              <input
                type="text"
                value={expiry}
                onChange={handleExpiryChange}
                maxLength={5}
                placeholder="MM/AA"
                className="w-full h-12 bg-white rounded-xl px-4 text-xs font-mono text-[#171B2B] placeholder:text-gray-400 shadow-2xs border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B57]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-[#171B2B]">CVV</label>
                <button
                  type="button"
                  onClick={() => setIsCvvModalOpen(true)}
                  className="text-gray-400 hover:text-black"
                >
                  <Info size={14} />
                </button>
              </div>
              <input
                type="password"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                onFocus={() => setIsFlipped(true)}
                onBlur={() => setIsFlipped(false)}
                maxLength={4}
                placeholder="123"
                className="w-full h-12 bg-white rounded-xl px-4 text-xs font-mono tracking-widest text-[#171B2B] placeholder:text-gray-400 shadow-2xs border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B57]"
              />
            </div>
          </div>

          {/* CPF do Titular */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold text-[#171B2B]">CPF do Titular</label>
              <span className="text-[11px] text-gray-400">Validação anti-fraude</span>
            </div>
            <input
              type="text"
              value={cpf}
              onChange={handleCpfChange}
              maxLength={14}
              placeholder="000.000.000-00"
              className="w-full h-12 bg-white rounded-xl px-4 text-xs font-mono text-[#171B2B] placeholder:text-gray-400 shadow-2xs border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B57]"
            />
          </div>

          {/* Parcelamento Padrão */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#171B2B] px-1">Opção de Parcelamento Padrão</label>
            <select
              value={installments}
              onChange={(e) => setInstallments(e.target.value)}
              className="w-full h-12 bg-white rounded-xl px-4 text-xs font-medium text-[#171B2B] shadow-2xs border border-gray-200 focus:outline-none"
            >
              <option value="1">1x de R$ 120,00 sem juros (À vista)</option>
              <option value="2">2x de R$ 60,00 sem juros</option>
              <option value="3">3x de R$ 40,00 sem juros (Recomendado)</option>
              <option value="4">4x de R$ 30,00 sem juros</option>
            </select>
          </div>

          {/* Toggles */}
          <div className="mt-1 flex flex-col gap-3 bg-white p-4 rounded-2xl border border-[#F0ECE6] shadow-2xs">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#171B2B]">Salvar cartão para compras futuras</span>
                <span className="text-[11px] text-gray-500">Armazenamento tokenizado PCI-DSS</span>
              </div>
              <input
                type="checkbox"
                checked={saveCard}
                onChange={(e) => setSaveCard(e.target.checked)}
                className="w-5 h-5 rounded text-[#3D6751] accent-[#3D6751]"
              />
            </label>
            <div className="w-full h-px bg-gray-100"></div>
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#171B2B]">Definir como cartão principal</span>
                <span className="text-[11px] text-gray-500">Priorizado no checkout</span>
              </div>
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-5 h-5 rounded text-[#3D6751] accent-[#3D6751]"
              />
            </label>
          </div>

          {/* Sticky CTA */}
          <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md p-4 border-t border-gray-100 shadow-lg z-40 max-w-md mx-auto">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full h-12 bg-[#FF6B57] hover:bg-[#E05340] text-white rounded-full font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
            >
              <Lock size={16} />
              <span>{isSaving ? 'Validando e Criptografando...' : 'Salvar Cartão com Segurança'}</span>
            </button>
          </div>
        </form>

        {/* Simulated Camera Scanner Modal */}
        {isScannerOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-between p-6 animate-in fade-in">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Camera size={20} className="text-[#FF6B57]" />
                <span className="font-extrabold text-sm">Escanear Cartão</span>
              </div>
              <button
                onClick={() => setIsScannerOpen(false)}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative w-full aspect-[1.586/1] my-auto rounded-2xl bg-black/40 overflow-hidden border-2 border-dashed border-[#FF6B57] shadow-2xl flex flex-col items-center justify-center text-center p-4 text-white">
              <CreditCard size={44} className="text-[#FF6B57] mb-2 animate-pulse" />
              <p className="text-sm font-bold">Enquadre a frente do cartão</p>
              <p className="text-xs text-gray-300">Detecção automática com IA</p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleSimulateScan}
                className="h-12 bg-[#3D6751] text-white rounded-full text-xs font-bold shadow-lg flex items-center justify-center gap-2"
              >
                <Sparkles size={16} />
                <span>Simular Leitura Óptica</span>
              </button>
              <button
                type="button"
                onClick={() => setIsScannerOpen(false)}
                className="text-gray-300 text-xs py-2 hover:underline"
              >
                Digitar dados manualmente
              </button>
            </div>
          </div>
        )}

        {/* CVV info modal */}
        {isCvvModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-6 animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm flex flex-col items-center text-center shadow-2xl space-y-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-[#FF6B57] flex items-center justify-center">
                <Lock size={24} />
              </div>
              <h3 className="font-bold text-base text-[#171B2B]">O que é o CVV?</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                É o código de 3 dígitos localizado no verso da maioria dos cartões (ou 4 dígitos na frente em cartões Amex). Ele garante que você possui o cartão físico.
              </p>
              <div className="w-full bg-[#EBF7F0] rounded-xl p-2.5 text-xs text-[#2E6945] font-semibold flex items-center justify-center gap-1.5">
                <Check size={16} />
                <span>Nunca compartilhamos nem salvamos seu CVV</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCvvModalOpen(false)}
                className="w-full h-11 bg-[#FF6B57] text-white rounded-full text-xs font-bold hover:bg-[#E05340]"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
