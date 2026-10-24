import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

/**
 * Obtém a URL base do backend (sagasBackend), dando prioridade à variável VITE_BACKEND_URL
 */
export function getBackendApiUrl(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'https://sagas.moda';
}

/**
 * Cria a instância do cliente Mercado Pago usando o Access Token fornecido
 */
export function getMercadoPagoClient(accessToken: string): MercadoPagoConfig {
  return new MercadoPagoConfig({
    accessToken: accessToken.trim(),
    options: { timeout: 7000 }
  });
}

export interface CreatePreferenceItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id?: string;
  picture_url?: string;
  description?: string;
}

export interface CreatePreferenceParams {
  accessToken: string;
  items: CreatePreferenceItem[];
  payerEmail: string;
  payerName?: string;
  orderNumber: string;
  notificationUrl?: string;
  redirectUrl?: string;
}

/**
 * Chama o backend sagasBackend para criar Preference de pagamento
 */
export async function createPaymentPreferenceApi(params: Omit<CreatePreferenceParams, 'accessToken'> & { accessToken?: string }) {
  const baseUrl = getBackendApiUrl();
  const response = await fetch(`${baseUrl}/api/mercadopago/create-preference`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Falha ao criar preference de pagamento');
  }

  return await response.json();
}

/**
 * Cria uma Preference de pagamento via SDK Node Mercado Pago
 */
export async function createPaymentPreference({
  accessToken,
  items,
  payerEmail,
  payerName,
  orderNumber,
  notificationUrl,
  redirectUrl
}: CreatePreferenceParams) {
  const client = getMercadoPagoClient(accessToken);
  const preference = new Preference(client);

  const baseUrl = redirectUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://sagas.moda');

  const response = await preference.create({
    body: {
      items: items.map(item => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        currency_id: 'BRL',
        picture_url: item.picture_url
      })),
      payer: {
        email: payerEmail || 'cliente@email.com',
        name: payerName || 'Cliente SAGAS'
      },
      external_reference: orderNumber,
      payment_methods: {
        excluded_payment_types: [],
        installments: 12
      },
      back_urls: {
        success: `${baseUrl}/?status=approved&order=${orderNumber}`,
        pending: `${baseUrl}/?status=pending&order=${orderNumber}`,
        failure: `${baseUrl}/?status=failure&order=${orderNumber}`
      },
      auto_return: 'approved',
      notification_url: notificationUrl
    }
  });

  return {
    id: response.id,
    init_point: response.init_point,
    sandbox_init_point: response.sandbox_init_point
  };
}

export interface CreatePixPaymentParams {
  accessToken: string;
  amount: number;
  description: string;
  payerEmail: string;
  payerCpf?: string;
  payerName?: string;
  orderNumber: string;
  notificationUrl?: string;
}

/**
 * Chama o backend sagasBackend para gerar Pix Transparente
 */
export async function createMercadoPagoPixApi(params: Omit<CreatePixPaymentParams, 'accessToken'> & { accessToken?: string }) {
  const baseUrl = getBackendApiUrl();
  const response = await fetch(`${baseUrl}/api/mercadopago/create-pix`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Falha ao gerar Pix no Mercado Pago');
  }

  return await response.json();
}

/**
 * Cria um pagamento Pix transparente via SDK Node Mercado Pago
 */
export async function createMercadoPagoPix({
  accessToken,
  amount,
  description,
  payerEmail,
  payerCpf,
  payerName,
  orderNumber,
  notificationUrl
}: CreatePixPaymentParams) {
  const client = getMercadoPagoClient(accessToken);
  const payment = new Payment(client);

  const cleanCpf = (payerCpf || '19119119100').replace(/\D/g, '');

  const response = await payment.create({
    body: {
      transaction_amount: Number(amount.toFixed(2)),
      description: description || `Pedido ${orderNumber} - Sagas Brasil Moda`,
      payment_method_id: 'pix',
      external_reference: orderNumber,
      payer: {
        email: payerEmail || 'cliente@email.com',
        first_name: payerName || 'Cliente',
        identification: {
          type: 'CPF',
          number: cleanCpf
        }
      },
      notification_url: notificationUrl
    }
  });

  const transactionData = response.point_of_interaction?.transaction_data;

  return {
    paymentId: response.id,
    status: response.status,
    statusDetail: response.status_detail,
    qrCode: transactionData?.qr_code || '',
    qrCodeBase64: transactionData?.qr_code_base64 || '',
    ticketUrl: transactionData?.ticket_url || ''
  };
}
