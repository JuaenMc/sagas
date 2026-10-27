/**
 * erpClient.ts - Re-exporta e mantém compatibilidade com apiClient.ts
 */
export * from './apiClient';
import { apiClient } from './apiClient';

export const erpClient = apiClient;
export default erpClient;
