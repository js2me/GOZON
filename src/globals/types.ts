import { AnyObject } from 'yummies/types';
import type { SsrApi } from '../server/api/types';
import type { RouterParams } from './router';
import type { AppInfoParams } from './stores/app-info';

export type GlobalsCreateParams = Pick<AppInfoParams, 'appName'> & {
  router?: RouterParams;
  db?: SsrApi;
  pageContexts?: AnyObject;
};
