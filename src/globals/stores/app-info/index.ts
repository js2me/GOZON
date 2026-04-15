import { makeObservable, observable } from 'mobx';
import type { Router } from '../../router';

export interface AppInfoParams {
  router: Router;
  appName?: string;
}

export class AppInfoStore {
  appName: string;
  title: string;

  constructor(private params: AppInfoParams) {
    this.appName = params.appName ?? 'GOZ0N';
    this.title = this.appName;

    makeObservable(this, {
      appName: observable,
      title: observable,
    });
  }

  setTitle(title: string) {
    if (typeof window === 'undefined') {
      this.title = title;
    } else {
      globalThis.document.title = title;
    }
  }
}
