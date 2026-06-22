import type { Request, Response } from 'express';
import { renderToPipeableStream } from 'react-dom/server';
import { PassThrough, Readable } from 'stream';
import { asyncTemplate as html } from 'yummies/async';
import { App } from '../../app';
import type { ServerSideGlobals } from '../../globals';
import { app } from '../app';
import { config } from '../config';
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

  const head = globals.ssr.head;
  const documentTitle = escapeHtmlText(
    head.title || globals.stores.appInfo.appName,
  );
  const headMeta = renderHeadMetaTags(head);

  res.status(200);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  if (!app.isDev) {
    res.setHeader('Cache-Control', `max-age=${60 * 60 * 24 * 15}`);
  }

  const appStream = new PassThrough();

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
    <script src="${config.useLocalDevtools ? 'http://127.0.0.1:15000/auto.global.js' : 'https://unpkg.com/mobx-view-model-devtools/auto.global.js'}" async></script>
  </body>
</html>`;

  Readable.from(template).pipe(res);

  const { pipe } = renderToPipeableStream(<App globals={globals} />, {
    onShellReady() {
      pipe(appStream);
    },
  });
};
