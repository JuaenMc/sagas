import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      {
        name: 'sagas-agentic-seo-headers',
        configureServer(server) {
          server.middlewares.use((_req, res, next) => {
            res.setHeader(
              'Link',
              '<https://erpsagas.onrender.com/api/v2/agent/openapi.json>; rel="service-desc"; type="application/openapi+json", <https://sagas.moda/sitemap-structured.xml>; rel="sitemap"'
            );
            next();
          });
        },
      },
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
