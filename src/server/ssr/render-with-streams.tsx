import type { Request, Response } from 'express';
import { renderToPipeableStream } from 'react-dom/server';
import { PassThrough, Readable } from 'stream';
import { asyncTemplate } from 'yummies/async';
import { App } from '../../app';
import type { Globals } from '../../globals';
import { REACT_REFRESH_PREAMBLE } from './constants';

export const renderWithStreams = (
  globals: Globals,
  req: Request,
  res: Response,
  clientScript: string,
  styleHref: string,
) => {
  const dataJson = JSON.stringify(globals.toSnapshot()).replace(
    /</g,
    '\\u003c',
  );

  res.status(200);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', `max-age=${60 * 60 * 24 * 15}`);

  const appStream = new PassThrough();

  const template = asyncTemplate`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${globals.stores.appInfo.title}</title>
    <link rel="stylesheet" href="${styleHref}" />
  </head>
  <body>
    <div id="root">${appStream}</div>
    ${REACT_REFRESH_PREAMBLE}
    <script>window.__SSR_DATA__ = ${dataJson};</script>
    <script type="module" src="${clientScript}"></script>
  </body>
</html>`;

  Readable.from(template).pipe(res);

  const { pipe } = renderToPipeableStream(<App globals={globals} />, {
    async onShellReady() {
      await globals.stores.viewModels.waitUnitMountAllViews();
      pipe(appStream);
    },
  });
};
