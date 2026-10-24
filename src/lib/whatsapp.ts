import { Order, DeliveryAddress } from '../types';

/**
 * Normaliza o número de telefone removendo caracteres não numéricos
 * Adiciona 55 (Brasil) se não tiver DDI
 */
export function cleanPhoneNumber(phone: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('55') && digits.length >= 12) {
    return digits;
  }
  return `55${digits}`;
}

/**
 * Cria o texto formatado para envio no WhatsApp da loja ou do cliente
 */
export function generateOrderWhatsAppMessage(order: Order, address?: DeliveryAddress | null, storeName = 'Sagas Brasil Moda'): string {
  const itemsText = order.items
    .map(
      (item, idx) =>
        `   ${idx + 1}. *${item.name}*\n      Tam: ${item.size || 'M'} | Qtd: ${item.quantity} | R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}`
    )
    .join('\n');

  const addrStr = address
    ? `${address.street}, ${address.number}${address.complement ? ` (${address.complement})` : ''}\n   Bairro: ${address.neighborhood}\n   Cidade: ${address.city} - ${address.state} | CEP: ${address.cep}`
    : order.deliveryAddress || 'Endereço registrado na conta';

  return `✨ *NOVO PEDIDO REALIZADO - ${storeName}* ✨\n\n` +
    `📦 *Pedido:* ${order.orderNumber}\n` +
    `📅 *Data:* ${order.createdAt}\n` +
    `💳 *Pagamento:* ${order.paymentMethodLabel}\n` +
    `💰 *Valor Total:* R$ ${order.total.toFixed(2).replace('.', ',')}\n\n` +
    `🛍️ *Itens Comprados:*\n${itemsText}\n\n` +
    `📍 *Endereço de Entrega:*\n   ${addrStr}\n\n` +
    `🚚 *Status:* ${order.statusLabel}\n\n` +
    `_Obrigada por comprar com a Sagas Brasil Moda! Dúvidas ou comprovantes podem ser enviados diretamente por aqui._`;
}

/**
 * Gera a URL completa para abrir o WhatsApp Web ou App nativo
 */
export function createWhatsAppUrl(phone: string, text: string): string {
  const normalizedPhone = cleanPhoneNumber(phone);
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${normalizedPhone}?text=${encodedText}`;
}
