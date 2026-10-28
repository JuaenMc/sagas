import { Product, ProductVariation, StockData, CreateOrderPayload, CreateOrderResponse, ErpOrder } from '../types/erp';
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

export const resolveBackendUrl = (): string => {
  if (isMobileNative()) {
    const mobileUrl = getEnvVar('VITE_BACKEND_URL_MOBILE');
    if (mobileUrl) return mobileUrl.replace(/\/+$/, '');
  }
  return getEnvVar('VITE_BACKEND_URL', 'https://erpsagas.onrender.com').replace(/\/+$/, '');
};

export const BASE_URL = resolveBackendUrl();
export const API_KEY = getEnvVar('VITE_ERP_API_KEY', 'sagas_erp_sec_9f8a3c2b1e4d7f6a5b8c9d0e1f2a3b4c');

const TIMEOUT_MS = 10000;
const RETRY_ATTEMPTS = 2;
const RETRY_BACKOFF_MS = [1000, 2000];

// Paleta de cores oficial da SAGAS
const COLOR_PALETTE_MAP: Record<string, string> = {
  'rosê': '#E7B1A5',
  'rose': '#E7B1A5',
  'rosê floral': '#E7B1A5',
  'rosê algodão': '#E7B1A5',
  'rosa': '#F48FB1',
  'menta': '#A8D5BA',
  'menta / areia': '#A8D5BA',
  'menta suave': '#A8D5BA',
  'amarelo': '#F7DE9B',
  'amarelo manteiga': '#F7DE9B',
  'amarelo floral': '#F7DE9B',
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
  'branco neve': '#FFFFFF',
  'preto': '#171B2B',
  'preto race': '#171B2B',
  'cinza': '#9CA3AF',
  'areia': '#E5D3B3',
  'mostarda': '#E0A96D',
  'nude': '#E8D0C5',
  'verde militar': '#4B5320',
};

export function resolveColorHex(colorName: string): string {
  if (!colorName) return '#C86D51';
  const normalized = colorName.trim().toLowerCase();
  if (COLOR_PALETTE_MAP[normalized]) {
    return COLOR_PALETTE_MAP[normalized];
  }
  for (const [key, hex] of Object.entries(COLOR_PALETTE_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return hex;
    }
  }
  return '#C86D51';
}

/**
 * Converte o formato do Produto retornado pelo ERP para o modelo consumido pela Loja SAGAS.
 * Mapeamentos essenciais:
 * - Imagem: product.coverImageUrl || product.images[0]
 * - Nome: product.title || product.name
 * - Preço: product.price (numérico)
 * - Estoque: product.stock (numérico)
 * - Variações: product.variations (sku, size, color, stock, price, id)
 */
