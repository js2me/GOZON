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
          <p role="alert" className="px-4 py-2 text-red-600">
            {model.favorites.loadError}
          </p>
        ) : null}
        <div className="flex w-full max-w-[1416px] flex-1 flex-col">
          <Suspense fallback={null}>{children}</Suspense>
        </div>
      </div>
    );
  },
);
