import { observer } from 'mobx-react-lite';
import type { Globals } from '../globals';
import { HomePage } from '../pages/home/ui/page';
import { NotFoundPage } from '../pages/not-found/ui/page';
import { ProfilePage } from '../pages/profile/ui/page';
import { RouteView, RouteViewGroup } from 'mobx-route/react';
import { Layout } from '../widgets/layout';
import React from 'react';
import { AnyRoute } from 'mobx-route';


const resolveRouteView = (route: AnyRoute, Component: React.ComponentType) => 
  route.isOpening ? null : <Component />

export const Routing = observer(({ globals }: { globals: Globals }) => {
  return (
    <RouteViewGroup layout={Layout}>
      <RouteView route={globals.router.routes.home} view={HomePage} />
      <RouteView route={globals.router.routes.profile} view={ProfilePage} />
      <RouteView route={globals.router.routes.notFound} view={NotFoundPage} />
    </RouteViewGroup>
  )
});
