import type { AnyObject } from 'yummies/types';
import type { SSRApi } from '../server/api/types';
import type { RouterParams } from './router';
import type { AppInfoParams } from './stores/app-info';
import type { MainCategory } from './stores/category';

export type GlobalsCreateParams = Pick<AppInfoParams, 'appName'> & {
  router?: RouterParams;
  ssr?: SSRApi;
  pageContexts?: AnyObject;
  mainCategories?: MainCategory[];
};
