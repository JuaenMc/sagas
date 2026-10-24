/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração essencial da Opção 1: Next.js + Capacitor
  // Gera arquivos estáticos (HTML/CSS/JS) na pasta 'out' para o Capacitor empacotar no APK
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  reactStrictMode: true,
};

export default nextConfig;
