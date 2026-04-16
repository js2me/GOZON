import type { Request, Response } from 'express';
import type { Globals } from '../../globals';
import { app } from '../app';
import { renderSimple } from './render-simple';
import { renderWithStreams } from './render-with-streams';

export const renderHtml = (globals: Globals, req: Request, res: Response) => {
  const clientScript = app.isDev ? '/src/client.tsx' : '/dist/client.js';
  const styleHref = app.isDev ? '/src/app/styles.css' : '/dist/styles.css';

  if (app.renderUsingStreams) {
    return renderWithStreams(globals, req, res, clientScript, styleHref);
  }

  return renderSimple(globals, req, res, clientScript, styleHref);
};
