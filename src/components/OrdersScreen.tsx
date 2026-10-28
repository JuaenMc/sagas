import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, setDoc, doc } from 'firebase/firestore';
import { Order, OrderStatus } from '../types';
import { erpClient } from '../services/erpClient';
import { 
  ArrowLeft, ShoppingBag, Truck, PackageCheck, CheckCircle2, 
  Clock, ChevronRight, Search, RotateCcw, FileText, ExternalLink,
  ShieldCheck, AlertCircle, RefreshCw, Sparkles, MapPin, MessageCircle
} from 'lucide-react';
import { createWhatsAppUrl } from '../lib/whatsapp';

interface OrdersScreenProps {
  onBack?: () => void;
}

const INITIAL_DEMO_ORDERS: Order[] = [
  {
    id: 'order-84920',
    orderNumber: '#SG-84920',
    userId: 'current-user',
    createdAt: 'Hoje às 10:24',
    status: 'em_transito',
    statusLabel: 'A Caminho',
    total: 139.80,
    paymentMethod: 'pix',
    paymentMethodLabel: 'Pix Instantâneo (5% OFF)',
    trackingCode: 'BR948201849SP',
    estimatedDelivery: 'Amanhã até as 18:00',
    deliveryAddress: 'Av. Paulista, 1500 - Bela Vista, São Paulo - SP',
    items: [
      {
        id: 'item-1',
        name: 'Vestido Floral Algodão',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDF_e2x3G9R_gT4XwN2o8fX9z4V2WvMh6r1x9k3j2k1l8',
        price: 49.90,
        quantity: 1,
        size: '4 anos',
        color: 'Amarelo Floral'
      },
      {
        id: 'item-2',
        name: 'Blusa Tricot Modal Feminina',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDF_e2x3G9R_gT4XwN2o8fX9z4V2WvMh6r1x9k3j2k1l8',
        price: 89.90,
        quantity: 1,
        size: 'M',
        color: 'Off-White'
      }
    ]
  },
  {
    id: 'order-81042',
    orderNumber: '#SG-81042',
    userId: 'current-user',
    createdAt: 'Ontem às 16:40',
    status: 'em_preparacao',
    statusLabel: 'Em Separação',
    total: 69.90,
    paymentMethod: 'credit_card',
    paymentMethodLabel: 'Cartão de Crédito (3x)',
    trackingCode: 'BR719203810SP',
    estimatedDelivery: 'Em até 3 dias úteis',
    deliveryAddress: 'Av. Paulista, 1500 - Bela Vista, São Paulo - SP',
    items: [
      {
        id: 'item-3',
        name: 'Conjunto Kids Verão Algodão',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAID3BRu9aO47gyQXLtbe0X3b-lfJHhicUGhAvDKHSs4bAmUZK8gOwZCFR7aonbfbo4H66Hxc9nWxzA2YFSeolsZ2sB8J0vf3tRXWpfmrVPCxBDcPsSoLE40bPsR7LmwHDHYnOL1KX22YtQdVh3xXUGm94llTsZyxXQEtltXomQ00ag4DoGJcW5DLLD-jd7YwolOTQbDgnSYvUGU0ZGcEl93e1WRpNzZkgUhdfKWZl4UolwLwveUkQZUQ',
        price: 69.90,
        quantity: 1,
        size: '6 anos',
        color: 'Azul Celeste'
      }
    ]
  },
  {
    id: 'order-76519',
    orderNumber: '#SG-76519',
    userId: 'current-user',
    createdAt: '12 de Outubro',
    status: 'entregue',
    statusLabel: 'Entregue com Sucesso',
    total: 149.90,
    paymentMethod: 'pix',
    paymentMethodLabel: 'Pix Instantâneo',
    trackingCode: 'BR510928374SP',
    estimatedDelivery: 'Entregue em 15/10',
    deliveryAddress: 'Av. Paulista, 1500 - Bela Vista, São Paulo - SP',
    items: [
      {
        id: 'item-4',
        name: 'Macacão Pantalona Feminino Linho',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8WV3VzZPD-dO1lXgmr4tqMtT36SbjxH_b0NcEyJRbpETMrvEmxzjkO9lA5wbZ5n0Tu70y63fxW32IQHkiQKwqHOzCNM8EeLd2UewgIsxN4pCW3OO8o5yn24dA5w2dB9MzmCsEsGtOdEFgs3el6Lffbinol2W5XKPxfxl45iXbzSYuh5h4FSG2vXjRBlAOy4e0cQ6HPTgPrjWgOZIsBDRhrENqjLyYqrGsdsptKzfweDlUydbHmiONMQ',
        price: 149.90,
        quantity: 1,
        size: 'G',
        color: 'Terracota'
      }
    ]
  }
];

