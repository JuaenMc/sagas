import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Product, ProductColor, StoreSettings } from '../types';
import { 
  ArrowLeft, Plus, Trash2, Database, Sparkles, Check, 
  Layers, Tag, Image as ImageIcon, Shirt, AlertCircle, ShoppingBag, 
  RefreshCw, CheckCircle2, CreditCard, MessageCircle, Smartphone,
  Settings, ExternalLink, ShieldCheck, Copy, HelpCircle, Building2
} from 'lucide-react';
import { createWhatsAppUrl } from '../lib/whatsapp';

const PHOTO_PRESETS = [
  {
    name: 'Vestido Infantil Floral',
    category: 'infantil',
    subCategory: 'Vestidos',
    url: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=900&q=80'
  },
  {
    name: 'Conjunto Shorts Safari Menino',
    category: 'infantil',
    subCategory: 'Conjuntos',
    url: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=80'
  },
  {
    name: 'Vestido Midi Linho Feminino',
    category: 'feminino',
    subCategory: 'Vestidos',
    url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80'
  },
  {
    name: 'Macaquinho Viscose Terracota',
    category: 'feminino',
    subCategory: 'Macaquinhos',
    url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=80'
  },
  {
    name: 'Conjunto Moletom Infantil Confort',
    category: 'infantil',
    subCategory: 'Conjuntos',
    url: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=900&q=80'
  },
  {
    name: 'Blusa Canelada Algodão Pima',
    category: 'feminino',
    subCategory: 'Blusas',
    url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80'
  }
];

const COLOR_PRESETS: ProductColor[] = [
  { name: 'Rosê Algodão', hex: '#E7B1A5' },
  { name: 'Off-White', hex: '#F8F6F0' },
  { name: 'Menta Suave', hex: '#A8D5BA' },
  { name: 'Terracota', hex: '#C86D51' },
  { name: 'Azul Céu', hex: '#9BC4E2' },
  { name: 'Amarelo Manteiga', hex: '#F7DE9B' }
];

