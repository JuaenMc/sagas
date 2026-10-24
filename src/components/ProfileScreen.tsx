import React from 'react';
import { useCart } from '../context/CartContext';
import { 
  Bell, Settings, ShoppingBag, CreditCard, MapPin, 
  Tag, BadgeCheck, Ruler, ArrowRight, ChevronRight, 
  MessageCircle, RotateCcw, LogOut, Check, Star, 
  Truck, PackageCheck, HelpCircle, User, LogIn, Camera,
  Database, Sparkles
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const { 
    currentUser, 
    firebaseAuthUser, 
    loginWithGoogle, 
    logoutUser, 
    openSubScreen, 
    setCurrentTab, 
    showToast,
    addresses,
    selectedAddress,
    products
  } = useCart();

  const handleLogout = () => {
    if (confirm('Deseja realmente sair da sua conta SAGAS?')) {
      logoutUser();
    }
  };

  return (
    <div className="flex flex-col w-full pb-28 text-[#171B2B] bg-[#FAF9F6] min-h-screen">
      {/* Top Header matching HTML */}
      <header className="sticky top-0 z-40 bg-[#FAF9F6]/90 backdrop-blur-xl border-b border-[#F0ECE6]/80 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FF6B57]/10 flex items-center justify-center text-[#FF6B57]">
            <ShoppingBag size={20} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold text-lg tracking-tight text-[#171B2B]">SAGAS</span>
            <span className="text-[#D0C7BD] font-normal">|</span>
            <h1 className="text-sm font-bold text-[#59413D] tracking-tight">Meu Perfil</h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => showToast('Nenhuma notificação nova no momento')}
            className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-[#59413D] shadow-2xs transition-all active:scale-95"
            aria-label="Notificações"
          >
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#FF6B57]"></span>
          </button>
          <button
            onClick={() => showToast('Configurações de conta e privacidade')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-[#59413D] shadow-2xs transition-all active:scale-95"
            aria-label="Configurações"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      <div className="px-4 pt-3 pb-6 flex flex-col w-full max-w-md mx-auto space-y-4">
        {/* Profile Header Hero Card */}
        <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-b from-[#FFF5F2] via-white to-white p-5 border border-[#FFE8E2] shadow-[0_8px_24px_rgba(255,107,87,0.06)]">
          <div className="absolute -top-12 -right-10 w-44 h-44 rounded-full bg-[#FF6B57]/10 blur-2xl pointer-events-none"></div>
          <div className="absolute top-28 -left-10 w-36 h-36 rounded-full bg-[#3D6751]/10 blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Avatar with warm ring & camera/edit badge */}
            <div className="relative mb-3 group">
              <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#FF6B57] to-[#FFA894] shadow-md">
                <img
                  src={currentUser?.photoURL || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtBSCQ0jeRxwpJK2D3r5onszcle4HSKoBa8fk7z3GRmjCbiZSHqDJ1Ayhy3xQNJNrtlKkP8CjMx2NvtmxhtB284p3W0XG4deqP8Tfx13PPFr1DyEt4OtGCeZ0FV1X4RC7OntpZNbMMqZbJ41G1XZj0yxUgLToawzdNbVjqxN-sm1cVWlOo6u-R60m7KsndBo0JZ5hDRY8Dni-HNH8OEni0u1Y5oEjiZjJsDQd1rySGuVNR9hFmf3ho8g'}
                  alt={currentUser?.displayName || 'Mariana Siqueira'}
                  className="w-full h-full object-cover rounded-full ring-2 ring-white"
                />
              </div>
              <button
                type="button"
                onClick={() => openSubScreen('login')}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#FF6B57] text-white flex items-center justify-center shadow-md border-2 border-white active:scale-90 transition-transform"
                title="Trocar conta ou foto"
              >
                <Camera size={16} />
              </button>
            </div>

            {/* Name & Subtitle */}
            <div className="flex items-center gap-1.5">
              <h2 className="text-xl font-black text-[#171B2B] tracking-tight">
                {currentUser?.displayName || 'Mariana Siqueira'}
              </h2>
              <span className="w-4 h-4 rounded-full bg-[#3D6751] text-white flex items-center justify-center text-[10px]">
                ✓
              </span>
            </div>
            <p className="text-xs text-[#7A625D] mt-0.5">{currentUser?.email || 'mariana.siqueira@email.com'}</p>

            {/* Account Status Badge */}
            {firebaseAuthUser ? (
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"></path>
                </svg>
                <span>Conta Google Conectada</span>
                <Check size={12} className="text-emerald-600" />
              </div>
            ) : (
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF7F0] border border-[#A8D5BA]/60 text-[#2E6945] text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2E6945]"></span>
                <span>Conta Ativa • SAGAS Club</span>
              </div>
            )}

            {/* VIP Gold Loyalty Pill */}
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#FFF3E0] to-[#FFE0B2] border border-[#FFD599] text-[#8E4E14] shadow-2xs">
              <Star size={14} className="fill-[#D6894A] text-[#D6894A]" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Cliente VIP Ouro</span>
            </div>

            {/* Quick Counters Grid */}
            <div className="w-full grid grid-cols-4 gap-2 mt-4 pt-3.5 border-t border-[#F5EBE6]">
              <div
                onClick={() => openSubScreen('orders')}
                className="cursor-pointer flex flex-col items-center text-center p-2 rounded-2xl bg-white border border-[#F3EAE5] shadow-2xs hover:border-[#FF6B57]/40 transition active:scale-95"
                title="Ver Meus Pedidos"
              >
                <span className="text-base font-extrabold text-[#171B2B]">4</span>
                <span className="text-[11px] text-[#7A625D] leading-tight mt-0.5">Pedidos</span>
              </div>
              <div
                onClick={() => showToast('Seu saldo de Cashback é R$ 45,00 para próximas compras')}
                className="cursor-pointer flex flex-col items-center text-center p-2 rounded-2xl bg-[#FFF8F6] border border-[#FFD9D0] shadow-2xs hover:border-[#FF6B57] transition active:scale-95"
              >
                <div className="flex items-baseline text-[#FF6B57]">
                  <span className="text-[10px] font-bold mr-0.5">R$</span>
                  <span className="text-base font-extrabold">45</span>
                </div>
                <span className="text-[11px] text-[#AE3123] font-semibold leading-tight mt-0.5">Cashback</span>
              </div>
              <div
                onClick={() => setCurrentTab('favoritos')}
                className="cursor-pointer flex flex-col items-center text-center p-2 rounded-2xl bg-white border border-[#F3EAE5] shadow-2xs hover:border-[#FF6B57]/40 transition active:scale-95"
              >
                <span className="text-base font-extrabold text-[#171B2B]">5</span>
                <span className="text-[11px] text-[#7A625D] leading-tight mt-0.5">Favoritos</span>
              </div>
              <div
                onClick={() => showToast('Cupons válidos: BEMVINDA10 e VERAO2025')}
                className="cursor-pointer flex flex-col items-center text-center p-2 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] shadow-2xs hover:border-[#3D6751] transition active:scale-95"
              >
                <span className="text-base font-extrabold text-[#3D6751]">2</span>
                <span className="text-[11px] text-[#254F3A] font-semibold leading-tight mt-0.5">Cupons</span>
              </div>
            </div>
          </div>
        </section>

        {/* Order Status & Live Tracking Banner Card */}
        <section className="bg-white rounded-[22px] p-4 border border-[#F0ECE6] shadow-[0_6px_20px_rgba(23,27,43,0.03)] flex flex-col gap-3.5">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-[#F0FDF4] via-[#F8FAF9] to-white border border-[#DCFCE7]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-[#3D6751] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Truck size={22} />
              </div>
              <div className="flex flex-col min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#171B2B] truncate">Pedido #SG-84920</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#254F3A] text-[10px] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3D6751] animate-pulse"></span>
                    A Caminho
                  </span>
                </div>
                <p className="text-[11px] text-[#3D6751] font-semibold truncate mt-0.5">
                  Em transporte • Chega amanhã, 14:00
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openSubScreen('orders')}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#59413D] shadow-2xs border border-gray-200 hover:bg-gray-50 active:scale-95 transition"
              title="Ver detalhes do pedido"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Mini Progress Steps Bar */}
          <div className="w-full px-1">
            <div className="flex items-center justify-between relative mb-2">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 w-full z-0 rounded-full"></div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#3D6751] w-3/4 z-0 rounded-full"></div>
              <div className="w-5 h-5 rounded-full bg-[#3D6751] text-white flex items-center justify-center z-10 text-[10px] shadow-2xs">✓</div>
              <div className="w-5 h-5 rounded-full bg-[#3D6751] text-white flex items-center justify-center z-10 text-[10px] shadow-2xs">✓</div>
              <div className="w-6 h-6 rounded-full bg-[#3D6751] text-white ring-4 ring-[#DCFCE7] flex items-center justify-center z-10 text-[11px] shadow-sm">
                <Truck size={13} />
              </div>
              <div className="w-5 h-5 rounded-full bg-white border-2 border-gray-300 z-10"></div>
            </div>
          </div>

          {/* 4-Step Quick Access */}
          <div className="grid grid-cols-4 gap-1.5 pt-1 text-center border-t border-[#F5EFEA]">
            <button
              type="button"
              onClick={() => openSubScreen('orders')}
              className="flex flex-col items-center p-2 rounded-xl hover:bg-[#FAF9F6] transition-colors"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#F6F4EE] flex items-center justify-center text-[#7A625D] mb-1">
                <CreditCard size={18} />
              </div>
              <span className="text-[10px] text-[#59413D] font-medium leading-tight">Aguardando</span>
            </button>
            <button
              type="button"
              onClick={() => openSubScreen('orders')}
              className="flex flex-col items-center p-2 rounded-xl hover:bg-[#FAF9F6] transition-colors"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#F6F4EE] flex items-center justify-center text-[#7A625D] mb-1">
                <PackageCheck size={18} />
              </div>
              <span className="text-[10px] text-[#59413D] font-medium leading-tight">Separação</span>
            </button>
            <button
              type="button"
              onClick={() => openSubScreen('orders')}
              className="flex flex-col items-center p-2 rounded-xl bg-[#FFF5F2] border border-[#FFE2DC] transition-colors relative shadow-2xs"
            >
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF6B57] text-white text-[9px] flex items-center justify-center font-bold">1</span>
              <div className="w-10 h-10 rounded-2xl bg-[#FF6B57] text-white flex items-center justify-center mb-1 shadow-2xs">
                <Truck size={18} />
              </div>
              <span className="text-[10px] text-[#AE3123] font-bold leading-tight">A Caminho</span>
            </button>
            <button
              type="button"
              onClick={() => openSubScreen('orders')}
              className="flex flex-col items-center p-2 rounded-xl hover:bg-[#FAF9F6] transition-colors"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#F6F4EE] flex items-center justify-center text-[#7A625D] mb-1">
                <Star size={18} />
              </div>
              <span className="text-[10px] text-[#59413D] font-medium leading-tight">Avaliar</span>
            </button>
          </div>
        </section>

        {/* Group 1: Gestão de Compras & Finanças */}
        <div className="flex flex-col gap-1.5">
          <span className="px-1 text-[11px] font-bold uppercase tracking-wider text-[#8D716C]">
            Compras & Finanças
          </span>
          <div className="bg-white rounded-[22px] overflow-hidden border border-[#F0ECE6] shadow-[0_4px_16px_rgba(23,27,43,0.02)] divide-y divide-[#F5EFEA]">
            <button
              type="button"
              onClick={() => openSubScreen('orders')}
              className="w-full flex items-center justify-between p-3.5 hover:bg-[#FAF9F6] transition-colors group text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#FFF0ED] text-[#FF6B57] flex items-center justify-center shrink-0">
                  <ShoppingBag size={20} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#171B2B]">Meus Pedidos</span>
                  <span className="text-[11px] text-[#7A625D]">Histórico completo, notas fiscais e rastreios</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 group-hover:text-[#FF6B57] transition-colors" />
            </button>

            <button
              type="button"
              onClick={() => openSubScreen('add-card')}
              className="w-full flex items-center justify-between p-3.5 hover:bg-[#FAF9F6] transition-colors group text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] text-[#3D6751] flex items-center justify-center shrink-0">
                  <CreditCard size={20} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#171B2B]">Formas de Pagamento</span>
                  <span className="text-[11px] text-[#7A625D]">Cartão 3D, Chave Pix, Carteira SAGAS</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 group-hover:text-[#3D6751] transition-colors" />
            </button>

            <button
              type="button"
              onClick={() => openSubScreen('addresses')}
              className="w-full flex items-center justify-between p-3.5 hover:bg-[#FAF9F6] transition-colors group text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#FFF8E1] text-[#8E4E14] flex items-center justify-center shrink-0">
                  <MapPin size={20} />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#171B2B]">Meus Endereços</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#EBF7F0] text-[#2E6945] text-[9px] font-bold">
                      {addresses.length} {addresses.length === 1 ? 'salvo' : 'salvos'}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#7A625D] truncate">
                    {selectedAddress 
                      ? `${selectedAddress.label}: ${selectedAddress.street}, ${selectedAddress.number}`
                      : 'Gerenciar endereços com ViaCEP'}
                  </span>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 group-hover:text-[#8E4E14] transition-colors" />
            </button>

            <button
              type="button"
              onClick={() => openSubScreen('admin-catalog')}
              className="w-full flex items-center justify-between p-3.5 hover:bg-[#FAF9F6] transition-colors group text-left bg-gradient-to-r from-orange-50/40 to-transparent"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#171B2B] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Database size={18} />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-[#171B2B]">Painel da Loja (Firestore)</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-[#FF6B57] text-white text-[9px] font-extrabold">
                      {products.length} peças
                    </span>
                  </div>
                  <span className="text-[11px] text-[#7A625D]">Cadastrar novas peças e gerenciar catálogo</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 group-hover:text-[#FF6B57] transition-colors" />
            </button>

            <button
              type="button"
              onClick={() => showToast('Cupons ativos: BEMVINDA10 (-R$ 14,98) e VERAO2025')}
              className="w-full flex items-center justify-between p-3.5 hover:bg-[#FAF9F6] transition-colors group text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#FFF0ED] text-[#FF6B57] flex items-center justify-center shrink-0">
                  <Tag size={20} />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#171B2B]">Meus Cupons & Vales</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#FFE8E2] text-[#AE3123] text-[9px] font-bold">2 ativos</span>
                  </div>
                  <span className="text-[11px] text-[#7A625D]">2 cupons válidos para suas próximas compras</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 group-hover:text-[#FF6B57] transition-colors" />
            </button>
          </div>
        </div>

        {/* Group 2: Conta & Preferências */}
        <div className="flex flex-col gap-1.5">
          <span className="px-1 text-[11px] font-bold uppercase tracking-wider text-[#8D716C]">
            Conta & Preferências
          </span>
          <div className="bg-white rounded-[22px] overflow-hidden border border-[#F0ECE6] shadow-[0_4px_16px_rgba(23,27,43,0.02)] divide-y divide-[#F5EFEA]">
            <button
              type="button"
              onClick={() => openSubScreen('login')}
              className="w-full flex items-center justify-between p-3.5 hover:bg-[#FAF9F6] transition-colors group text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#F0F4F8] text-[#3A4B59] flex items-center justify-center shrink-0">
                  <User size={20} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#171B2B]">Dados Pessoais & Autenticação</span>
                  <span className="text-[11px] text-[#7A625D]">Conta Google, e-mail, telefone e senha</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 transition-colors" />
            </button>

            <button
              type="button"
              onClick={() => showToast('Medidas salvas: Menina (5 anos, Tam M) e Mãe (Tam M)')}
              className="w-full flex items-center justify-between p-3.5 hover:bg-[#FAF9F6] transition-colors group text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] text-[#3D6751] flex items-center justify-center shrink-0">
                  <Ruler size={20} />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#171B2B]">Tamanhos & Medidas</span>
                    <span className="px-2 py-0.5 rounded bg-[#E8F5E9] text-[#254F3A] text-[9px] font-bold">Mãe & Filhos</span>
                  </div>
                  <span className="text-[11px] text-[#7A625D]">Recomendações inteligentes no provador virtual</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 transition-colors" />
            </button>
          </div>
        </div>

        {/* Group 3: Atendimento & Suporte */}
        <div className="flex flex-col gap-1.5">
          <span className="px-1 text-[11px] font-bold uppercase tracking-wider text-[#8D716C]">
            Atendimento & Suporte
          </span>
          <div className="bg-white rounded-[22px] overflow-hidden border border-[#F0ECE6] shadow-[0_4px_16px_rgba(23,27,43,0.02)] divide-y divide-[#F5EFEA]">
            <button
              type="button"
              onClick={() => showToast('WhatsApp de Suporte: (11) 99999-9999')}
              className="w-full flex items-center justify-between p-3.5 hover:bg-[#FAF9F6] transition-colors group text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] text-[#3D6751] flex items-center justify-center shrink-0">
                  <MessageCircle size={20} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#171B2B]">Central de Ajuda & Chat</span>
                  <span className="text-[11px] text-[#7A625D]">Fale pelo WhatsApp ou veja perguntas frequentes</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 transition-colors" />
            </button>

            <button
              type="button"
              onClick={() => showToast('1ª troca é 100% grátis com código reverso dos Correios')}
              className="w-full flex items-center justify-between p-3.5 hover:bg-[#FAF9F6] transition-colors group text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#FFF0ED] text-[#FF6B57] flex items-center justify-center shrink-0">
                  <RotateCcw size={20} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#171B2B]">Política de Troca & Devolução</span>
                  <span className="text-[11px] text-[#7A625D]">1ª troca grátis sem complicação em até 30 dias</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 transition-colors" />
            </button>
          </div>
        </div>

        {/* Logout / Switch Account Button */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-white border border-[#FFD9D0] text-[#AE3123] shadow-2xs hover:bg-[#FFF0ED] active:scale-[0.98] transition-all font-bold text-xs"
          >
            <LogOut size={16} />
            <span>Sair da Conta SAGAS</span>
          </button>

          <div className="flex flex-col items-center text-center pt-1 text-[11px] text-[#7A625D]">
            <p>SAGAS App v2.4.1 • Feito com carinho no Brasil</p>
            <div className="flex items-center gap-2 text-gray-400 mt-0.5">
              <span>Termos de Uso</span>
              <span>•</span>
              <span>Privacidade</span>
              <span>•</span>
              <span>Sobre a SAGAS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