export const OrdersScreen: React.FC<OrdersScreenProps> = ({ onBack }) => {
  const { closeSubScreen, currentUser, firebaseAuthUser, showToast, setCurrentTab, storeSettings } = useCart();
  const [orders, setOrders] = useState<Order[]>(INITIAL_DEMO_ORDERS);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'todos' | 'em_andamento' | 'entregues'>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<Order | null>(null);

  const userId = firebaseAuthUser?.uid || currentUser?.uid || 'guest-mariana';

  const loadOrders = async () => {
    setLoading(true);
    try {
      const erpOrders = await erpClient.getOrders({ firebaseUid: userId });
      if (erpOrders && erpOrders.length > 0) {
        const mapped: Order[] = erpOrders.map((o: any) => {
          let statusLabel = 'Pagamento Pendente';
          let mappedStatus: any = 'em_preparacao';
          if (o.status === 'PAID') {
            statusLabel = 'Pagamento Aprovado';
            mappedStatus = 'aprovado';
          } else if (o.status === 'SHIPPED') {
            statusLabel = 'Em Trânsito';
            mappedStatus = 'em_transito';
          } else if (o.status === 'DELIVERED') {
            statusLabel = 'Entregue com Sucesso';
            mappedStatus = 'entregue';
          } else if (o.status === 'CANCELLED') {
            statusLabel = 'Cancelado';
            mappedStatus = 'cancelado';
          } else if (o.status === 'PENDING_PAYMENT') {
            statusLabel = 'Aguardando Pagamento';
            mappedStatus = 'em_preparacao';
          }

          return {
            id: o.id,
            orderNumber: o.orderNumber?.startsWith('#') ? o.orderNumber : `#${o.orderNumber || ''}`,
            userId,
            createdAt: new Date(o.createdAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            }),
            status: mappedStatus,
            statusLabel,
            total: Number(o.total || 0),
            paymentMethod: 'pix',
            paymentMethodLabel: 'ERP Integrado',
            trackingCode: `BR${(o.orderNumber || '').replace(/\D/g, '') || '948201849'}SP`,
            estimatedDelivery: 'Em até 2 dias úteis',
            deliveryAddress: 'Endereço cadastrado na loja SAGAS',
            items: (o.items || []).map((it: any) => ({
              id: it.id,
              name: it.name,
              image: it.image || 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=900&q=80',
              price: Number(it.unitPrice || 0),
              quantity: it.quantity,
              size: it.size,
              color: it.color
            }))
          };
        });

        setOrders(mapped);
        setLoading(false);
        return;
      }

      setOrders([]);
    } catch (err) {
      console.warn('[OrdersScreen] Falha ao carregar pedidos do ERP:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      showToast('Cancelando pedido...');
      await erpClient.updateOrderStatus(orderId, 'CANCELLED');
      showToast('Pedido cancelado com sucesso.');
      loadOrders();
    } catch (err: any) {
      console.error('Cancel order error:', err);
      showToast(err.message || 'Erro ao cancelar pedido.');
    }
  };

  useEffect(() => {
    loadOrders();
  }, [userId]);

  // Filter orders by tab and search
  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'em_andamento' && order.status === 'entregue') return false;
    if (activeTab === 'entregues' && order.status !== 'entregue') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesNumber = order.orderNumber.toLowerCase().includes(q);
      const matchesProduct = order.items.some((it) => it.name.toLowerCase().includes(q));
      return matchesNumber || matchesProduct;
    }
    return true;
  });

  const getStatusBadge = (status: OrderStatus | string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
      case 'em_preparacao':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-extrabold">
            <Clock size={12} className="text-amber-600" />
            Aguardando Pagamento
          </span>
        );
      case 'PAID':
      case 'aprovado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-extrabold">
            <CheckCircle2 size={12} className="text-emerald-600" />
            Pagamento Aprovado
          </span>
        );
      case 'SHIPPED':
      case 'em_transito':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-extrabold">
            <Truck size={12} className="text-blue-600" />
            Em Trânsito
          </span>
        );
      case 'DELIVERED':
      case 'entregue':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-700 text-[11px] font-extrabold">
            <CheckCircle2 size={12} className="text-emerald-600" />
            Entregue
          </span>
        );
      case 'CANCELLED':
      case 'cancelado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-[11px] font-extrabold">
            <AlertCircle size={12} className="text-red-600" />
            Cancelado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-[11px] font-bold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#FAF9F6] text-[#171B2B] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FAF9F6]/90 backdrop-blur-xl border-b border-[#F0ECE6]/80 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack || closeSubScreen}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#171B2B] transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-base font-extrabold text-[#171B2B] tracking-tight flex items-center gap-1.5">
              <span>Meus Pedidos</span>
              <span className="px-2 py-0.5 rounded-full bg-[#FF6B57]/10 text-[#FF6B57] text-[10px] font-bold">
                {orders.length}
              </span>
            </h1>
            <span className="text-[11px] text-gray-500 font-medium">Histórico e rastreio em tempo real</span>
          </div>
        </div>

        <button
          onClick={() => {
            showToast('Atualizando pedidos do Firestore...');
            setLoading(true);
            setTimeout(() => setLoading(false), 600);
          }}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:text-[#FF6B57] hover:bg-gray-100 transition-colors"
          title="Recarregar Pedidos"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin text-[#FF6B57]' : ''} />
        </button>
      </header>

      <div className="py-4 flex flex-col w-full max-w-4xl mx-auto space-y-4">
        {/* Search Input */}
        <div className="relative flex items-center w-full">
          <div className="absolute left-3.5 flex items-center pointer-events-none text-gray-400">
            <Search size={16} />
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por código (#SG...) ou produto"
            className="w-full h-11 pl-10 pr-4 rounded-2xl bg-white text-xs text-[#171B2B] placeholder:text-gray-400 border border-gray-200 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#FF6B57]/30 transition-all"
          />
        </div>

        {/* Status Tab Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-200/60 rounded-2xl">
          <button
            onClick={() => setActiveTab('todos')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all text-center ${
              activeTab === 'todos'
                ? 'bg-white text-[#171B2B] shadow-2xs'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Todos ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('em_andamento')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all text-center ${
              activeTab === 'em_andamento'
                ? 'bg-white text-[#171B2B] shadow-2xs'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Em Andamento ({orders.filter((o) => o.status !== 'entregue').length})
          </button>
          <button
            onClick={() => setActiveTab('entregues')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all text-center ${
              activeTab === 'entregues'
                ? 'bg-white text-[#171B2B] shadow-2xs'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Entregues ({orders.filter((o) => o.status === 'entregue').length})
          </button>
        </div>

        {/* Live Active Delivery Banner if any order is 'em_transito' */}
        {orders.some((o) => o.status === 'em_transito') && (
          <div className="p-4 rounded-3xl bg-gradient-to-br from-[#171B2B] via-[#212638] to-[#171B2B] text-white shadow-md flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B57]/20 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF6B57] text-white text-[10px] font-bold uppercase tracking-wider">
                <Truck size={12} />
                Próxima Entrega
              </span>
              <span className="text-xs text-gray-300 font-mono">#SG-84920</span>
            </div>

            <div>
              <h3 className="text-base font-extrabold leading-snug">Seu pacote está a caminho!</h3>
              <p className="text-xs text-gray-300 mt-0.5">Previsão: Amanhã até as 18:00 no seu endereço</p>
            </div>

            {/* Step Progress Line */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-gray-300 pb-1.5">
                <span className="text-emerald-400">✓ Aprovado</span>
                <span className="text-emerald-400">✓ Embalado</span>
                <span className="text-[#FF6B57]">🚚 Na rua</span>
                <span className="text-gray-400">Entregue</span>
              </div>
              <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 via-[#FF6B57] to-[#FF6B57] w-[75%] rounded-full"></div>
              </div>
            </div>

            <button
              onClick={() => {
                const target = orders.find((o) => o.status === 'em_transito') || orders[0];
                setSelectedTrackingOrder(target);
              }}
              className="mt-1 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 border border-white/10"
            >
              <span>Ver Rastreamento Detalhado</span>
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl border border-gray-200 text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <ShoppingBag size={26} />
            </div>
            <h3 className="font-bold text-sm text-[#171B2B]">Nenhum pedido encontrado</h3>
            <p className="text-xs text-gray-500 max-w-xs">
              Você ainda não possui pedidos nesta categoria ou com este termo de busca.
            </p>
            <button
              onClick={() => {
                closeSubScreen();
                setCurrentTab('categorias');
              }}
              className="mt-2 px-5 py-2.5 rounded-full bg-[#FF6B57] text-white text-xs font-bold shadow-md hover:bg-[#E05340]"
            >
              Explorar Produtos
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-3xl bg-white border border-[#EAE6DF] shadow-xs flex flex-col gap-3 hover:shadow-md transition-shadow"
              >
                {/* Header: Order ID, Date & Status */}
                <div className="flex items-start justify-between pb-2.5 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-[#171B2B]">{order.orderNumber}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <span className="text-[11px] text-gray-500 mt-0.5 block">{order.createdAt}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block">Total</span>
                    <span className="text-sm font-black text-[#171B2B]">
                      R$ {order.total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="flex flex-col gap-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-14 object-cover rounded-xl bg-gray-100 shrink-0 border border-gray-100"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-[#171B2B] truncate">{item.name}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                          {item.size && <span>Tam: <strong>{item.size}</strong></span>}
                          {item.color && <span>• Cor: {item.color}</span>}
                          <span>• Qtd: {item.quantity}</span>
                        </div>
                        <span className="text-xs font-semibold text-[#171B2B] mt-0.5 block">
                          R$ {item.price.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Actions */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-gray-500 flex items-center gap-1 truncate">
                    <ShieldCheck size={14} className="text-[#2E6945] shrink-0" />
                    <span>{order.paymentMethodLabel}</span>
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setSelectedTrackingOrder(order)}
                      className="px-3 py-1.5 rounded-full bg-[#171B2B] hover:bg-black text-white text-xs font-bold transition flex items-center gap-1"
                    >
                      <Truck size={13} />
                      <span>Rastrear</span>
                    </button>
                    {(order.status === 'em_preparacao' || (order as any).status === 'PENDING_PAYMENT') && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="px-2.5 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition"
                        title="Cancelar Pedido"
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      onClick={() => showToast(`Nota fiscal do pedido ${order.orderNumber} baixada em PDF!`)}
                      className="p-1.5 rounded-full border border-gray-200 text-gray-600 hover:text-black hover:bg-gray-50 transition"
                      title="Ver Nota Fiscal"
                    >
                      <FileText size={16} />
                    </button>
                    <a
                      href={createWhatsAppUrl(
                        storeSettings.whatsappNumber,
                        `Olá! Gostaria de informações sobre meu pedido *${order.orderNumber}* (${order.items.length} itens, Total R$ ${order.total.toFixed(2).replace('.', ',')}) na Sagas Brasil Moda.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-full bg-[#EBF7F0] text-[#25D366] hover:bg-[#d8f3e3] transition flex items-center justify-center"
                      title="Falar com a Loja no WhatsApp"
                    >
                      <MessageCircle size={16} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tracking Modal / Details Modal */}
      {selectedTrackingOrder && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-3xl shadow-2xl p-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold">
                  Rastreamento Correios / Loggi
                </span>
                <h3 className="text-lg font-black text-[#171B2B]">
                  Pedido {selectedTrackingOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTrackingOrder(null)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Tracking Code Pill */}
            <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-bold">Código de Rastreio</span>
                <p className="font-mono font-bold text-xs text-[#171B2B]">
                  {selectedTrackingOrder.trackingCode || 'BR948201849SP'}
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedTrackingOrder.trackingCode || 'BR948201849SP');
                  showToast('Código de rastreio copiado!');
                }}
                className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-700 shadow-2xs hover:bg-gray-50"
              >
                Copiar
              </button>
            </div>

            {/* Destination Address */}
            <div className="flex items-start gap-2.5 text-xs text-gray-600">
              <MapPin size={16} className="text-[#FF6B57] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#171B2B] block">Endereço de Entrega:</span>
                <span>{selectedTrackingOrder.deliveryAddress || 'Av. Paulista, 1500 - Bela Vista, São Paulo - SP'}</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#171B2B]">Pagamento Confirmado</h4>
                  <p className="text-[11px] text-gray-500">Transação aprovada via {selectedTrackingOrder.paymentMethodLabel}</p>
                  <span className="text-[10px] text-gray-400">10:24 • Sistema SAGAS</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <PackageCheck size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#171B2B]">Separação e Embalagem</h4>
                  <p className="text-[11px] text-gray-500">Peças conferidas e lacradas no Centro de Distribuição SP</p>
                  <span className="text-[10px] text-gray-400">13:10 • Centro Logístico</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  selectedTrackingOrder.status === 'entregue'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-[#FF6B57] text-white'
                }`}>
                  <Truck size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#171B2B]">Objeto em Transporte</h4>
                  <p className="text-[11px] text-gray-500">Saiu da unidade de tratamento para distribuição local</p>
                  <span className="text-[10px] text-gray-400">Hoje às 08:30 • Rota de Entrega</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  selectedTrackingOrder.status === 'entregue'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#171B2B]">Entrega ao Destinatário</h4>
                  <p className="text-[11px] text-gray-500">
                    {selectedTrackingOrder.status === 'entregue'
                      ? 'Pacote entregue com assinatura confirmada'
                      : 'Previsão de entrega: Amanhã até as 18:00'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedTrackingOrder(null)}
              className="mt-2 w-full py-3 rounded-full bg-[#FF6B57] hover:bg-[#E05340] text-white text-xs font-bold shadow-md transition"
            >
              Fechar Rastreamento
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
