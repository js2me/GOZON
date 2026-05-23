import express from 'express';
import { config } from './config';

const appBase = express();

export const app = appBase as typeof appBase & typeof config;

Object.assign(app, config);
