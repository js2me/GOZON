import { Link } from '@heroui/react';
import { ChevronDown, LayoutGridIcon, SearchIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useViewModel } from 'mobx-view-model-react';
import { ActionButton } from '../../../shared/ui/action-button';
import type { LayoutVM } from '../model';
import { Navbar } from './navbar';

export const Header = observer(() => {
  const model = useViewModel<LayoutVM>();
  const { appName } = model.globals.stores.appInfo;

  return (
    <>
      <header
        className="sticky top-0 z-20 flex w-full max-w-[1416px] flex-col items-center justify-center rounded-b-[32px] bg-contrast-bg px-4 py-4"
        ref={model.headerRef}
      >
        <div className="mx-auto -mt-2 flex w-full items-center gap-3">
          <Link
            aria-label={appName}
            className="shrink-0 no-underline"
            href={model.appNameLink}
          >
            <span className="font-black text-[38px] text-brand uppercase leading-none tracking-[-0.08em]">
              {appName}
            </span>
          </Link>

          <ActionButton
            action={() => {}}
            icon={LayoutGridIcon}
            iconClassName="size-4"
            text="Каталог"
            view="headerCatalog"
          />

          <div className="flex min-w-0 flex-1 items-center overflow-hidden rounded-xl border-2 border-brand bg-contrast-bg">
            <ActionButton action={() => {}} className="ml-1" view="headerScope">
              <span>Везде</span>
              <ChevronDown className="size-3.5" />
            </ActionButton>
            <div className="flex min-w-0 flex-1 items-center px-3">
              <input
                aria-label={`Искать на ${appName}`}
                className="h-10 min-w-0 flex-1 border-none bg-transparent text-slate-700 text-sm outline-none placeholder:text-slate-400"
                placeholder={`Искать на ${appName}`}
                type="text"
              />
            </div>
            <ActionButton
              action={() => {}}
              ariaLabel="Искать"
              icon={SearchIcon}
              iconClassName="size-4"
              view="headerSearch"
            />
          </div>
          <Navbar />
        </div>
      </header>
      <div
        className={
          'mx-auto -mt-7 flex w-full max-w-[1416px] items-center gap-4 overflow-x-auto rounded-b-[32px] bg-contrast-bg px-4 py-4 pt-9 text-slate-500 text-xs'
        }
      >
        {model.quickLinks.map(({ href, label }) => (
          <Link
            key={label}
            className="shrink-0 font-medium text-slate-500 no-underline transition-colors hover:text-slate-900"
            href={href}
          >
            {label}
          </Link>
        ))}
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <span className="text-slate-400 text-xs">Пункт GOZ0N</span>
          <ActionButton
            action={() => {}}
            text="Выберите адрес"
            view="headerAddressLink"
          />
        </div>
      </div>
    </>
  );
});
