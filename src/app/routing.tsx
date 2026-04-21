import { observer } from 'mobx-react-lite';
import type { Globals } from '../globals';
import { CartPage } from '../pages/cart/ui/page';
import { HomePage } from '../pages/home/ui/page';
import { NotFoundPage } from '../pages/not-found/ui/page';
import { ProfilePage } from '../pages/profile/ui/page';
import { ProductPage } from '../pages/product/ui/page';
import { RouteView, RouteViewGroup } from 'mobx-route/react';
import { Layout } from '../widgets/layout';

export const Routing = observer(({ globals }: { globals: Globals }) => {
  return (
    <RouteViewGroup layout={Layout}>
      <RouteView route={globals.router.routes.home} view={HomePage} />
      <RouteView route={globals.router.routes.profile} view={ProfilePage} />
      <RouteView route={globals.router.routes.cart} view={CartPage} />
      <RouteView route={globals.router.routes.product} view={ProductPage} />
      <RouteView route={globals.router.routes.notFound} view={NotFoundPage} />
    </RouteViewGroup>
  )
});
