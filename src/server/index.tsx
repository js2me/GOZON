import '../app/bootstrap/server';

import express from 'express';
import http from 'node:http';
import { Globals } from '../globals';
import { app } from './app';
import path from 'path';
import { handleApiRequest } from './api';
import { renderHtml } from './ssr';


function sendHtmlPage(
  req: express.Request,
  res: express.Response,
  clientScript: string,
  styleHref: string,
) {
}

async function main() {
  const httpServer = http.createServer(app);

  if (app.isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      root: process.cwd(),
      server: {
        middlewareMode: { server: httpServer },
      },
      appType: 'custom',
    });
    app.use(vite.middlewares);
  }

  app.use('/dist', express.static(app.distDir));
  app.use('/public', express.static(app.publicDir));
  app.use('/api/assets', express.static(path.resolve(app.serverDir, 'data/assets')));


  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return handleApiRequest(req, res);
    }

    const globals = new Globals({
      appName: app.isDev ? 'GOZON(dev)' : 'GOZON',
      router: {
        history: {
          initialEntries: [req.path],
        },
      },
    });

    return renderHtml(globals, req, res);
  });

  httpServer.listen(app.port, () => {
    console.log(`SSR express example running on http://localhost:${app.port}`);
  });
}

void main();
