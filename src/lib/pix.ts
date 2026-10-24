/**
 * Gerador de Payload Pix Padrão Banco Central (BR Code)
 * Permite copiar e colar no app de qualquer banco brasileiro (Nubank, Inter, Bradesco, Itaú, etc.)
 */

function formatField(id: string, value: string): string {
  const len = String(value.length).padStart(2, '0');
  return `${id}${len}${value}`;
}

function calculateCRC16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export interface PixPayloadParams {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount?: number;
  txId?: string;
}

export function generatePixBrCode({
  pixKey,
  merchantName,
  merchantCity,
  amount,
  txId = '***'
}: PixPayloadParams): string {
  // Limpeza de caracteres especiais para padrão BACEN
  const cleanName = (merchantName || 'JUAN JOSE MANCILLA')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .slice(0, 25);

  const cleanCity = (merchantCity || 'SAO PAULO')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .slice(0, 15);

  const cleanKey = pixKey.trim();

  // 26: Merchant Account Information (GUI + Key)
  const gui = formatField('00', 'br.gov.bcb.pix');
  const key = formatField('01', cleanKey);
  const merchantAccountInfo = formatField('26', `${gui}${key}`);

  let payload = 
    formatField('00', '01') + // Format indicator
    formatField('01', amount ? '12' : '11') + // Static vs Dynamic
    merchantAccountInfo +
    formatField('52', '0000') + // Merchant Category Code
    formatField('53', '986'); // Currency BRL

  if (amount && amount > 0) {
    payload += formatField('54', amount.toFixed(2));
  }

  payload += 
    formatField('58', 'BR') + // Country
    formatField('59', cleanName) + // Name
    formatField('60', cleanCity); // City

  // Additional Data (TxID)
  const additionalData = formatField('05', txId);
  payload += formatField('62', additionalData);

  // 63: CRC16
  payload += '6304';
  const crc = calculateCRC16(payload);

  return `${payload}${crc}`;
}
