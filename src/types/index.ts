export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'infantil' | 'feminino' | 'combos' | 'novidades';
  subCategory?: string;
  ageGroup?: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  images: string[];
  rating: number;
  reviewsCount: number;
  badge?: string;
  secondaryBadge?: string;
  colors: ProductColor[];
  sizes: string[];
  inStock: boolean;
  soldPercentage?: number;
  isFlashSale?: boolean;
  isComboEligible: boolean;
  description: string;
  fabricInfo: string;
  measurementsInfo?: string;
}

export interface CartItem {
  id: string; // unique item id (productId + color + size)
  productId: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
  isComboEligible: boolean;
  comboTag?: string;
}

export type PaymentMethod = 'pix' | 'credit_card' | 'boleto';

export type ScreenTab = 'home' | 'categorias' | 'carrinho' | 'favoritos' | 'perfil';

export type SubScreen = 'none' | 'login' | 'add-card' | 'payment-checkout' | 'combo-suggestions' | 'orders' | 'addresses' | 'admin-catalog';

export interface DeliveryAddress {
  id: string;
  userId: string;
  label: string; // 'Casa', 'Trabalho', 'Principal'
  recipientName: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  isDefault: boolean;
  createdAt: string;
}

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export type OrderStatus = 'aprovado' | 'em_preparacao' | 'em_transito' | 'entregue' | 'cancelado';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  createdAt: string;
  status: OrderStatus;
  statusLabel: string;
  total: number;
  paymentMethod: string;
  paymentMethodLabel: string;
  items: OrderItem[];
  trackingCode?: string;
  estimatedDelivery?: string;
  deliveryAddress?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isVip?: boolean;
  cashback?: number;
  activeOrdersCount?: number;
  couponsCount?: number;
}

export interface SavedCardItem {
  id: string;
  brand: string;
  last4: string;
  holder: string;
  expiry: string;
  isDefault: boolean;
}

export interface FilterState {
  category: string;
  searchQuery: string;
  onlyFreeShipping: boolean;
  maxPrice: number | null;
  selectedSize: string | null;
  sortBy: 'mais_vendidos' | 'menor_preco' | 'maior_preco' | 'melhor_avaliados';
}

export interface StoreSettings {
  storeName: string;
  whatsappNumber: string; // e.g. "5511999999999"
  pixKey: string;
  pixKeyType: 'cnpj' | 'cpf' | 'email' | 'telefone' | 'aleatoria';
  bankName: string;
  merchantName: string;
  merchantCity: string;
  mercadoPagoPublicKey?: string;
  mercadoPagoAccessToken?: string;
  gatewayMode: 'demo' | 'mercadopago' | 'pix_chave';
}

