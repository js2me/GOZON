import { Grid2X2, MapPin, Search, X } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useViewModel } from 'mobx-view-model-react';
import type { LayoutVM } from '../model';
import { Navbar } from './navbar';

export const Header = observer(() => {
  const model = useViewModel<LayoutVM>();
  return (
    <header className="market-header" ref={model.headerRef}>
      <div className="header-inner">
        <div className="header-main">
          <a href="/" className="wordmark">
            {model.globals.stores.appInfo.appName}
          </a>
          <div className="catalog-control" ref={model.catalogRef}>
            <button
              className="catalog-trigger"
              type="button"
              ref={model.catalogTriggerRef}
              aria-controls="catalog-menu"
              aria-expanded={model.catalogOpen}
              onClick={model.toggleCatalog}
            >
              <span className="catalog-icon" aria-hidden="true">
                <Grid2X2 size={18} />
                <X size={18} />
              </span>
              Каталог
            </button>
            <nav
              id="catalog-menu"
              className="catalog-menu"
              aria-label="Категории"
              inert={!model.catalogOpen}
            >
              {model.globals.stores.category.mainCategories.map((link) => (
                <a key={link.href} href={link.href}>
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
          <form className="market-search" action="/" role="search">
            <span>Везде</span>
            <input
              name="q"
              aria-label="Поиск товаров"
              placeholder="Искать на GOZON"
              type="search"
              defaultValue={model.searchQuery}
            />
            <button type="submit" aria-label="Искать">
              <Search size={21} />
            </button>
          </form>
          <Navbar />
        </div>
        <div className="header-sub">
          <nav aria-label="Разделы магазина">
            <a className="sale-link" href="/?sale=1">
              Распродажа
            </a>
            {model.quickLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
          <span>
            <MapPin size={14} /> Россия <i /> RUB
          </span>
        </div>
      </div>
    </header>
  );
});