export function mapErpProductToStoreProduct(raw: any): StoreProduct {
  const title = raw.title || raw.name || 'Produto SAGAS';
  const price = typeof raw.price === 'number' ? raw.price : parseFloat(raw.price) || 0;
  const costPrice = typeof raw.costPrice === 'number' ? raw.costPrice : raw.costPrice ? parseFloat(raw.costPrice) : undefined;
  const stock = typeof raw.stock === 'number' ? raw.stock : parseInt(raw.stock, 10) || 0;

  // Imagens: priorizar coverImageUrl, depois array images, com fallback elegante
  const images: string[] = [];
  if (raw.coverImageUrl) {
    images.push(raw.coverImageUrl);
  }
  if (Array.isArray(raw.images)) {
    raw.images.forEach((img: any) => {
      const url = typeof img === 'string' ? img : img?.url;
      if (url && !images.includes(url)) {
        images.push(url);
      }
    });
  }
  if (images.length === 0) {
    images.push('https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=900&q=80');
  }

  // Mapear variações
  const rawVariations: any[] = Array.isArray(raw.variations) ? raw.variations : [];
  const mappedVariations: ProductVariation[] = rawVariations.map((v: any, index: number) => ({
    id: v.id || `var-${raw.id}-${v.sku || index}`,
    sku: v.sku || `${raw.masterSku || 'SKU'}-${v.size || 'U'}-${v.color || 'U'}`,
    size: v.size || 'Único',
    color: v.color || 'Única',
    stock: typeof v.stock === 'number' ? v.stock : parseInt(v.stock, 10) || 0,
    price: typeof v.price === 'number' ? v.price : parseFloat(v.price) || price,
    barcodeEan13: v.barcodeEan13 || '',
  }));

  // Extrair tamanhos e cores únicos
  const sizesFromVars = Array.from(new Set(mappedVariations.map(v => v.size).filter(Boolean)));
  const sizes = (raw.sizes && raw.sizes.length > 0) ? raw.sizes : (sizesFromVars.length > 0 ? sizesFromVars : ['Único']);

  const colorsFromVars = Array.from(new Set(mappedVariations.map(v => v.color).filter(Boolean)));
  const colorNames = (raw.colors && raw.colors.length > 0) ? raw.colors : (colorsFromVars.length > 0 ? colorsFromVars : ['Única']);

  const mappedColors: ProductColor[] = colorNames.map((col: string) => ({
    name: col,
    hex: resolveColorHex(col),
  }));

  const categoryLower = (raw.category || raw.categoryLabel || '').toLowerCase();
  let normalizedCategory: any = 'feminino';
  if (categoryLower.includes('infant')) normalizedCategory = 'infantil';
  else if (categoryLower.includes('comb')) normalizedCategory = 'combos';
  else if (categoryLower.includes('novid')) normalizedCategory = 'novidades';
  else if (categoryLower.includes('masculin')) normalizedCategory = 'feminino';

  return {
    id: String(raw.id),
    name: title,
    category: normalizedCategory,
    subCategory: raw.category || raw.categoryLabel || 'Geral',
    ageGroup: normalizedCategory === 'infantil' ? '2 a 10 anos' : undefined,
    price,
    originalPrice: price > 0 ? Math.round(price * 1.35 * 100) / 100 : undefined,
    discountPercent: 25,
    images,
    rating: 4.9,
    reviewsCount: 42,
    badge: mappedVariations.length > 1 ? `${mappedVariations.length} variações` : undefined,
    secondaryBadge: stock > 0 ? 'ERP Sincronizado' : 'Esgotado',
    colors: mappedColors,
    sizes,
    inStock: stock > 0,
    isComboEligible: true,
    description: raw.description || `Produto oficial ${title}. Confeccionado com tecidos selecionados de alto padrão SAGAS.`,
    fabricInfo: 'Composição de alta qualidade. Conforto e acabamento primoroso.',
    measurementsInfo: 'Consulte a tabela de medidas SAGAS para referência.',
    masterSku: raw.masterSku,
    costPrice,
    stock,
    variations: mappedVariations,
  };
}

/**
 * Executa requisição HTTP com Timeout e Retry com Backoff exponencial.
 */
async function fetchWithRetry(url: string, options: RequestInit = {}): Promise<Response> {
  let lastError: any = null;

  for (let attempt = 0; attempt <= RETRY_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const authToken = typeof localStorage !== 'undefined' ? localStorage.getItem('sagas_auth_token') : null;
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-ERP-API-KEY': API_KEY,
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
          ...(options.headers || {}),
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return response;
      }

      // Se for 4xx (exceto 408 Timeout e 429 RateLimit), não faz retry
      if (response.status >= 400 && response.status < 500 && response.status !== 408 && response.status !== 429) {
        return response;
      }

      lastError = new Error(`HTTP error ${response.status}`);
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err;
      if (err.name === 'AbortError') {
        console.warn(`[apiClient] Timeout (${TIMEOUT_MS}ms) na tentativa ${attempt + 1} para ${url}`);
      } else {
        console.warn(`[apiClient] Erro na tentativa ${attempt + 1} para ${url}:`, err.message);
      }
    }

    if (attempt < RETRY_ATTEMPTS) {
      const delay = RETRY_BACKOFF_MS[attempt] || 1000;
      await new Promise(res => setTimeout(res, delay));
    }
  }

  throw lastError || new Error(`Falha ao conectar com ${url} após tentativas`);
}

