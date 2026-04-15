import { Request, Response } from "express";
import { Globals } from "../globals";
import { PassThrough } from "stream";
import { renderToPipeableStream } from "react-dom/server";
import { App } from "../app";
import { app } from "./app";


export const renderHtml = (globals: Globals, req: Request, res: Response) => {
  const clientScript = app.isDev ? '/src/client.tsx' : '/dist/client.js';
  const styleHref = app.isDev ? '/src/app/styles.css' : '/dist/styles.css';

  const dataJson = JSON.stringify(globals.toSnapshot()).replace(
    /</g,
    '\\u003c',
  );

  const htmlHead = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${globals.stores.appInfo.title}</title>
    <link rel="stylesheet" href="${styleHref}" />
  </head>
  <body>
    <div id="root">`;

  // В dev без index.html Vite не вызывает transformIndexHtml — нужен preamble для Fast Refresh
  // (см. getPreambleCode в @vitejs/plugin-react). Иначе: "can't detect preamble".
  const reactRefreshPreamble = app.isDev
    ? `<script type="module">
  import { injectIntoGlobalHook } from "/@react-refresh";
  injectIntoGlobalHook(window);
  window.$RefreshReg$ = () => {};
  window.$RefreshSig$ = () => (type) => type;
</script>
`
    : '';

  const htmlTail = `</div>
    ${reactRefreshPreamble}
    <script>window.__SSR_DATA__ = ${dataJson};</script>
    <script type="module" src="${clientScript}"></script>
  </body>
</html>`;

  res.status(200);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  const pass = new PassThrough();
  pass.pipe(res, { end: false });

  res.write(htmlHead);

  let shellErrored = false;

  const { pipe, abort } = renderToPipeableStream(
    <App globals={globals} />, {
    onShellReady() {
      pipe(pass);
    },
    onShellError(error) {
      shellErrored = true;
      console.error(error);
      abort();
      if (!res.writableEnded) {
        res.end();
      }
    },
    onError(error) {
      console.error(error);
    },
  });

  pass.on('end', () => {
    if (!shellErrored) {
      res.write(htmlTail);
    }
    if (!res.writableEnded) {
      res.end();
    }
  });

  pass.on('error', (error) => {
    console.error(error);
    if (!res.writableEnded) {
      res.end();
    }
  });
}