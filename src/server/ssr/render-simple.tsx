import type { Request, Response } from 'express';
import { renderToString } from 'react-dom/server';
import { App } from '../../app';
import type { Globals } from '../../globals';
import { REACT_REFRESH_PREAMBLE } from './constants';

export const renderSimple = (
  globals: Globals,
  req: Request,
  res: Response,
  clientScript: string,
  styleHref: string,
) => {
  const appHtml = renderToString(<App globals={globals} />);
  const dataJson = JSON.stringify(globals.toSnapshot()).replace(
    /</g,
    '\\u003c',
  );

  res.status(200).send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${globals.stores.appInfo.title}</title>
    <link rel="stylesheet" href="${styleHref}" />
  </head>
  <body>
    <div id="root">${appHtml}</div>
    ${REACT_REFRESH_PREAMBLE}
    <script>window.__SSR_DATA__ = ${dataJson};</script>
    <script type="module" src="${clientScript}"></script>
  </body>
</html>`);
};
