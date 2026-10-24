import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { 
  ArrowLeft, HelpCircle, Eye, EyeOff, Sparkles, Check, 
  Lock, Shield, Truck, Tag, Heart, ArrowRight 
} from 'lucide-react';

interface LoginScreenProps {
  onBack?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onBack }) => {
  const { loginWithGoogle, closeSubScreen, showToast, currentUser, firebaseAuthUser, logoutUser } = useCart();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      showToast('Por favor, preencha todos os campos.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showToast(authMode === 'login' ? 'Login realizado com sucesso!' : 'Conta criada com sucesso!');
      if (onBack) onBack();
      else closeSubScreen();
    }, 700);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#FAF9F6] text-[#171B2B] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FAF9F6]/90 backdrop-blur-xl border-b border-[#F0ECE6]/80 px-4 h-16 flex items-center justify-between">
        <button
          onClick={onBack || closeSubScreen}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#171B2B] transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex flex-col items-center">
          <span className="font-extrabold text-lg tracking-wider uppercase text-[#171B2B]">
            SAGAS
          </span>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest -mt-1">
            Brasil
          </span>
        </div>

        <button
          onClick={() => showToast('Suporte SAGAS: atendimento via WhatsApp (11) 99999-9999')}
          className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-[#FF6B57] transition-colors"
          aria-label="Ajuda"
        >
          <HelpCircle size={20} />
        </button>
      </header>

      <div className="px-4 py-4 flex flex-col w-full max-w-md mx-auto">
        {/* If already authenticated with Google */}
        {firebaseAuthUser ? (
          <div className="p-6 bg-white rounded-3xl border border-[#FFE8E2] shadow-sm flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-[#FF6B57] to-[#FFA894] shadow-md">
              <img
                src={firebaseAuthUser.photoURL || currentUser?.photoURL || ''}
                alt="Foto Google"
                className="w-full h-full object-cover rounded-full ring-2 ring-white"
              />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-1">
                Conectado com o Google
              </span>
              <h2 className="text-xl font-extrabold text-[#171B2B]">{firebaseAuthUser.displayName}</h2>
              <p className="text-xs text-gray-500">{firebaseAuthUser.email}</p>
            </div>
            <div className="w-full pt-2 flex flex-col gap-2">
              <button
                onClick={onBack || closeSubScreen}
                className="w-full py-3 rounded-full bg-[#FF6B57] text-white text-xs font-bold shadow-md hover:bg-[#E05340]"
              >
                Continuar Comprando
              </button>
              <button
                onClick={logoutUser}
                className="w-full py-3 rounded-full bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200"
              >
                Sair desta conta Google
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Warm Brazilian Welcome Banner & Identity */}
            <section className="flex flex-col items-center text-center pt-2 pb-3 relative">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EBF7F0] mb-2 shadow-2xs">
                <Sparkles size={14} className="text-[#2E6945]" />
                <span className="text-[11px] text-[#2E6945] font-bold tracking-wide">
                  Moda leve, feita com carinho • Brasil
                </span>
              </div>
              <h1 className="text-2xl font-black text-[#171B2B] tracking-tight">
                {authMode === 'login' ? 'Bem-vinda à SAGAS!' : 'Crie sua Conta'}
              </h1>
              <p className="text-xs text-[#717586] max-w-xs mt-1">
                {authMode === 'login'
                  ? 'Acesse seus pedidos, cupons exclusivos e combos especiais para você e seus pequenos.'
                  : 'Leva menos de 1 minuto para aproveitar descontos e organizar sua sacola.'}
              </p>

              {/* First Purchase Promo Card matching HTML */}
              <div className="w-full mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-[#EBF7F0] via-[#FAF9F6] to-[#FFEBE8] flex items-center justify-between border border-[#A8D5BA]/40 shadow-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs text-[#FF6B57]">
                    <Tag size={18} />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-[#FF6B57] font-bold uppercase tracking-wider">
                        Presente de Boas-Vindas
                      </span>
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF6B57] animate-pulse"></span>
                    </div>
                    <p className="text-xs font-black text-[#171B2B] truncate">
                      R$ 15 OFF na 1ª compra
                    </p>
                    <p className="text-[11px] text-[#717586]">
                      Use o cupom <span className="font-bold text-[#171B2B] bg-white px-1.5 py-0.5 rounded-md border border-gray-200">BEMVINDA</span>
                    </p>
                  </div>
                </div>
                <div className="shrink-0 pl-1 text-[#2E6945]">
                  <Check size={20} />
                </div>
              </div>
            </section>

            {/* Social Fast Access */}
            <section className="flex flex-col gap-2 mt-3">
              {/* Official Google Sign-In Button */}
              <button
                type="button"
                onClick={loginWithGoogle}
                className="w-full h-12 px-4 rounded-full bg-white text-[#171B2B] border border-gray-200 shadow-sm hover:shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer group"
              >
                <svg aria-hidden="true" className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"></path>
                </svg>
                <span className="text-xs sm:text-sm font-bold text-[#171B2B]">
                  Continuar com o Google
                </span>
              </button>

              {/* Secondary Socials */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => showToast('Login com Apple em integração')}
                  className="h-11 px-3 rounded-full bg-white text-[#171B2B] border border-gray-200 shadow-2xs hover:shadow transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  <svg aria-hidden="true" className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 1.01-2.87-.96.04-2.09.65-2.73 1.4-.56.64-.99 1.68-.94 2.71 1.07.08 2.11-.57 2.66-1.24z"></path>
                  </svg>
                  <span className="text-xs font-semibold">Apple</span>
                </button>
                <button
                  type="button"
                  onClick={() => showToast('Login com Facebook em integração')}
                  className="h-11 px-3 rounded-full bg-white text-[#1877F2] border border-gray-200 shadow-2xs hover:shadow transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  <svg aria-hidden="true" className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                  </svg>
                  <span className="text-xs font-semibold text-[#171B2B]">Facebook</span>
                </button>
              </div>
            </section>

            {/* Soft Divider */}
            <div className="relative my-5 flex items-center justify-center">
              <div className="w-full h-px bg-gray-200"></div>
              <span className="absolute px-3 bg-[#FAF9F6] text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                ou use e-mail / celular
              </span>
            </div>

            {/* Segmented Control Tabs */}
            <div className="p-1 rounded-full bg-gray-200/70 flex items-center mb-4">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 rounded-full text-xs font-bold transition-all text-center ${
                  authMode === 'login'
                    ? 'bg-white shadow-sm text-[#171B2B]'
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-2 rounded-full text-xs font-bold transition-all text-center ${
                  authMode === 'register'
                    ? 'bg-white shadow-sm text-[#171B2B]'
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                Criar Conta
              </button>
            </div>

            {/* Dynamic Form Area */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {authMode === 'register' && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#171B2B] pl-1">Nome Completo</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Como quer ser chamada?"
                    className="w-full h-12 px-4 bg-white rounded-xl text-xs text-[#171B2B] placeholder:text-gray-400 shadow-2xs border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B57]"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center pl-1">
                  <label className="text-xs font-bold text-[#171B2B]">E-mail ou Celular</label>
                  <span className="text-[11px] text-gray-400">com DDD</span>
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="mariana@email.com ou (11) 99999-9999"
                  className="w-full h-12 px-4 bg-white rounded-xl text-xs text-[#171B2B] placeholder:text-gray-400 shadow-2xs border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B57]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center pl-1">
                  <label className="text-xs font-bold text-[#171B2B]">Sua Senha</label>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => showToast('Instruções de redefinição enviadas para seu e-mail')}
                      className="text-[11px] font-bold text-[#FF6B57] hover:underline"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 pl-4 pr-11 bg-white rounded-xl text-xs text-[#171B2B] placeholder:text-gray-400 shadow-2xs border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B57]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-gray-400 hover:text-black p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FF6B57] focus:ring-[#FF6B57] accent-[#FF6B57]"
                />
                <span className="text-xs text-[#171B2B]">
                  {authMode === 'login'
                    ? 'Lembrar meu acesso neste aparelho'
                    : 'Concordo em receber novidades e cupons pelo WhatsApp'}
                </span>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 mt-2 rounded-full bg-[#FF6B57] hover:bg-[#E05340] text-white font-bold text-xs sm:text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>{authMode === 'login' ? 'Entrar na Minha Conta' : 'Criar Minha Conta Grátis'}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            {/* Switch Mode Prompt */}
            <div className="mt-4 p-4 rounded-2xl bg-[#f3f2ff]/60 border border-[#dee1f8] flex flex-col items-center text-center">
              <p className="text-xs text-[#171B2B]">
                {authMode === 'login' ? 'Ainda não tem uma conta?' : 'Já possui cadastro na SAGAS?'}
              </p>
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="mt-0.5 text-xs font-bold text-[#FF6B57] hover:underline"
              >
                {authMode === 'login'
                  ? 'Cadastre-se grátis em menos de 1 minuto'
                  : 'Entrar na conta existente'}
              </button>
            </div>

            {/* Benefits of Having a SAGAS Account */}
            <section className="mt-6">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold text-center mb-2">
                Vantagens exclusivas para clientes SAGAS
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-[#F0ECE6] shadow-2xs">
                  <div className="w-8 h-8 rounded-full bg-[#EBF7F0] flex items-center justify-center text-[#2E6945] shrink-0">
                    <Truck size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#171B2B]">Rastreio em Tempo Real</h4>
                    <p className="text-[11px] text-gray-500">Notificações diretas de cada etapa da entrega</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-[#F0ECE6] shadow-2xs">
                  <div className="w-8 h-8 rounded-full bg-[#FFF3E0] flex items-center justify-center text-[#8E4E14] shrink-0">
                    <Tag size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#171B2B]">Cupons VIP e Cashback</h4>
                    <p className="text-[11px] text-gray-500">Acumule créditos em todas as compras do mês</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-[#F0ECE6] shadow-2xs">
                  <div className="w-8 h-8 rounded-full bg-[#FFEBE8] flex items-center justify-center text-[#FF6B57] shrink-0">
                    <Heart size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#171B2B]">Lista de Favoritos Integrada</h4>
                    <p className="text-[11px] text-gray-500">Seus looks femininos e infantis salvos em qualquer lugar</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Trust Footer */}
            <footer className="mt-6 flex flex-col items-center text-center gap-1">
              <div className="inline-flex items-center gap-1.5 text-[#3D6751]">
                <Lock size={14} />
                <span className="text-[11px] font-bold">Ambiente 100% seguro com criptografia de ponta</span>
              </div>
              <p className="text-[11px] text-gray-400">
                SAGAS Brasil • Termos de Uso e Privacidade protegidos
              </p>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};
