import type { Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import type { Globals } from '../../globals';
import { app } from '../app';
import { renderSimple } from './render-simple';
import { renderWithStreams } from './render-with-streams';

type ViteManifest = Record<
  string,
  {
    file: string;
    css?: string[];
  }
>;

const resolveProdAssets = () => {
  const manifestPath = path.resolve(app.distDir, '.vite/manifest.json');
  const manifest = JSON.parse(
    fs.readFileSync(manifestPath, 'utf-8'),
  ) as ViteManifest;
  const entry = manifest['src/client.tsx'];

  if (!entry) {
    throw new Error('Vite manifest entry for src/client.tsx is missing');
  }

  return {
    clientScript: `/${entry.file}`,
    styleHref: entry.css?.[0] ? `/${entry.css[0]}` : undefined,
  };
};

export const renderHtml = (globals: Globals, req: Request, res: Response) => {
  const { clientScript, styleHref } = app.isDev
    ? { clientScript: '/src/client.tsx', styleHref: '/src/app/styles.css' }
    : resolveProdAssets();

  if (app.renderUsingStreams) {
    return renderWithStreams(globals, req, res, clientScript, styleHref);
  }

  return renderSimple(globals, req, res, clientScript, styleHref);
};
