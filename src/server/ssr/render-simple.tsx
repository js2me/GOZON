import type { Request, Response } from 'express';
import { renderToString } from 'react-dom/server';
import { App } from '../../app';
import type { ServerSideGlobals } from '../../globals';
import { REACT_REFRESH_PREAMBLE } from './constants';
import { escapeHtmlText, renderHeadMetaTags } from './head-meta';

export const renderSimple = (
  globals: ServerSideGlobals,
  _req: Request,
  res: Response,
  clientScript: string,
  styleHref?: string,
) => {
  const appHtml = renderToString(<App globals={globals} />);
  const dataJson = JSON.stringify(globals.toSnapshot()).replace(
    /</g,
    '\\u003c',
  );

  const head = globals.ssr.head;
  const documentTitle = escapeHtmlText(
    head.title || globals.stores.appInfo.appName,
  );
  const headMeta = renderHeadMetaTags(head);

  res.status(200).send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${documentTitle}</title>
${headMeta ? `${headMeta}\n` : ''}
<link rel="icon" type="image/png" href="/logo.png" />
${styleHref ? `    <link rel="stylesheet" href="${styleHref}" />\n` : ''}
  </head>
  <body>
    <div id="root">${appHtml}</div>
    ${REACT_REFRESH_PREAMBLE}
    <script>window.__SSR_DATA__ = ${dataJson};</script>
    <script type="module" src="${clientScript}"></script>
  </body>
</html>`);
};
