import type { ViewModelResource } from 'mobx-view-model';

export class PageContextResource implements ViewModelResource {
  private contexts: AnyObject;

  constructor(contexts?: AnyObject) {
    this.contexts = { ...contexts };
  }

  read(id: string) {
    return this.contexts[id];
  }

  save(id: string, context: unknown) {
    this.contexts[id] = context;
  }

  snapshot(): AnyObject {
    return { ...this.contexts };
  }
}
