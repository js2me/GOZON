import '../app/bootstrap/server';

import http from 'node:http';
import path from 'node:path';
import express from 'express';
import { when } from 'mobx';
import { Globals, ServerSideGlobals } from '../globals';
import { handleApiRequest } from './api';
import { app } from './app';
import { getMainCategories } from './data/categories';
import { getOrCreateSessionId } from './session';
import { renderHtml } from './ssr';
import { createSsrApi } from './ssr/api';

/** Path routes open via reaction; unknown URLs fall back to virtual notFound. */
const waitRouterReady = async (globals: Globals) => {
  const { notFound, ...pathRoutesMap } = globals.router.routes;
  const pathRoutes = Object.values(pathRoutesMap);

  try {
    await when(
      () => pathRoutes.some((route) => route.isOpened || route.isOpening),
      { timeout: 100 },
    );
    await when(
      () => pathRoutes.some((route) => route.isOpened),
      { timeout: 5000 },
    );
  } catch {
    if (!pathRoutes.some((route) => route.isOpened)) {
      await notFound.open();
    }
  }
};

/**
 * Asset / probe URLs must not hit React SSR — otherwise the browser's automatic
 * `/favicon.ico` (and Chrome `/.well-known/...`) mounts NotFoundPageVM in the
 * same terminal log as the real page request.
 */
const isDocumentNavigation = (req: express.Request) => {
  if (req.path.startsWith('/.well-known/')) {
    return false;
  }
  if (/\.[a-z0-9]+$/i.test(req.path) && !req.path.endsWith('.html')) {
    return false;
  }
  const accept = req.headers.accept;
  if (accept && !accept.includes('text/html') && !accept.includes('*/*')) {
    return false;
  }
  return true;
};

async function main() {
  // const tlsOpts = app.isDev ? await generateTlsOptions() : undefined;

  // const httpServer = tlsOpts
  //   ? https.createServer(tlsOpts, app)
  //   :
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

  // app.use(compression);

  app.use(express.json());

  app.use('/dist', express.static(app.distDir));
  app.use('/assets', express.static(path.resolve(app.distDir, 'assets')));
  app.use(express.static(app.publicDir));
  app.use('/public', express.static(app.publicDir));
  app.use(
    '/api/assets',
    express.static(path.resolve(app.serverDir, 'data/assets')),
  );

  app.all('{*path}', async (req, res) => {
    const sessionId = getOrCreateSessionId(req, res);

    if (req.path.startsWith('/api')) {
      return handleApiRequest(req, res, sessionId);
    }

    if (!isDocumentNavigation(req)) {
      return res.status(404).end();
    }

    const ssrApi = createSsrApi(sessionId);
    const globals = new Globals({
      appName: 'GOZON',
      mainCategories: getMainCategories(),
      router: {
        history: {
          initialEntries: [req.path],
        },
      },
      ssr: ssrApi,
    }) as ServerSideGlobals;

    await waitRouterReady(globals);

    return renderHtml(globals, req, res);
  });

  httpServer.listen(app.port, () => {
    console.log(`SSR express example running on https://localhost:${app.port}`);
  });
}

void main();