/**
 * 1. GET /api/products
 * Lista os produtos do ERP com suporte a filtros opcionais categoryId e search.
 */
export async function getProducts(categoryId?: string, search?: string): Promise<StoreProduct[]> {
  const currentBase = resolveBackendUrl();
  const params = new URLSearchParams();
  if (categoryId) params.set('categoryId', categoryId);
  if (search) params.set('search', search);

  const qs = params.toString();
  const url = `${currentBase}/api/products${qs ? `?${qs}` : ''}`;

  try {
    const res = await fetchWithRetry(url);
    if (!res.ok) {
      console.warn(`[apiClient.getProducts] HTTP ${res.status} ao consultar produtos.`);
      return [];
    }

    const json = await res.json();
    const rawList: any[] = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);

    return rawList.map(mapErpProductToStoreProduct);
  } catch (err: any) {
    console.error('[apiClient.getProducts] Falha de comunicação com o ERP:', err.message);
    throw err;
  }
}

/**
 * 2. GET /api/products/:id
 * Busca um produto específico por ID no ERP.
 */
export async function getProductById(id: string): Promise<StoreProduct | null> {
  if (!id) return null;
  const currentBase = resolveBackendUrl();
  const url = `${currentBase}/api/products/${encodeURIComponent(id)}`;

  try {
    const res = await fetchWithRetry(url);
    if (!res.ok) {
      if (res.status === 404) return null;
      console.warn(`[apiClient.getProductById] HTTP ${res.status} para produto ${id}.`);
      return null;
    }

    const json = await res.json();
    const rawProduct = json?.data || json;
    if (!rawProduct || !rawProduct.id) return null;

    return mapErpProductToStoreProduct(rawProduct);
  } catch (err: any) {
    console.error(`[apiClient.getProductById] Falha ao buscar produto ${id}:`, err.message);
    return null;
  }
}

/**
 * 3. POST /api/orders
 * Criação transacional de pedido no ERP com reserva de estoque.
 */
