import { PassThrough, pipeline, Readable } from 'node:stream';
import type { Request, Response } from 'express';
import { renderToPipeableStream } from 'react-dom/server';
import { asyncTemplate as html } from 'yummies/async';
import { App } from '../../app';
import type { ServerSideGlobals } from '../../globals';
import { REACT_REFRESH_PREAMBLE } from './constants';
import { escapeHtmlText, renderHeadMetaTags } from './head-meta';

export const renderWithStreams = (
  globals: ServerSideGlobals,
  _req: Request,
  res: Response,
  clientScript: string,
  styleHref?: string,
) => {
  const ssrData = async () => {
    const snapshot = globals.toSnapshot();
    return JSON.stringify(snapshot).replace(/</g, '\\u003c');
  };

  const appStream = new PassThrough();
  let didError = false;
  let abort: (() => void) | undefined;
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(504).type('text').end('Rendering timed out');
    } else {
      res.destroy();
    }
    abort?.();
    appStream.destroy();
  }, 15_000);

  res.once('close', () => {
    clearTimeout(timeout);
    if (!res.writableFinished) {
      abort?.();
      appStream.destroy();
    }
  });

  const stream = renderToPipeableStream(<App globals={globals} />, {
    onAllReady() {
      clearTimeout(timeout);
      if (res.destroyed || res.writableEnded) {
        return;
      }
      // Page models finish async loading before HTTP status and head are committed.
      const head = globals.ssr.head;
      const documentTitle = escapeHtmlText(
        head.title || globals.stores.appInfo.appName,
      );
      const headMeta = renderHeadMetaTags(head);
      res.status(didError ? 500 : globals.ssr.statusCode);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'private, no-store');

      const template = html`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${documentTitle}</title>
${headMeta ? `${headMeta}\n` : ''}    <link rel="icon" type="image/png" href="/logo.png" />
${styleHref ? `    <link rel="stylesheet" href="${styleHref}" />\n` : ''}  </head>
  <body>
    <div id="root">${appStream}</div>
    ${REACT_REFRESH_PREAMBLE}
    <script>window.__SSR_DATA__ = ${ssrData};</script>
    <script type="module" async src="${clientScript}"></script>
  </body>
</html>`;

      pipeline(Readable.from(template), res, (error) => {
        clearTimeout(timeout);
        if (error) {
          abort?.();
          appStream.destroy();
        }
      });
      stream.pipe(appStream);
    },
    onShellError(error) {
      console.error('SSR shell failed', error);
      clearTimeout(timeout);
      if (!res.destroyed && !res.writableEnded) {
        res.status(500).type('text').end('Rendering failed');
      }
      appStream.destroy();
    },
    onError(error) {
      didError = true;
      console.error('SSR render failed', error);
    },
  });
  abort = stream.abort;
};
