import '../app/bootstrap/server';

import express from 'express';
import ReactDOMServer from 'react-dom/server';
import { App } from '../app';
import { Globals } from '../globals';
import { app } from './app';
import { allProducts } from './data/products';
import path from 'path';


app.use('/dist', express.static(app.distDir));
app.use('/public', express.static(app.publicDir));
app.use('/api/assets', express.static(path.resolve(app.serverDir, 'data/assets')));

app.get('*', async (req, res) => {
  if (req.path === '/api/products') {
    const rawLimit = Number(req.query.limit);
    const rawOffset = Number(req.query.offset);
    const limit = Number.isFinite(rawLimit)
      ? Math.max(1, Math.min(Math.trunc(rawLimit), 100))
      : 20;
    const offset = Number.isFinite(rawOffset)
      ? Math.max(0, Math.trunc(rawOffset))
      : 0;

    const items = allProducts.slice(offset, offset + limit);
    const hasMore = offset + items.length < allProducts.length;
    res.status(200).send(
      JSON.stringify({
        items,
        hasMore,
      }),
    );
    return;
  }

  const globals = new Globals({
    router: {
      history: {
        initialEntries: [req.path],
      },
    },
  });

  const appHtml = ReactDOMServer.renderToString(<App globals={globals} />);
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
    <link rel="stylesheet" href="/dist/styles.css" />
  </head>
  <body>
    <div id="root">${appHtml}</div>
    <script>window.__SSR_DATA__ = ${dataJson};</script>
    <script type="module" src="/dist/client.js"></script>
  </body>
</html>`);
});

app.listen(app.port, () => {
  console.log(`SSR express example running on http://localhost:${app.port}`);
});