export async function createOrder(orderPayload: any): Promise<CreateOrderResponse> {
  const currentBase = resolveBackendUrl();
  const url = `${currentBase}/api/orders`;

  const res = await fetchWithRetry(url, {
    method: 'POST',
    body: JSON.stringify(orderPayload),
  });

  const data = await res.json();
  if (!res.ok) {
    const err: any = new Error(data.message || 'Falha ao criar pedido no ERP');
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

/**
 * 4. POST /api/orders/:id/payment-confirmed
 * Confirmação de pagamento no ERP.
 */
export async function confirmPayment(orderId: string, paymentData: { externalPaymentId?: string; paidAt?: string } = {}): Promise<any> {
  const currentBase = resolveBackendUrl();
  const url = `${currentBase}/api/orders/${encodeURIComponent(orderId)}/payment-confirmed`;

  const res = await fetchWithRetry(url, {
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
}

/**
 * 5. POST /api/orders/:id/cancel
 * Cancelamento de pedido com liberação de estoque.
 */
export async function cancelOrder(orderId: string, reason = 'Cancelado pelo cliente'): Promise<any> {
  const currentBase = resolveBackendUrl();
  const url = `${currentBase}/api/orders/${encodeURIComponent(orderId)}/cancel`;

  const res = await fetchWithRetry(url, {
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
}

/**
 * 6. GET /api/orders
 * Lista pedidos sincronizados no ERP.
 */
export async function getOrders(filters: { status?: string; channel?: string; customerId?: string; firebaseUid?: string } = {}): Promise<ErpOrder[]> {
  const currentBase = resolveBackendUrl();
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.channel) params.set('channel', filters.channel);
  if (filters.customerId) params.set('customerId', filters.customerId);
  if (filters.firebaseUid) params.set('firebaseUid', filters.firebaseUid);

  const qs = params.toString();
  const url = `${currentBase}/api/orders${qs ? `?${qs}` : ''}`;

  try {
    const res = await fetchWithRetry(url);
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json) ? json : (json?.data || []);
  } catch (err: any) {
    console.warn('[apiClient.getOrders] Falha ao listar pedidos:', err.message);
    return [];
  }
}

/**
 * 7. GET /api/orders/:id
 * Detalhes de um pedido específico.
 */
export async function getOrderById(orderId: string): Promise<any | null> {
  const currentBase = resolveBackendUrl();
  const url = `${currentBase}/api/orders/${encodeURIComponent(orderId)}`;

  try {
    const res = await fetchWithRetry(url);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || json;
  } catch (err: any) {
    console.warn(`[apiClient.getOrderById] Falha ao buscar pedido ${orderId}:`, err.message);
    return null;
  }
}

// ============================================================================
// 8. AUTENTICAÇÃO REAL (JWT + Neon DB)
// ============================================================================

export async function registerUser(payload: { email: string; password?: string; name: string; phone?: string; firebaseUid?: string }): Promise<any> {
  const currentBase = resolveBackendUrl();
  const res = await fetchWithRetry(`${currentBase}/api/auth/register`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Falha ao cadastrar usuário');
  if (data.token && typeof localStorage !== 'undefined') {
    localStorage.setItem('sagas_auth_token', data.token);
  }
  return data;
}

export async function loginUser(payload: { email: string; password?: string; firebaseUid?: string; name?: string }): Promise<any> {
  const currentBase = resolveBackendUrl();
  const res = await fetchWithRetry(`${currentBase}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Falha ao autenticar');
  if (data.token && typeof localStorage !== 'undefined') {
    localStorage.setItem('sagas_auth_token', data.token);
  }
  return data;
}

export async function getMe(): Promise<any | null> {
  const currentBase = resolveBackendUrl();
  try {
    const res = await fetchWithRetry(`${currentBase}/api/auth/me`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

export function logoutLocal() {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('sagas_auth_token');
  }
}

// ============================================================================
// 9. CARRINHO PERSISTENTE NO NEON DB
// ============================================================================

export async function getCart(): Promise<{ items: any[]; count: number; subtotal: number }> {
  const currentBase = resolveBackendUrl();
  try {
    const res = await fetchWithRetry(`${currentBase}/api/cart`);
    if (!res.ok) return { items: [], count: 0, subtotal: 0 };
    const data = await res.json();
    return {
      items: data.data || [],
      count: data.count || 0,
      subtotal: data.subtotal || 0,
    };
  } catch {
    return { items: [], count: 0, subtotal: 0 };
  }
}

export async function addCartItem(payload: { productId: string; variationId?: string; quantity: number; size?: string; color?: string }): Promise<any> {
  const currentBase = resolveBackendUrl();
  const res = await fetchWithRetry(`${currentBase}/api/cart`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateCartItem(id: string, quantity: number): Promise<any> {
  const currentBase = resolveBackendUrl();
  const res = await fetchWithRetry(`${currentBase}/api/cart/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });
  return res.json();
}

export async function removeCartItem(id: string): Promise<any> {
  const currentBase = resolveBackendUrl();
  const res = await fetchWithRetry(`${currentBase}/api/cart/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function clearCartDb(): Promise<any> {
  const currentBase = resolveBackendUrl();
  const res = await fetchWithRetry(`${currentBase}/api/cart`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function syncCartItems(items: any[]): Promise<any> {
  const currentBase = resolveBackendUrl();
  const res = await fetchWithRetry(`${currentBase}/api/cart/sync`, {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
  return res.json();
}

// ============================================================================
// 10. FAVORITOS / WISHLIST NO NEON DB
// ============================================================================

export async function getFavorites(): Promise<{ productIds: string[]; products: StoreProduct[] }> {
  const currentBase = resolveBackendUrl();
  try {
    const res = await fetchWithRetry(`${currentBase}/api/favorites`);
    if (!res.ok) return { productIds: [], products: [] };
    const data = await res.json();
    return {
      productIds: data.productIds || [],
      products: (data.data || []).map(mapErpProductToStoreProduct),
    };
  } catch {
    return { productIds: [], products: [] };
  }
}

export async function addFavorite(productId: string): Promise<any> {
  const currentBase = resolveBackendUrl();
  const res = await fetchWithRetry(`${currentBase}/api/favorites`, {
    method: 'POST',
    body: JSON.stringify({ productId }),
  });
  return res.json();
}

export async function removeFavorite(productId: string): Promise<any> {
  const currentBase = resolveBackendUrl();
  const res = await fetchWithRetry(`${currentBase}/api/favorites/${encodeURIComponent(productId)}`, {
    method: 'DELETE',
  });
  return res.json();
}

// ============================================================================
// 11. ENDEREÇOS DE ENTREGA NO NEON DB
// ============================================================================

export async function getAddresses(): Promise<any[]> {
  const currentBase = resolveBackendUrl();
  try {
    const res = await fetchWithRetry(`${currentBase}/api/addresses`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function saveAddress(addr: any): Promise<any> {
  const currentBase = resolveBackendUrl();
  const method = addr.id && !addr.id.startsWith('addr-temp') ? 'PUT' : 'POST';
  const url = addr.id && !addr.id.startsWith('addr-temp')
    ? `${currentBase}/api/addresses/${encodeURIComponent(addr.id)}`
    : `${currentBase}/api/addresses`;

  const res = await fetchWithRetry(url, {
    method,
    body: JSON.stringify(addr),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Falha ao salvar endereço');
  return data.data || data;
}

export async function deleteAddress(id: string): Promise<any> {
  const currentBase = resolveBackendUrl();
  const res = await fetchWithRetry(`${currentBase}/api/addresses/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  return res.json();
}

// ============================================================================
// 12. CUPONS DE DESCONTO NO NEON DB
// ============================================================================

export async function validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; discountAmount: number; message?: string }> {
  const currentBase = resolveBackendUrl();
  const res = await fetchWithRetry(`${currentBase}/api/coupons/validate`, {
    method: 'POST',
    body: JSON.stringify({ code, subtotal }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Cupom inválido');
  }
  return {
    valid: true,
    discountAmount: data.coupon?.discountAmount || 0,
    message: data.message,
  };
}

// ============================================================================
// 13. CÁLCULO DE FRETE REAL (CEP)
// ============================================================================

export async function calculateShipping(cep: string, subtotal = 0, weightGrams = 350): Promise<any> {
  const currentBase = resolveBackendUrl();
  const res = await fetchWithRetry(`${currentBase}/api/shipping/calculate`, {
    method: 'POST',
    body: JSON.stringify({ cep, subtotal, weightGrams }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Falha ao calcular frete');
  return data;
}

// ============================================================================
// 14. MERCADO PAGO GATEWAY REAL
// ============================================================================

export async function createMercadoPagoPreference(orderPayload: { items: any[]; payer: any; orderNumber: string }): Promise<any> {
  const currentBase = resolveBackendUrl();
  const res = await fetchWithRetry(`${currentBase}/api/payment/create-preference`, {
    method: 'POST',
    body: JSON.stringify(orderPayload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Falha ao gerar preferência Mercado Pago');
  return data;
}

export async function createMercadoPagoPix(pixPayload: { amount: number; description?: string; payer: any; orderNumber: string }): Promise<any> {
  const currentBase = resolveBackendUrl();
  const res = await fetchWithRetry(`${currentBase}/api/payment/create-pix`, {
    method: 'POST',
    body: JSON.stringify(pixPayload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Falha ao gerar Pix Mercado Pago');
  return data;
}

/**
 * Objeto cliente unificado
 */
export const apiClient = {
  getProducts,
  getProductById,
  createOrder,
  confirmPayment,
  cancelOrder,
  getOrders,
  getOrderById,
  registerUser,
  loginUser,
  getMe,
  logoutLocal,
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCartDb,
  syncCartItems,
  getFavorites,
  addFavorite,
  removeFavorite,
  getAddresses,
  saveAddress,
  deleteAddress,
  validateCoupon,
  calculateShipping,
  createMercadoPagoPreference,
  createMercadoPagoPix,
  mapErpProductToStoreProduct,
  resolveColorHex,
  resolveBackendUrl,
};

export default apiClient;
