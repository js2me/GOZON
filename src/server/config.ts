import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fakerRU as faker } from '@faker-js/faker';
import dotenv from 'dotenv';

const port = Number(process.env.PORT ?? 6473);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../../public');
const srcDir = path.resolve(process.cwd(), 'src');
const serverDir = path.resolve(process.cwd(), 'src/server');
const distDir = path.resolve(process.cwd(), 'dist');

dotenv.config();

export const config = {
  faker,
  port,
  publicDir,
  distDir,
  srcDir,
  serverDir,
  isDev: process.env.NODE_ENV !== 'production',
  renderUsingStreams: true,
  useLocalDevtools: process.env.USE_LOCAL_VM_DEVTOOLS === 'true',
};