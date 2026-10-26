import { Product, ProductVariation, StockData } from '../types/erp';
import { Product as StoreProduct, ProductColor } from '../types';

// Obter variáveis de ambiente com suporte híbrido (Vite import.meta.env + Node process.env)
const getEnvVar = (key: string, defaultValue = ''): string => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch {}

  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch {}

  return defaultValue;
};

const isMobileNative = (): boolean => {
  try {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      if (window.Capacitor?.isNativePlatform?.()) return true;
      if (window.location.protocol === 'capacitor:' || window.location.protocol === 'ionic:') return true;
    }
  } catch {}
  return false;
};

const resolveBackendUrl = (): string => {
  if (isMobileNative()) {
    const mobileUrl = getEnvVar('VITE_BACKEND_URL_MOBILE');
    if (mobileUrl) return mobileUrl.replace(/\/+$/, '');
    return 'http://10.0.2.2:3001';
  }
  return getEnvVar('VITE_BACKEND_URL', 'http://localhost:3001').replace(/\/+$/, '');
};

const BASE_URL = resolveBackendUrl();
const API_KEY = getEnvVar('VITE_ERP_API_KEY', 'sagas_erp_sec_9f8a3c2b1e4d7f6a5b8c9d0e1f2a3b4c');
const TIMEOUT_MS = 5000;
const RETRY_ATTEMPTS = 2;
const RETRY_BACKOFF_MS = [1000, 2000];

// Dicionário de paleta de cores para exibição na loja
const COLOR_PALETTE_MAP: Record<string, string> = {
  'rosê': '#E7B1A5',
  'rose': '#E7B1A5',
  'rosê floral': '#E7B1A5',
  'rosa': '#F48FB1',
  'menta': '#A8D5BA',
  'menta / areia': '#A8D5BA',
  'menta suave': '#A8D5BA',
  'amarelo': '#F7DE9B',
  'amarelo manteiga': '#F7DE9B',
  'terracota': '#C86D51',
  'terracota floral': '#C86D51',
  'azul': '#9BC4E2',
  'azul céu': '#9BC4E2',
  'azul ceu': '#9BC4E2',
  'marinho': '#1E3A8A',
  'lavanda': '#D4C5E2',
  'lilas': '#D4C5E2',
  'off-white': '#FAF9F6',
  'branco': '#FFFFFF',
  'preto': '#171B2B',
  'cinza': '#9CA3AF',
  'areia': '#E5D3B3',
  'mostarda': '#E0A96D',
  'nude': '#E8D0C5',
  'verde militar': '#4B5320',
};

export function resolveColorHex(colorName: string): string {
  const normalized = colorName.trim().toLowerCase();
  if (COLOR_PALETTE_MAP[normalized]) {
    return COLOR_PALETTE_MAP[normalized];
  }
  // Verificar correspondência parcial
  for (const [key, hex] of Object.entries(COLOR_PALETTE_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return hex;
    }
  }
  return '#C86D51'; // Fallback tom elegante terracota
}

/**
 * Converte o DTO do ERP no formato completo consumido pelo app/loja SAGAS
 */
