import { type ViewModelProps, withViewModel } from 'mobx-view-model-react';
import { type ReactNode, Suspense } from 'react';
import { Header } from './components/header';
import { LayoutVM } from './model';

export interface LayoutProps extends ViewModelProps<LayoutVM> {
  children: ReactNode;
}

export const Layout = withViewModel(
  LayoutVM,
  ({ children, model }: LayoutProps) => {
    return (
      <div className="flex min-h-screen w-full flex-col items-center bg-base-bg">
        <Header />
        {model.favorites.loadError ? (
          <div
            role="alert"
            className="mx-4 mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-slate-800 text-sm"
          >
            <span>{model.favorites.loadError}</span>
            <button
              type="button"
              className="rounded-md bg-white px-3 py-1 font-medium text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-50"
              disabled={model.favorites.isLoading}
              onClick={() => void model.favorites.retrySync()}
            >
              Повторить
            </button>
          </div>
        ) : null}
        <div className="flex w-full max-w-[1416px] flex-1 flex-col">
          <Suspense fallback={null}>{children}</Suspense>
        </div>
      </div>
    );
  },
);
