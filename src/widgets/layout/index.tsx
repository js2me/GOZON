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
      <div className="market-shell flex min-h-screen w-full flex-col items-center bg-base-bg">
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
              onClick={() => void model.favorites.refresh()}
            >
              Обновить
            </button>
          </div>
        ) : null}
        <div className="market-content">
          <Suspense fallback={null}>{children}</Suspense>
        </div>
        <footer className="market-footer">
          <a className="wordmark" href="/">
            {model.globals.stores.appInfo.appName}
          </a>
          <nav aria-label="Покупателям">
            {model.navItems.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
        </footer>
      </div>
    );
  },
);
