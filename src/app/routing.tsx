import { observer } from 'mobx-react-lite';
import type { Globals } from '../globals';
import { HomePage } from '../pages/home/ui/page';
import { NotFoundPage } from '../pages/not-found/ui/page';
import { ProfilePage } from '../pages/profile/ui/page';

export const Routing = observer(({ globals }: { globals: Globals }) => {
  if (globals.router.history.location.pathname === '/') {
    return <HomePage />;
  }

  if (globals.router.history.location.pathname === '/profile') {
    return <ProfilePage />;
  }

  return <NotFoundPage />;
});
