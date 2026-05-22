import { observer } from 'mobx-react-lite';
import { RouteView, RouteViewGroup } from 'mobx-route/react';
import { lazy, Suspense } from 'react';
import type { Globals } from '../globals';
import { Layout } from '../widgets/layout';

const HomePage = lazy(() =>
  import('../pages/home/ui/page').then((module) => ({
    default: module.HomePage,
  })),
);

const ProfilePage = lazy(() =>
  import('../pages/profile/ui/page').then((module) => ({
    default: module.ProfilePage,
  })),
);

const CartPage = lazy(() =>
  import('../pages/cart/ui/page').then((module) => ({
    default: module.CartPage,
  })),
);

const CategoryPage = lazy(() =>
  import('../pages/category/ui/page').then((module) => ({
    default: module.CategoryPage,
  })),
);

const ProductPage = lazy(() =>
  import('../pages/product/ui/page').then((module) => ({
    default: module.ProductPage,
  })),
);

const NotFoundPage = lazy(() =>
  import('../pages/not-found/ui/page').then((module) => ({
    default: module.NotFoundPage,
  })),
);

export const Routing = observer(({ globals }: { globals: Globals }) => {
  return (
    <Suspense fallback={null}>
      <RouteViewGroup layout={Layout}>
        <RouteView route={globals.router.routes.home} view={HomePage} />
        <RouteView route={globals.router.routes.profile} view={ProfilePage} />
        <RouteView route={globals.router.routes.cart} view={CartPage} />
        <RouteView route={globals.router.routes.category} view={CategoryPage} />
        <RouteView route={globals.router.routes.product} view={ProductPage} />
        <RouteView route={globals.router.routes.notFound} view={NotFoundPage} />
      </RouteViewGroup>
    </Suspense>
  );
});
