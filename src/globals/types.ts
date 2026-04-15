import type { RouterParams } from './router';
import { AppInfoParams } from './stores/app-info';

export type GlobalsCreateParams = Pick<AppInfoParams, 'appName'> & {
  router?: RouterParams;
};
