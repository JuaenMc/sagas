import { ViaCepResponse } from '../types';

/**
 * Normaliza o CEP removendo qualquer caractere não numérico
 */
export function cleanCep(cep: string): string {
  return (cep || '').replace(/\D/g, '');
}

/**
 * Formata um CEP no padrão brasileiro '00000-000'
 */
export function formatCep(cep: string): string {
  const digits = cleanCep(cep).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

/**
 * Consulta a API pública do ViaCEP
 * @param rawCep CEP com ou sem formatação
 * @returns Dados do endereço ou null se não encontrado
 */
export async function fetchAddressByCep(rawCep: string): Promise<ViaCepResponse | null> {
  const digits = cleanCep(rawCep);
  if (digits.length !== 8) {
    throw new Error('O CEP deve conter exatamente 8 dígitos numéricos.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

  try {
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Erro ao consultar ViaCEP: status ${response.status}`);
    }

    const data: ViaCepResponse = await response.json();

    if (data.erro) {
      return null; // CEP não localizado na base dos Correios
    }

    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('A consulta do CEP demorou muito para responder. Tente novamente.');
    }
    throw error;
  }
}
