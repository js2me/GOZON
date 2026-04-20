import '../app/bootstrap/server';

import http from 'node:http';
import express from 'express';
import path from 'path';
import { Globals } from '../globals';
import { handleApiRequest } from './api';
import { app } from './app';
import { renderHtml } from './ssr';
import { createSsrApi } from './ssr/api';

async function main() {
  const httpServer = http.createServer(app);

  if (app.isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      root: process.cwd(),
      server: {
        middlewareMode: { server: httpServer },
        hmr: { server: httpServer },
      },
      appType: 'custom',
    });
    app.use(vite.middlewares);
  }

  app.use('/dist', express.static(app.distDir));
  app.use('/public', express.static(app.publicDir));
  app.use(
    '/api/assets',
    express.static(path.resolve(app.serverDir, 'data/assets')),
  );

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return handleApiRequest(req, res);
    }

    const ssrApi = createSsrApi(req);
    const globals = new Globals({
      appName: 'GOZON',
      router: {
        history: {
          initialEntries: [req.path],
        },
      },
      ssr: ssrApi,
    });

    return renderHtml(globals, req, res);
  });

  httpServer.listen(app.port, () => {
    console.log(`SSR express example running on http://localhost:${app.port}`);
  });
}

void main();
