/**
 * Tipos compartilhados com o ERP Backend (espelho do DTO /api/products e /api/stock)
 */

export interface ProductVariation {
  id: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
  price: number;
  barcodeEan13?: string;
}

export interface Product {
  id: string;
  name: string;
  masterSku: string;
  price: number;
  costPrice?: number;
  sizes: string[];
  colors: string[];
  stock: number;
  images: string[];
  category: string;
  variations: ProductVariation[];
  description?: string;
  coverImageUrl?: string;
  brand?: string;
  type?: string;
  weightGrams?: number;
}

export interface StockLocation {
  warehouseId: string;
  warehouseCode: string;
  warehouseName?: string;
  stockPhysical: number;
  stockReserved: number;
  stockAvailable: number;
}

export interface StockData {
  variationId: string;
  sku: string;
  productTitle: string;
  size: string;
  color: string;
  stockPhysical: number;
  stockReserved: number;
  stockAvailable: number;
  locations: StockLocation[];
}

export interface CreateOrderItemPayload {
  variationId: string;
  quantity: number;
  unitPrice?: number;
}

export interface CreateOrderPayload {
  externalId: string;
  channel?: string;
  customer: {
    firebaseUid?: string;
    name?: string;
    email?: string;
    phone?: string;
    address?: any;
  };
  items: CreateOrderItemPayload[];
  shipping?: {
    cost: number;
    method?: string;
  };
  paymentMethod?: 'PIX' | 'CREDIT_CARD' | 'BOLETO';
  couponCode?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  orderId: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  estimatedMarginPct?: number;
  expiresAt: string;
  message?: string;
  idempotent?: boolean;
}

export interface ErpOrderItem {
  id: string;
  variationId: string;
  name: string;
  sku?: string;
  size?: string;
  color?: string;
  image?: string;
  quantity: number;
  unitPrice: number;
}

export interface ErpOrder {
  id: string;
  orderNumber: string;
  externalOrderId?: string;
  channel: string;
  status: string;
  customerName?: string;
  customerEmail?: string;
  total: number;
  shipping?: number;
  createdAt: string;
  updatedAt: string;
  items: ErpOrderItem[];
}
