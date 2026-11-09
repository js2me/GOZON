// @vitest-environment node
import { createServer, type Server } from 'node:http';
import express from 'express';
import { createElement, type ReactNode, Suspense, use } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ServerSideGlobals } from '../../globals';
import { createSsrApi } from './api';
import { renderSimple } from './render-simple';
import { renderWithStreams } from './render-with-streams';

const { renderPage } = vi.hoisted(() => ({ renderPage: vi.fn() }));
vi.mock('../../app', () => ({
  App: ({ globals }: { globals: ServerSideGlobals }) => renderPage(globals),
}));

describe.each([
  { name: 'streaming', render: renderWithStreams },
  { name: 'buffered', render: renderSimple },
])('$name renderer', ({ render }) => {
  let server: Server;
  let baseUrl: string;

  async function startServer() {
    const app = express();
    app.get('/', (req, res) => {
      const pageContext: { title?: string } = {};
      const globals = {
        ssr: createSsrApi('render-test'),
        stores: { appInfo: { appName: 'GOZON' } },
        pageContext,
        toSnapshot: () => ({ pageContext }),
      } as unknown as ServerSideGlobals;
      void render(globals, req, res, '/client.js');
    });
    server = createServer(app);
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const address = server.address();
    if (!address || typeof address === 'string')
      throw new Error('Missing server port');
    baseUrl = `http://127.0.0.1:${address.port}`;
  }

  afterEach(async () => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    server?.closeAllConnections();
    if (server)
      await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('commits the status and head after suspended page loading finishes', async () => {
    const data = Promise.withResolvers<void>();
    const started = Promise.withResolvers<void>();
    function Page({ globals }: { globals: ServerSideGlobals }) {
      started.resolve();
      use(data.promise);
      globals.ssr.statusCode = 404;
      globals.ssr.head.title = 'Товар не найден';
      (
        globals as ServerSideGlobals & { pageContext: { title: string } }
      ).pageContext.title = 'Товар не найден';
      return createElement('main', null, 'Товар не найден');
    }
    renderPage.mockImplementation((globals) =>
      createElement(
        Suspense,
        { fallback: 'Loading' },
        createElement(Page, { globals }),
      ),
    );
    await startServer();
    const request = fetch(baseUrl);
    await started.promise;
    data.resolve();
    const response = await request;
    expect(response.status).toBe(404);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    const body = await response.text();
    expect(body).toContain('<title>Товар не найден</title>');
    expect(body).toContain('<main>Товар не найден</main>');
    expect(body).toContain('"pageContext":{"title":"Товар не найден"}');
  });

  it('returns 500 for shell errors', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    renderPage.mockImplementation(() => {
      throw new Error('Broken page');
    });
    await startServer();
    const response = await fetch(baseUrl);
    expect(response.status).toBe(500);
    expect(await response.text()).toBe('Rendering failed');
  });

  it('returns 500 when an error occurs within a suspense boundary', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    function BrokenPage(): ReactNode {
      throw new Error('Broken page');
    }
    renderPage.mockImplementation(() =>
      createElement(
        Suspense,
        { fallback: 'Failed' },
        createElement(BrokenPage),
      ),
    );
    await startServer();
    const response = await fetch(baseUrl);
    expect(response.status).toBe(500);
    expect(await response.text()).toContain('Failed');
  });

  it('aborts a page that exceeds the render timeout', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const started = Promise.withResolvers<void>();
    const never = new Promise<void>(() => {});
    function SlowPage() {
      started.resolve();
      use(never);
      return null;
    }
    renderPage.mockImplementation(() =>
      createElement(Suspense, { fallback: 'Loading' }, createElement(SlowPage)),
    );
    await startServer();
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const request = fetch(baseUrl);
    await started.promise;
    await vi.advanceTimersByTimeAsync(15_000);
    const response = await request;
    expect(response.status).toBe(504);
    expect(await response.text()).toBe('Rendering timed out');
  });

  it('aborts suspended work when the client disconnects', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const started = Promise.withResolvers<void>();
    const never = new Promise<void>(() => {});
    function SlowPage() {
      started.resolve();
      use(never);
      return null;
    }
    renderPage.mockImplementation(() =>
      createElement(Suspense, { fallback: 'Loading' }, createElement(SlowPage)),
    );
    await startServer();
    const controller = new AbortController();
    const request = fetch(baseUrl, { signal: controller.signal });
    await started.promise;
    controller.abort();
    await expect(request).rejects.toThrow();
    await vi.waitFor(() =>
      expect(error).toHaveBeenCalledWith(
        'SSR render failed',
        expect.any(Error),
      ),
    );
  });
});
