import '../app/bootstrap/server';

import http from 'node:http';
import express from 'express';
import path from 'node:path';
import { Globals } from '../globals';
import { handleApiRequest } from './api';
import { app } from './app';
import { getOrCreateSessionId } from './session';
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

  app.use(express.json());

  app.use('/dist', express.static(app.distDir));
  app.use('/assets', express.static(path.resolve(app.distDir, 'assets')));
  // Files in src/public are available at /filename (and at /public/filename for compatibility)
  app.use(express.static(app.publicDir));
  app.use('/public', express.static(app.publicDir));
  app.use(
    '/api/assets',
    express.static(path.resolve(app.serverDir, 'data/assets')),
  );

  app.all('*', (req, res) => {
    const sessionId = getOrCreateSessionId(req, res);

    if (req.path.startsWith('/api')) {
      return handleApiRequest(req, res, sessionId);
    }

    const ssrApi = createSsrApi(sessionId);
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
