import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

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
 * Cria uma Preference de pagamento para o Checkout Pro / Pix no Mercado Pago
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

  const baseUrl = redirectUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://sagasbrasilmoda.com.br');

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
 * Cria um pagamento Pix transparente gerando o QR Code e o Copia e Cola dinâmico oficial
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