export function mapErpProductToStoreProduct(erp: Product): StoreProduct {
  const mappedColors: ProductColor[] = (erp.colors || []).map(col => ({
    name: col,
    hex: resolveColorHex(col),
  }));

  if (mappedColors.length === 0) {
    mappedColors.push({ name: 'Única', hex: '#FAF9F6' });
  }

  const categoryLower = (erp.category || '').toLowerCase();
  let normalizedCategory: any = 'feminino';
  if (categoryLower.includes('infant')) normalizedCategory = 'infantil';
  else if (categoryLower.includes('comb')) normalizedCategory = 'combos';
  else if (categoryLower.includes('novid')) normalizedCategory = 'novidades';
  else if (categoryLower.includes('masculin')) normalizedCategory = 'feminino'; // fallback harmonioso para abas existentes

  const images = (erp.images && erp.images.length > 0)
    ? erp.images
    : ['https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=900&q=80'];

  return {
    id: erp.id,
    name: erp.name,
    category: normalizedCategory,
    subCategory: erp.category || 'Geral',
    ageGroup: normalizedCategory === 'infantil' ? '2 a 10 anos' : undefined,
    price: Number(erp.price) || 0,
    originalPrice: erp.price ? Math.round(Number(erp.price) * 1.35 * 100) / 100 : undefined,
    discountPercent: 25,
    images,
    rating: 4.9,
    reviewsCount: 42,
    badge: erp.variations && erp.variations.length > 1 ? `${erp.variations.length} variações` : undefined,
    secondaryBadge: 'ERP Sincronizado',
    colors: mappedColors,
    sizes: (erp.sizes && erp.sizes.length > 0) ? erp.sizes : ['Único'],
    inStock: (erp.stock || 0) > 0,
    isComboEligible: true,
    description: erp.description || `Produto oficial ${erp.name}. Confeccionado com tecidos selecionados de alto padrão SAGAS.`,
    fabricInfo: 'Composição de alta qualidade. Conforto e acabamento primoroso.',
    measurementsInfo: 'Consulte a tabela de medidas SAGAS para referência.',
    masterSku: erp.masterSku,
    costPrice: erp.costPrice,
    stock: erp.stock,
    variations: erp.variations,
  };
}

/**
 * Executa requisição HTTP com Timeout (5s) e Retry com Backoff exponencial (1s, 2s).
 */
async function fetchWithRetry(url: string, options: RequestInit = {}): Promise<Response> {
  let lastError: any = null;

  for (let attempt = 0; attempt <= RETRY_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-ERP-API-Key': API_KEY,
          ...(options.headers || {}),
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return response;
      }

      // Se for 4xx que não seja 408/429, não faz retry
      if (response.status >= 400 && response.status < 500 && response.status !== 408 && response.status !== 429) {
        console.warn(`[erpClient] Request to ${url} returned ${response.status}`);
        return response;
      }

      lastError = new Error(`HTTP error ${response.status}`);
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err;
      if (err.name === 'AbortError') {
        console.warn(`[erpClient] Timeout (5000ms) on attempt ${attempt + 1} for ${url}`);
      } else {
        console.warn(`[erpClient] Error on attempt ${attempt + 1} for ${url}:`, err.message);
      }
    }

    if (attempt < RETRY_ATTEMPTS) {
      const delay = RETRY_BACKOFF_MS[attempt] || 1000;
      await new Promise(res => setTimeout(res, delay));
    }
  }

  throw lastError || new Error(`Failed to fetch ${url} after retries`);
}

/**
 * Cliente Oficial da Loja SAGAS para o ERP Backend
 */
