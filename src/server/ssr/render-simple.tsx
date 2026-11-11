import type { Request, Response } from 'express';
import { prerenderToNodeStream } from 'react-dom/static';
import { App } from '../../app';
import type { ServerSideGlobals } from '../../globals';
import { REACT_REFRESH_PREAMBLE } from './constants';
import { escapeHtmlText, renderHeadMetaTags } from './head-meta';

export const renderSimple = async (
  globals: ServerSideGlobals,
  _req: Request,
  res: Response,
  clientScript: string,
  styleHref?: string,
) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  res.once('close', () => {
    if (!res.writableFinished) {
      controller.abort();
    }
  });

  try {
    let didError = false;
    const { prelude } = await prerenderToNodeStream(<App globals={globals} />, {
      signal: controller.signal,
      onError(error) {
        didError = true;
        console.error('SSR render failed', error);
      },
    });
    prelude.setEncoding('utf8');
    let appHtml = '';
    for await (const chunk of prelude) {
      appHtml += chunk;
    }
    controller.signal.throwIfAborted();
    if (res.destroyed || res.writableEnded) {
      return;
    }
    const dataJson = JSON.stringify(globals.toSnapshot()).replace(
      /</g,
      '\\u003c',
    );

    const head = globals.ssr.head;
    const documentTitle = escapeHtmlText(
      head.title || globals.stores.appInfo.appName,
    );
    const headMeta = renderHeadMetaTags(head);

    res.setHeader('Cache-Control', 'private, no-store');
    res.status(didError ? 500 : globals.ssr.statusCode).send(`<!doctype html>
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
  } catch (error) {
    if (!controller.signal.aborted) {
      console.error('SSR shell failed', error);
    }
    if (!res.destroyed && !res.writableEnded) {
      res
        .status(controller.signal.aborted ? 504 : 500)
        .type('text')
        .end(
          controller.signal.aborted
            ? 'Rendering timed out'
            : 'Rendering failed',
        );
    }
  } finally {
    clearTimeout(timeout);
  }
};