export const AdminCatalogScreen: React.FC = () => {
  const { 
    products, 
    isSyncedWithErp,
    fetchProductsFromERP,
    deleteProduct,
    closeSubScreen, 
    showToast,
    storeSettings,
    updateStoreSettings
  } = useCart();

  const [activeTab, setActiveTab] = useState<'catalog' | 'payments' | 'whatsapp' | 'apk'>('catalog');
  const [isReloading, setIsReloading] = useState(false);

  // Settings local state
  const [localSettings, setLocalSettings] = useState<StoreSettings>({ ...storeSettings });
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [isTestingMp, setIsTestingMp] = useState(false);
  const [mpTestResult, setMpTestResult] = useState<{ success: boolean; message: string; prefId?: string } | null>(null);

  const handleTestMercadoPago = async () => {
    const token = localSettings.mercadoPagoAccessToken || '';
    if (!token.trim()) {
      showToast('Informe o Access Token para testar');
      return;
    }
    setIsTestingMp(true);
    setMpTestResult(null);
    try {
      const res = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: token.trim(),
          items: [{ id: 'test-1', title: 'Teste de Conexão SAGAS', quantity: 1, unit_price: 1.00 }],
          orderNumber: `TEST-${Date.now()}`
        })
      });
      const data = await res.json();
      if (res.ok && data.id) {
        setMpTestResult({
          success: true,
          message: 'Credenciais válidas! Preference criada com sucesso no Mercado Pago.',
          prefId: data.id
        });
        showToast('Mercado Pago conectado com sucesso!');
      } else {
        setMpTestResult({
          success: false,
          message: data.message || data.error || 'Credenciais inválidas ou erro retornado pelo Mercado Pago.'
        });
      }
    } catch (err: any) {
      setMpTestResult({
        success: false,
        message: err.message || 'Erro ao conectar com o servidor.'
      });
    } finally {
      setIsTestingMp(false);
    }
  };

  const handleReloadFromERP = async () => {
    setIsReloading(true);
    try {
      await fetchProductsFromERP();
      showToast('Catálogo recarregado com sucesso do ERP!');
    } catch (err) {
      showToast('Erro ao recarregar catálogo do ERP');
    } finally {
      setIsReloading(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings(localSettings);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    showToast('Comando copiado!');
    setTimeout(() => setCopiedCmd(null), 3000);
  };

  const countInfantil = products.filter(p => p.category === 'infantil').length;
  const countFeminino = products.filter(p => p.category === 'feminino').length;

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6] text-[#171B2B] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#F0ECE6] px-4 py-3 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={closeSubScreen}
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 active:scale-95 transition"
              aria-label="Voltar"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-base font-black text-[#171B2B] flex items-center gap-1.5">
                <Database size={18} className="text-[#FF6B57]" />
                Painel da Loja (MEI)
              </h1>
              <p className="text-[11px] text-gray-500">Gestão de Catálogo, Mercado Pago, Inter e APK</p>
            </div>
          </div>

        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'catalog' ? 'bg-white text-[#171B2B] shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Shirt size={14} className={activeTab === 'catalog' ? 'text-[#FF6B57]' : ''} />
            <span>Peças ({products.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'payments' ? 'bg-white text-[#171B2B] shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <CreditCard size={14} className={activeTab === 'payments' ? 'text-[#FF6B57]' : ''} />
            <span>Mercado Pago & Inter</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'whatsapp' ? 'bg-white text-[#171B2B] shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <MessageCircle size={14} className={activeTab === 'whatsapp' ? 'text-[#25D366]' : ''} />
            <span>WhatsApp da Loja</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('apk')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'apk' ? 'bg-white text-[#171B2B] shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Smartphone size={14} className={activeTab === 'apk' ? 'text-[#FF6B57]' : ''} />
            <span>Guia APK</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="px-4 py-4 max-w-xl mx-auto w-full space-y-4">
        {/* ================= TAB 1: CATALOG ================= */}
        {activeTab === 'catalog' && (
          <>
            {/* Quick Stats & ERP Sync Banner */}
            <section className="bg-gradient-to-br from-[#171B2B] to-[#2D334A] rounded-3xl p-4 text-white shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isSyncedWithErp ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                  <span className={`text-xs font-bold uppercase tracking-wider ${isSyncedWithErp ? 'text-emerald-300' : 'text-amber-300'}`}>
                    {isSyncedWithErp ? 'ERP Sincronizado (localhost:3001)' : 'Modo Offline (Catálogo Local)'}
                  </span>
                </div>
                <span className="text-[11px] text-gray-300">Catálogo Centralizado</span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xs">
                  <span className="text-xl font-black text-white">{products.length}</span>
                  <p className="text-[10px] text-gray-300 uppercase font-semibold">Total Peças</p>
                </div>
                <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xs">
                  <span className="text-xl font-black text-[#FFB0A3]">{countInfantil}</span>
                  <p className="text-[10px] text-gray-300 uppercase font-semibold">Infantil</p>
                </div>
                <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xs">
                  <span className="text-xl font-black text-emerald-300">{countFeminino}</span>
                  <p className="text-[10px] text-gray-300 uppercase font-semibold">Feminino</p>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleReloadFromERP}
                  disabled={isReloading}
                  className="w-full py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-50 active:scale-98"
                >
                  <RefreshCw size={14} className={isReloading ? 'animate-spin' : ''} />
                  <span>{isReloading ? 'Recarregando do ERP...' : 'Recarregar do ERP'}</span>
                </button>
              </div>
            </section>

            {/* Listagem de Peças Cadastradas */}
            <section className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Peças no Catálogo ({products.length})
                </h3>
                <span className="text-[11px] text-gray-400">Tempo real</span>
              </div>

              <div className="space-y-2">
                {products.map(prod => (
                  <div
                    key={prod.id}
                    className="bg-white rounded-2xl p-3 border border-[#F0ECE6] shadow-xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-14 h-16 rounded-xl object-cover bg-gray-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#171B2B] truncate">{prod.name}</span>
                          {prod.badge && (
                            <span className="px-1.5 py-0.5 rounded-full bg-[#FFF0ED] text-[#FF6B57] text-[9px] font-bold shrink-0">
                              {prod.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 capitalize">
                          {prod.category} • {prod.subCategory || 'Geral'}
                        </p>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-xs font-black text-[#FF6B57]">
                            R$ {prod.price.toFixed(2).replace('.', ',')}
                          </span>
                          {prod.originalPrice && prod.originalPrice > prod.price && (
                            <span className="text-[10px] text-gray-400 line-through">
                              R$ {prod.originalPrice.toFixed(2).replace('.', ',')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => deleteProduct(prod.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Excluir peça"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ================= TAB 2: MERCADO PAGO & INTER ================= */}
        {activeTab === 'payments' && (
          <div className="space-y-4 text-xs">
            {/* Comparativo Didático MEI */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-3xl p-4 shadow-md space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center">
                  <Building2 size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Mercado Pago MEI vs Banco Inter PJ</h3>
                  <p className="text-[10px] text-blue-200">Recomendação técnica para o seu negócio</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="p-3 rounded-2xl bg-white/10 border border-white/10 space-y-1">
                  <div className="flex items-center gap-1 font-bold text-emerald-300">
                    <CheckCircle2 size={14} />
                    <span>Mercado Pago (Melhor)</span>
                  </div>
                  <p className="text-gray-300 text-[10px]">
                    Ideal para o app: Aceita <strong>Pix Instantâneo</strong> e <strong>Cartão em 12x</strong> com baixa automática via Webhook sem burocracia de certificados.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-white/10 border border-white/10 space-y-1">
                  <div className="flex items-center gap-1 font-bold text-amber-300">
                    <Building2 size={14} />
                    <span>Banco Inter PJ</span>
                  </div>
                  <p className="text-gray-300 text-[10px]">
                    Conta PJ sem tarifas. Você pode receber os pagamentos no Mercado Pago e <strong>transferir via Pix gratuito</strong> para o Inter!
                  </p>
                </div>
              </div>
            </div>

            {/* Formulário de Configuração de Pagamento */}
            <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-[#F0ECE6] shadow-sm p-4 space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-sm font-black text-[#171B2B]">Configurações de Recebimento Pix</h3>
                <p className="text-[11px] text-gray-500">
                  Estes dados aparecem no QR Code e Copia e Cola do checkout para seus clientes
                </p>
              </div>

              {/* Chave Pix e Tipo */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="font-bold text-gray-700 block mb-1">Tipo de Chave</label>
                  <select
                    value={localSettings.pixKeyType}
                    onChange={(e) => setLocalSettings({ ...localSettings, pixKeyType: e.target.value as any })}
                    className="w-full px-2.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6B57]/30"
                  >
                    <option value="cnpj">CNPJ (MEI)</option>
                    <option value="cpf">CPF</option>
                    <option value="telefone">Celular</option>
                    <option value="email">E-mail</option>
                    <option value="aleatoria">Aleatória</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="font-bold text-gray-700 block mb-1">Chave Pix da Loja</label>
                  <input
                    type="text"
                    value={localSettings.pixKey}
                    onChange={(e) => setLocalSettings({ ...localSettings, pixKey: e.target.value })}
                    placeholder="Ex: 45.123.456/0001-78 ou celular"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#FF6B57]/30"
                  />
                </div>
              </div>

              {/* Banco e Titular */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Banco Receptor</label>
                  <input
                    type="text"
                    value={localSettings.bankName}
                    onChange={(e) => setLocalSettings({ ...localSettings, bankName: e.target.value })}
                    placeholder="Ex: Mercado Pago MEI / Banco Inter"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B57]/30"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Razão Social / Nome Titular</label>
                  <input
                    type="text"
                    value={localSettings.merchantName}
                    onChange={(e) => setLocalSettings({ ...localSettings, merchantName: e.target.value })}
                    placeholder="Ex: SAGAS BRASIL MODA MEI"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B57]/30"
                  />
                </div>
              </div>

              {/* Cidade do Estabelecimento */}
              <div>
                <label className="font-bold text-gray-700 block mb-1">Cidade do Titular</label>
                <input
                  type="text"
                  value={localSettings.merchantCity}
                  onChange={(e) => setLocalSettings({ ...localSettings, merchantCity: e.target.value })}
                  placeholder="Ex: São Paulo"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B57]/30"
                />
              </div>

              {/* Mercado Pago API Keys Section */}
              <div className="pt-3 border-t border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <h4 className="font-black text-xs text-[#171B2B]">Credenciais do Mercado Pago (Opcional)</h4>
                  </div>
                  <a
                    href="https://www.mercadopago.com.br/developers/panel/app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>Pegar Chaves</span>
                    <ExternalLink size={11} />
                  </a>
                </div>

                <div>
                  <label className="font-semibold text-gray-600 block mb-1">
                    Public Key (Chave Pública do Mercado Pago)
                  </label>
                  <input
                    type="text"
                    value={localSettings.mercadoPagoPublicKey || ''}
                    onChange={(e) => setLocalSettings({ ...localSettings, mercadoPagoPublicKey: e.target.value })}
                    placeholder="APP_USR-xxxx-xxxx-xxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-600 block mb-1">
                    Access Token (Chave Secreta do Mercado Pago)
                  </label>
                  <input
                    type="password"
                    value={localSettings.mercadoPagoAccessToken || ''}
                    onChange={(e) => setLocalSettings({ ...localSettings, mercadoPagoAccessToken: e.target.value })}
                    placeholder="APP_USR-xxxx-xxxx-xxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Utilizado para autenticar requisições de baixa automática e estorno.
                  </p>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleTestMercadoPago}
                      disabled={isTestingMp || !localSettings.mercadoPagoAccessToken}
                      className="w-full py-2.5 rounded-xl border border-blue-500 bg-blue-50/50 hover:bg-blue-100/60 text-blue-700 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                      <RefreshCw size={14} className={isTestingMp ? 'animate-spin' : ''} />
                      <span>{isTestingMp ? 'Testando Conexão...' : '⚡ Testar Conexão com Mercado Pago (Criar Preference Teste)'}</span>
                    </button>
                  </div>

                  {mpTestResult && (
                    <div className={`p-3 rounded-2xl border text-xs space-y-1 ${
                      mpTestResult.success 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                      <div className="flex items-center gap-1.5 font-bold">
                        {mpTestResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        <span>{mpTestResult.success ? 'Conexão Aprovada!' : 'Falha na Validação'}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">{mpTestResult.message}</p>
                      {mpTestResult.prefId && (
                        <p className="text-[10px] font-mono text-emerald-700">
                          Preference ID: {mpTestResult.prefId}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#171B2B] hover:bg-black text-white font-bold text-xs shadow-md active:scale-95 transition"
              >
                Salvar Configurações de Pagamento
              </button>
            </form>
          </div>
        )}

        {/* ================= TAB 3: WHATSAPP ================= */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-4 text-xs">
            <div className="bg-white rounded-3xl border border-[#F0ECE6] shadow-sm p-4 space-y-4">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-[#171B2B] flex items-center gap-1.5">
                    <MessageCircle size={18} className="text-[#25D366]" />
                    <span>WhatsApp Oficial de Atendimento</span>
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    O cliente poderá enviar o pedido diretamente no WhatsApp da sua loja com 1 clique!
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Número do WhatsApp da Loja (com DDD):
                  </label>
                  <input
                    type="tel"
                    value={localSettings.whatsappNumber}
                    onChange={(e) => setLocalSettings({ ...localSettings, whatsappNumber: e.target.value })}
                    placeholder="Ex: 5511998765432"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#25D366]/30"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Dica: Digite 55 + DDD + Número sem espaços nem traços.
                  </p>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Nome de Exibição da Loja</label>
                  <input
                    type="text"
                    value={localSettings.storeName}
                    onChange={(e) => setLocalSettings({ ...localSettings, storeName: e.target.value })}
                    placeholder="Sagas Brasil Moda"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B57]/30"
                  />
                </div>

                <div className="p-3 bg-[#EBF7F0] rounded-2xl border border-[#A8D5BA] space-y-2">
                  <span className="font-bold text-[#2E6945] block">
                    💬 Exemplo da Mensagem que o Cliente Envia:
                  </span>
                  <div className="bg-white p-3 rounded-xl text-[11px] text-gray-700 font-sans border border-gray-200/80 leading-relaxed whitespace-pre-wrap shadow-xs">
{`✨ NOVO PEDIDO REALIZADO - ${localSettings.storeName} ✨

📦 Pedido: #SG-84920
💳 Pagamento: Pix Instantâneo (5% OFF)
💰 Valor Total: R$ 139,80

🛍️ Itens Comprados:
   1. Vestido Floral Algodão (Tam: 4 anos | Qtd: 1)
   2. Blusa Tricot Modal Feminina (Tam: M | Qtd: 1)

📍 Endereço de Entrega:
   Av. Paulista, 1500 - São Paulo/SP (CEP: 01310-100)`}
                  </div>

                  <a
                    href={createWhatsAppUrl(
                      localSettings.whatsappNumber,
                      `Olá ${localSettings.storeName}! Esta é uma mensagem de teste enviada a partir do painel da loja.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
                  >
                    <MessageCircle size={15} />
                    <span>Testar Conversa no WhatsApp</span>
                  </a>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-[#171B2B] hover:bg-black text-white font-bold text-xs shadow-md active:scale-95 transition"
                >
                  Salvar Número do WhatsApp
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= TAB 4: GUIA APK ANDROID ================= */}
        {activeTab === 'apk' && (
          <div className="space-y-4 text-xs">
            <div className="bg-gradient-to-r from-orange-500 to-[#FF6B57] text-white rounded-3xl p-5 shadow-md space-y-2">
              <div className="flex items-center gap-2">
                <Smartphone size={24} />
                <h3 className="text-base font-black">Como Gerar o Arquivo .APK Final</h3>
              </div>
              <p className="text-white/90 text-[11px] leading-relaxed">
                O projeto já está 100% configurado com <strong>Capacitor 8</strong> e <strong>Android Nativo</strong>.
                Siga os 4 passos abaixo no terminal do seu computador para gerar o instalador para celular:
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-[#F0ECE6] shadow-sm p-4 space-y-4">
              {/* Passo 1 */}
              <div className="space-y-2 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#171B2B] text-white flex items-center justify-center font-black text-xs">
                    1
                  </span>
                  <span className="font-extrabold text-[#171B2B]">Baixar e Instalar Dependências</span>
                </div>
                <p className="text-[11px] text-gray-600 pl-8">
                  No seu computador, abra o terminal na pasta do projeto e rode:
                </p>
                <div className="ml-8 flex items-center justify-between bg-gray-900 text-emerald-400 p-2.5 rounded-xl font-mono text-[11px]">
                  <span>npm install</span>
                  <button
                    onClick={() => handleCopy('npm install', 'cmd1')}
                    className="text-gray-400 hover:text-white p-1"
                  >
                    {copiedCmd === 'cmd1' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Passo 2 */}
              <div className="space-y-2 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#171B2B] text-white flex items-center justify-center font-black text-xs">
                    2
                  </span>
                  <span className="font-extrabold text-[#171B2B]">Compilar o Frontend & Sincronizar Android</span>
                </div>
                <p className="text-[11px] text-gray-600 pl-8">
                  Gera a pasta <code>dist</code> otimizada e sincroniza com a pasta <code>android/</code>:
                </p>
                <div className="ml-8 flex items-center justify-between bg-gray-900 text-emerald-400 p-2.5 rounded-xl font-mono text-[11px]">
                  <span>npm run build:apk</span>
                  <button
                    onClick={() => handleCopy('npm run build:apk', 'cmd2')}
                    className="text-gray-400 hover:text-white p-1"
                  >
                    {copiedCmd === 'cmd2' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Passo 3 */}
              <div className="space-y-2 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#171B2B] text-white flex items-center justify-center font-black text-xs">
                    3
                  </span>
                  <span className="font-extrabold text-[#171B2B]">Abrir no Android Studio</span>
                </div>
                <p className="text-[11px] text-gray-600 pl-8">
                  Abre automaticamente o projeto no Android Studio:
                </p>
                <div className="ml-8 flex items-center justify-between bg-gray-900 text-emerald-400 p-2.5 rounded-xl font-mono text-[11px]">
                  <span>npx cap open android</span>
                  <button
                    onClick={() => handleCopy('npx cap open android', 'cmd3')}
                    className="text-gray-400 hover:text-white p-1"
                  >
                    {copiedCmd === 'cmd3' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Passo 4 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                    4
                  </span>
                  <span className="font-extrabold text-[#171B2B]">Exportar o .APK no Android Studio</span>
                </div>
                <div className="ml-8 p-3 rounded-2xl bg-[#FAF9F6] border border-gray-200 space-y-1.5 text-[11px] text-gray-700">
                  <p>
                    No menu superior do <strong>Android Studio</strong>, clique em:
                  </p>
                  <p className="font-bold text-[#FF6B57]">
                    Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)
                  </p>
                  <p className="text-gray-500">
                    O Android Studio gerará o arquivo <strong>app-debug.apk</strong> na pasta <code>android/app/build/outputs/apk/debug/</code>. Você pode transferir esse arquivo para qualquer celular Android via WhatsApp, Google Drive ou cabo USB para instalar na hora!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
