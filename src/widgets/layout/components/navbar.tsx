import { Link } from '@heroui/react';
import { observer } from 'mobx-react-lite';
import { useViewModel } from 'mobx-view-model-react';
import type { LayoutVM } from '../model';

export const Navbar = observer(() => {
  const model = useViewModel<LayoutVM>();

  return (
    <nav
      aria-label="Быстрые действия"
      className="ml-auto hidden items-end gap-6 xl:flex"
    >
      {model.navItems.map(({ badge, href, icon: Icon, label }) => (
        <Link
          key={label}
          className="relative flex min-w-[68px] flex-col items-center gap-1.5 text-slate-500 no-underline transition-colors hover:text-slate-900"
          href={href}
        >
          <span className="relative flex items-center justify-center">
            <Icon className="size-6" />
            {badge ? (
              <span className="absolute -top-2 -right-4 inline-flex min-w-5 items-center justify-center rounded-full bg-danger-badge px-1.5 font-bold text-[10px] text-white leading-5">
                {badge}
              </span>
            ) : null}
          </span>
          <span className="font-medium text-xs leading-none">{label}</span>
        </Link>
      ))}
    </nav>
  );
});