export const erpClient = {
  /**
   * GET /api/products
   * Retorna lista de produtos do ERP convertidos para StoreProduct.
   * Em caso de erro, retorna array vazio para nunca crashar a loja.
   */
  async getProducts(): Promise<StoreProduct[]> {
    try {
      const res = await fetchWithRetry(`${BASE_URL}/api/products`);
      if (!res.ok) {
        console.warn(`[erpClient.getProducts] Status ${res.status}`);
        return [];
      }
      const data = await res.json();
      const rawProducts: Product[] = Array.isArray(data) ? data : (data?.data || []);

      return rawProducts.map(mapErpProductToStoreProduct);
    } catch (err: any) {
      console.warn('[erpClient.getProducts] Falha de comunicação com o ERP:', err.message);
      return [];
    }
  },

  /**
   * GET /api/products/:id
   * Retorna detalhes de um produto ou null se indisponível.
   */
  async getProductById(id: string): Promise<StoreProduct | null> {
    try {
      const res = await fetchWithRetry(`${BASE_URL}/api/products/${encodeURIComponent(id)}`);
      if (!res.ok) {
        return null;
      }
      const data = await res.json();
      const rawProduct: Product | null = Array.isArray(data) ? data[0] : (data?.data || data);
      if (!rawProduct || !rawProduct.id) {
        return null;
      }
      return mapErpProductToStoreProduct(rawProduct);
    } catch (err: any) {
      console.warn(`[erpClient.getProductById] Falha ao buscar produto ${id}:`, err.message);
      return null;
    }
  },

  /**
   * GET /api/stock
   * Retorna informações consolidadas de estoque por variação.
   */
  async getStock(): Promise<StockData[]> {
    try {
      const res = await fetchWithRetry(`${BASE_URL}/api/stock`);
      if (!res.ok) {
        return [];
      }
      const data = await res.json();
      return Array.isArray(data) ? data : (data?.data || []);
    } catch (err: any) {
      console.warn('[erpClient.getStock] Falha ao buscar estoque:', err.message);
      return [];
    }
  },

  /**
   * B1. POST /api/orders
   * Criação de pedido com reserva de estoque e idempotência (retry 3x)
   */
  async createOrder(orderData: import('../types/erp').CreateOrderPayload): Promise<import('../types/erp').CreateOrderResponse> {
    const res = await fetchWithRetry(`${BASE_URL}/api/orders`, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });

    const data = await res.json();
    if (!res.ok) {
      const err: any = new Error(data.message || 'Falha ao criar pedido no ERP');
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  },

  /**
   * B1. POST /api/orders/:id/payment-confirmed
   * Confirmação de pagamento idempotente
   */
  async confirmPayment(orderId: string, paymentData: { externalPaymentId?: string; paidAt?: string } = {}): Promise<any> {
    const res = await fetchWithRetry(`${BASE_URL}/api/orders/${encodeURIComponent(orderId)}/payment-confirmed`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });

    const data = await res.json();
    if (!res.ok) {
      const err: any = new Error(data.message || 'Falha ao confirmar pagamento no ERP');
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  },

  /**
   * B1. POST /api/orders/:id/cancel
   * Cancelamento de pedido com liberação de reserva
   */
  async cancelOrder(orderId: string, reason = 'Cancelado pelo cliente'): Promise<any> {
    const res = await fetchWithRetry(`${BASE_URL}/api/orders/${encodeURIComponent(orderId)}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });

    const data = await res.json();
    if (!res.ok) {
      const err: any = new Error(data.message || 'Falha ao cancelar pedido no ERP');
      err.status = res.status;
      throw err;
    }

    return data;
  },

  /**
   * B1. GET /api/orders
   * Lista pedidos com filtros (status, firebaseUid, etc.)
   */
  async getOrders(filters: { status?: string; channel?: string; customerId?: string; firebaseUid?: string } = {}): Promise<import('../types/erp').ErpOrder[]> {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.channel) params.set('channel', filters.channel);
      if (filters.customerId) params.set('customerId', filters.customerId);
      if (filters.firebaseUid) params.set('firebaseUid', filters.firebaseUid);

      const qs = params.toString();
      const url = `${BASE_URL}/api/orders${qs ? `?${qs}` : ''}`;
      const res = await fetchWithRetry(url);

      if (!res.ok) {
        return [];
      }

      const data = await res.json();
      return Array.isArray(data) ? data : (data?.data || []);
    } catch (err: any) {
      console.warn('[erpClient.getOrders] Falha ao buscar pedidos no ERP:', err.message);
      return [];
    }
  },

  /**
   * GET /api/orders/:id
   * Detalhes de um pedido específico
   */
  async getOrderById(orderId: string): Promise<any | null> {
    try {
      const res = await fetchWithRetry(`${BASE_URL}/api/orders/${encodeURIComponent(orderId)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data?.data || data;
    } catch (err: any) {
      console.warn(`[erpClient.getOrderById] Falha ao buscar pedido ${orderId}:`, err.message);
      return null;
    }
  },
};
