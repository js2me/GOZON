import { observer } from 'mobx-react-lite';
import type { Globals } from '../globals';
import { HomePage } from '../pages/home/ui/page';
import { NotFoundPage } from '../pages/not-found/ui/page';
import { ProfilePage } from '../pages/profile/ui/page';

export const Routing = observer(({ globals }: { globals: Globals }) => {
  const pathname = globals.router.history.location.pathname;

  if (pathname === '/') {
    return <HomePage />;
  }

  if (pathname === '/profile') {
    return <ProfilePage />;
  }

  return <NotFoundPage />;
});
