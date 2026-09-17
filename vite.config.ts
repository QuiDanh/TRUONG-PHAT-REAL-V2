import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import {handleDevApi} from './src/api/devServer.ts';

function devApiPlugin(): Plugin {
  return {
    name: 'dev-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/v1')) {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', () => {
            let parsedBody = {};
            if (body) {
              try {
                parsedBody = JSON.parse(body);
              } catch {
                parsedBody = {};
              }
            }

            const response = handleDevApi(req.url!, req.method || 'GET', req.headers, parsedBody);
            res.statusCode = response.status;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            if ((response as any).headers) {
              for (const [k, v] of Object.entries((response as any).headers)) {
                res.setHeader(k, v as string);
              }
            }
            res.end(JSON.stringify(response.body));
          });
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig(({mode}) => {
  const isMockEnabled = process.env.VITE_ENABLE_MOCK_API === 'true';
  const plugins = [react(), tailwindcss()];
  if (isMockEnabled) {
    plugins.push(devApiPlugin());
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
