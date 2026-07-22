import {
  type AnyViewModel,
  type AnyViewModelSimple,
  ViewModelBase,
  type ViewModelParams,
} from 'mobx-view-model';
import type { Globals } from '../..';
import type { ViewModelsStore } from './store';

const MARKER_SYMBOl = Symbol()

export class VM<
  Payload extends AnyObject = EmptyObject,
  ParentViewModel extends AnyViewModel | AnyViewModelSimple | null = null,
  ComponentProps extends AnyObject = AnyObject,
> extends ViewModelBase<Payload, ParentViewModel, ComponentProps> {
  protected override get viewModels(): ViewModelsStore {
    return this.globals.stores.viewModels;
  }

  constructor(
    public globals: Globals,
    params: ViewModelParams<Payload, ParentViewModel, ComponentProps>,
  ) {
    super(params);
  }

  mount() {
    console.log('mount', this.id);
    const result = super.mount();
    return result;
  }

  unmount(): void {
    console.log('unmount', this.id);
    return super.unmount();
  }

  private static [MARKER_SYMBOl] = true

  static is(value: unknown) {
      return !!value && !!(value as typeof VM)[MARKER_SYMBOl]
    }
}
