import { makeObservable, observable } from 'mobx';
import type { Router } from '../../router';

export interface AppInfoParams {
  router: Router;
  appName?: string;
  bankName?: string;
  title?: string;
}

export class AppInfoStore {
  appName: string;
  bankName: string;

  constructor(private params: AppInfoParams) {
    this.appName = params.appName ?? 'GOZ0N';
    this.bankName = params.bankName ?? this.appName;

    makeObservable(this, {
      appName: observable,
    });
  }
}
