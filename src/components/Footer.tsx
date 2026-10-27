import React from 'react';
import { useCart } from '../context/CartContext';
import { ShieldCheck, Truck, RotateCcw, CreditCard, MessageCircle, Heart, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentTab, openSubScreen, storeSettings } = useCart();

  return (
    <footer className="w-full bg-[#171B2B] text-white pt-12 pb-24 md:pb-12 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Trust Badges Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-10 border-b border-gray-800 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#FF6B57] shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <h4 className="font-bold text-white">Frete Grátis Brasil</h4>
              <p className="text-gray-400 text-[11px]">Nas compras acima de R$ 149</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#BFEDD1] shrink-0">
              <RotateCcw size={20} />
            </div>
            <div>
              <h4 className="font-bold text-white">Troca Fácil em 30 Dias</h4>
              <p className="text-gray-400 text-[11px]">Primeira troca grátis sem complicação</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 shrink-0">
              <CreditCard size={20} />
            </div>
            <div>
              <h4 className="font-bold text-white">Até 6x Sem Juros</h4>
              <p className="text-gray-400 text-[11px]">Ou 5% de desconto no Pix</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="font-bold text-white">Compra 100% Segura</h4>
              <p className="text-gray-400 text-[11px]">Criptografia SSL de ponta a ponta</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 text-xs">
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-xl font-black text-[#FF6B57]">SAGAS</span>
              <span className="text-[9px] font-bold bg-[#BFEDD1] text-[#254F3A] px-1.5 py-0.5 rounded-full uppercase">
                Brasil
              </span>
            </div>
            <p className="text-gray-400 text-[11px] leading-relaxed mb-4">
              Moda Feminina e Infantil de alta qualidade, conforto e sofisticação com preços direto de fábrica.
            </p>
            <div className="flex items-center gap-2 text-gray-400 text-[11px]">
              <Lock size={13} className="text-emerald-400" />
              <span>Ambiente Seguro com Proteção de Dados</span>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              Categorias
            </h5>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button onClick={() => setCurrentTab('categorias')} className="hover:text-white transition">
                  Moda Feminina
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('categorias')} className="hover:text-white transition">
                  Moda Infantil
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('categorias')} className="hover:text-white transition">
                  Vestidos e Conjuntos
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('categorias')} className="hover:text-white transition">
                  Combo 3 por R$ 100
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('categorias')} className="hover:text-white transition">
                  Outlet & Promoções
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              Atendimento ao Cliente
            </h5>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button onClick={() => openSubScreen('orders')} className="hover:text-white transition">
                  Rastrear Meus Pedidos
                </button>
              </li>
              <li>
                <button onClick={() => openSubScreen('addresses')} className="hover:text-white transition">
                  Meus Endereços
                </button>
              </li>
              <li>
                <a 
                  href={`https://wa.me/${storeSettings?.whatsappNumber || '556791188356'}?text=Ol%C3%A1%2C%20gostaria%20de%20tirar%20uma%20d%C3%BAvida%20sobre%20meu%20pedido%20na%20SAGAS`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center gap-1.5 text-emerald-400 font-semibold"
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp: (67) 9118-8356</span>
                </a>
              </li>
              <li className="text-[11px] text-gray-500">
                Segunda a Sexta: 08:00 às 18:00
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              Formas de Pagamento
            </h5>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2.5 py-1 rounded bg-white/10 text-[10px] font-bold text-gray-200">
                Pix (5% OFF)
              </span>
              <span className="px-2.5 py-1 rounded bg-white/10 text-[10px] font-bold text-gray-200">
                Cartão de Crédito
              </span>
              <span className="px-2.5 py-1 rounded bg-white/10 text-[10px] font-bold text-gray-200">
                Boleto Bancário
              </span>
            </div>
            <p className="text-[10px] text-gray-500">
              Processamento seguro via Mercado Pago & Banco Inter.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-500 text-center sm:text-left">
          <p>© 2026 SAGAS Brasil Confecções Ltda. Todos os direitos reservados.</p>
          <p>CNPJ: 69.249.479/0001-09 • São Paulo - SP</p>
        </div>

      </div>
    </footer>
  );
};
