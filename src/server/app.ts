


import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fakerRU as faker } from '@faker-js/faker';

const port = Number(process.env.PORT ?? 6473);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');
const srcDir = path.resolve(process.cwd(), 'src');
const serverDir = path.resolve(process.cwd(), 'src/server');
const distDir = path.resolve(process.cwd(), 'dist');

faker.seed(120);

const appBase = express();

export const config = {
  faker,
  port,
  publicDir,
  distDir,
  srcDir,
  serverDir,
}

export const app = appBase as (typeof appBase & typeof config);

Object.assign(app, config);