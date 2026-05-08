import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import type { Connect } from 'vite';
import { defineConfig } from 'vite';
import { shortenUrl } from './lib/shorten-url';

function shortenApiMiddleware(): Connect.NextHandleFunction {
  return (req, res, next) => {
    const path = req.url?.split('?')[0] ?? '';
    if (path !== '/api/shorten' || req.method !== 'POST') {
      next();
      return;
    }

    let raw = '';
    req.on('data', (c: Buffer | string) => {
      raw += typeof c === 'string' ? c : c.toString();
    });
    req.on('end', () => {
      void (async () => {
        try {
          const parsed = JSON.parse(raw || '{}') as { url?: string };
          const shortUrl = await shortenUrl(
            typeof parsed.url === 'string' ? parsed.url : '',
          );
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ shortUrl }));
        } catch (e) {
          const message = e instanceof Error ? e.message : '短縮に失敗しました';
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: message }));
        }
      })();
    });
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'shorten-api-dev',
      configureServer(server) {
        server.middlewares.use(shortenApiMiddleware());
      },
    },
  ],
});
