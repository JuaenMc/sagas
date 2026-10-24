import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { X, CheckCircle2, Smartphone, Globe, Layers, ArrowRight, Copy, Check, Terminal, HelpCircle } from 'lucide-react';

export const TechStackGuideModal: React.FC = () => {
  const { isTechGuideOpen, setIsTechGuideOpen } = useCart();
  const [activeTab, setActiveTab] = useState<'comparativo' | 'next_capacitor' | 'react_native' | 'passo_a_passo'>('comparativo');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isTechGuideOpen) return null;

  const copyCommand = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-[#171b2b] text-white p-4 sm:p-6 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ff6b57]/20 text-[#ff6b57] text-xs font-bold uppercase tracking-wider mb-2">
              <HelpCircle size={14} />
              Consultoria de Arquitetura Técnica
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Como criar Web + APK para sua Loja?
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm mt-1">
              "Estava pensando em usar Next.js" — Veja as melhores opções para gerar seu site e seu aplicativo Android (.apk).
            </p>
          </div>
          <button
            onClick={() => setIsTechGuideOpen(false)}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Pills */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-4 pt-2 gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('comparativo')}
            className={`py-2 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'comparativo'
                ? 'border-[#ff6b57] text-[#ff6b57] bg-white rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            1. Comparativo Geral
          </button>
          <button
            onClick={() => setActiveTab('next_capacitor')}
            className={`py-2 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'next_capacitor'
                ? 'border-[#ff6b57] text-[#ff6b57] bg-white rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            2. Next.js + Capacitor (APK)
          </button>
          <button
            onClick={() => setActiveTab('react_native')}
            className={`py-2 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'react_native'
                ? 'border-[#ff6b57] text-[#ff6b57] bg-white rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            3. React Native / Expo
          </button>
          <button
            onClick={() => setActiveTab('passo_a_passo')}
            className={`py-2 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'passo_a_passo'
                ? 'border-[#ff6b57] text-[#ff6b57] bg-white rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            4. Gerar APK Passo a Passo
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-[#171b2b]">
          {activeTab === 'comparativo' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <h3 className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-amber-700" />
                  Resposta Direta para sua Dúvida:
                </h3>
                <p className="text-xs sm:text-sm text-amber-800 mt-1 leading-relaxed">
                  <strong>Sim, Next.js é uma excelente escolha para o site Web!</strong> Porém, o Next.js nativamente é um framework web. Para gerar um arquivo <strong>.apk</strong> executável no Android, você pode empacotá-lo com <strong>Capacitor</strong>, ou construir o app móvel em <strong>React Native / Expo</strong> compartilhando o mesmo backend.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Opção A */}
                <div className="p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50/30 flex flex-col justify-between relative">
                  <span className="absolute -top-2.5 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Mais Rápido & Econômico
                  </span>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
                        <Globe size={18} />
                      </div>
                      <h4 className="font-extrabold text-sm text-gray-900">Next.js + Capacitor</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      Você programa <strong>1 única vez</strong> em React/Next.js. O Capacitor encapsula seu e-commerce num APK pronto para Android e iOS.
                    </p>
                    <ul className="text-xs space-y-1.5 text-gray-700">
                      <li className="flex items-center gap-1.5">
                        <Check size={14} className="text-emerald-600 shrink-0" />
                        Aproveita 100% dos componentes e telas
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check size={14} className="text-emerald-600 shrink-0" />
                        Excelente SEO no Google para o site
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check size={14} className="text-emerald-600 shrink-0" />
                        Gera APK funcional em poucos minutos
                      </li>
                    </ul>
                  </div>
                  <div className="mt-3 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs text-emerald-800 font-bold">
                    <span>Recomendado para início</span>
                    <ArrowRight size={14} />
                  </div>
                </div>

                {/* Opção B */}
                <div className="p-4 rounded-2xl border border-gray-200 bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-800">
                        <Smartphone size={18} />
                      </div>
                      <h4 className="font-extrabold text-sm text-gray-900">React Native / Expo</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      Código em componentes nativos de smartphone (Java/Kotlin por baixo). Desempenho máximo para animações pesadas.
                    </p>
                    <ul className="text-xs space-y-1.5 text-gray-700">
                      <li className="flex items-center gap-1.5">
                        <Check size={14} className="text-indigo-600 shrink-0" />
                        Toque e gestos 100% nativos (60-120fps)
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check size={14} className="text-indigo-600 shrink-0" />
                        Build na nuvem com <code>eas build</code>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="text-amber-500 font-bold">•</span>
                        Para web, requer Expo Router ou site separado
                      </li>
                    </ul>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-700 font-bold">
                    <span>Melhor para grandes apps</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>

              {/* Opção PWA */}
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-xs text-gray-800">Bônus: PWA (Progressive Web App)</h5>
                  <p className="text-[11px] text-gray-600">
                    O cliente acessa pelo navegador (Chrome/Safari) e clica em "Instalar App". Fica com ícone na tela inicial sem precisar passar pela aprovação da Google Play!
                  </p>
                </div>
                <span className="shrink-0 bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-md ml-2">
                  Zero Custo
                </span>
              </div>
            </div>
          )}

          {activeTab === 'next_capacitor' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-base text-gray-900">
                Como funciona a combinação Next.js + Capacitor
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                O <strong>Capacitor</strong> é a ferramenta moderna criada pela equipe do Ionic (que substituiu o antigo Cordova). Ele pega sua aplicação React / Next.js e cria uma pasta <code>android/</code> nativa com Gradle, gerando um arquivo <code>.apk</code> de verdade pronto para instalar em qualquer telefone Android.
              </p>

              <div className="bg-gray-900 text-gray-100 p-4 rounded-2xl font-mono text-xs space-y-3">
                <div className="flex items-center justify-between text-gray-400 border-b border-gray-800 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Terminal size={14} /> Arquitetura do Projeto
                  </span>
                  <span className="text-[10px] text-emerald-400">1 Repositório</span>
                </div>
                <div className="text-[11px] space-y-1">
                  <p className="text-emerald-400">/src/ (Telas React, Componentes, Tailwind)</p>
                  <p className="text-blue-300">├── index.html (ou /app em Next.js)</p>
                  <p className="text-amber-300">├── android/ (Gerado pelo Capacitor - Projeto Android Studio)</p>
                  <p className="text-purple-300">└── capacitor.config.ts (Configuração do App ID & Nome)</p>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                <strong>Dica Pro:</strong> Em <code>next.config.js</code>, utilize <code>output: 'export'</code> para gerar HTML/CSS/JS estáticos super leves que o Capacitor injeta instantaneamente no APK offline!
              </div>
            </div>
          )}

          {activeTab === 'react_native' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-base text-gray-900">
                Quando escolher React Native com Expo?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Se o seu objetivo número #1 for o aplicativo móvel na Google Play Store e App Store, o <strong>React Native</strong> com <strong>Expo</strong> entrega a experiência mais fluida do mercado.
              </p>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl border border-gray-200 bg-white">
                  <span className="font-bold text-gray-900">Backend Unificado:</span>
                  <p className="text-gray-600 mt-0.5">
                    Seu site (Next.js) e seu App (React Native) se conectam ao mesmo banco de dados (ex: Firebase, Supabase ou PostgreSQL no Node.js). O carrinho, produtos e compras do cliente sincronizam em tempo real.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-gray-200 bg-white">
                  <span className="font-bold text-gray-900">Notificações Push Reais:</span>
                  <p className="text-gray-600 mt-0.5">
                    Avise o cliente sobre Ofertas Relâmpago e promoções "Combo 3 por 100" diretamente na barra de notificações do celular dele.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'passo_a_passo' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-base text-gray-900">
                Comandos para Gerar seu APK Android Agora
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Você pode converter esta base de código React/Vite/Next em um APK em menos de 5 minutos executando estes 4 comandos no seu computador:
              </p>

              {/* Step 1 */}
              <div className="p-3 rounded-xl border border-gray-200 bg-gray-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-900">1. Instalar o Capacitor</span>
                  <button
                    onClick={() => copyCommand('npm install @capacitor/core @capacitor/cli @capacitor/android', 1)}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#ff6b57] hover:underline"
                  >
                    {copiedIndex === 1 ? <Check size={12} /> : <Copy size={12} />}
                    {copiedIndex === 1 ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                <pre className="bg-gray-900 text-gray-200 p-2.5 rounded-lg text-[11px] overflow-x-auto">
npm install @capacitor/core @capacitor/cli @capacitor/android
                </pre>
              </div>

              {/* Step 2 */}
              <div className="p-3 rounded-xl border border-gray-200 bg-gray-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-900">2. Inicializar o App com seu Nome e ID</span>
                  <button
                    onClick={() => copyCommand('npx cap init "SAGAS Brasil" "com.sagasbrasil.app"', 2)}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#ff6b57] hover:underline"
                  >
                    {copiedIndex === 2 ? <Check size={12} /> : <Copy size={12} />}
                    {copiedIndex === 2 ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                <pre className="bg-gray-900 text-gray-200 p-2.5 rounded-lg text-[11px] overflow-x-auto">
npx cap init "SAGAS Brasil" "com.sagasbrasil.app"
                </pre>
              </div>

              {/* Step 3 */}
              <div className="p-3 rounded-xl border border-gray-200 bg-gray-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-900">3. Adicionar a Plataforma Android</span>
                  <button
                    onClick={() => copyCommand('npx cap add android', 3)}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#ff6b57] hover:underline"
                  >
                    {copiedIndex === 3 ? <Check size={12} /> : <Copy size={12} />}
                    {copiedIndex === 3 ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                <pre className="bg-gray-900 text-gray-200 p-2.5 rounded-lg text-[11px] overflow-x-auto">
npm run build && npx cap add android
                </pre>
              </div>

              {/* Step 4 */}
              <div className="p-3 rounded-xl border border-gray-200 bg-gray-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-900">4. Abrir no Android Studio e Gerar o .apk</span>
                  <button
                    onClick={() => copyCommand('npx cap open android', 4)}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#ff6b57] hover:underline"
                  >
                    {copiedIndex === 4 ? <Check size={12} /> : <Copy size={12} />}
                    {copiedIndex === 4 ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                <pre className="bg-gray-900 text-gray-200 p-2.5 rounded-lg text-[11px] overflow-x-auto">
npx cap open android
                </pre>
                <p className="text-[11px] text-gray-600">
                  No Android Studio basta clicar em <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>. Seu arquivo <code>app-debug.apk</code> estará pronto para enviar pelo WhatsApp ou instalar no seu celular!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium hidden sm:inline">
            Desenvolvido para SAGAS Brasil • E-commerce & App
          </span>
          <button
            onClick={() => setIsTechGuideOpen(false)}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#171b2b] hover:bg-black text-white font-bold text-xs sm:text-sm rounded-full transition-colors"
          >
            Entendido, Explorar Loja
          </button>
        </div>
      </div>
    </div>
  );
};
