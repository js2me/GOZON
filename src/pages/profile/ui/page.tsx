import { Link, Skeleton } from '@heroui/react';
import { OrderSummary } from '../../orders/page';
import { X } from 'lucide-react';
import { withViewModel } from 'mobx-view-model-react';
import { ActionButton } from '../../../shared/ui/action-button';
import { ItemCard } from '../../../widgets/item-card';
import { ProfilePageVM } from '../model';

export const ProfilePage = withViewModel(
  ProfilePageVM,
  ({ model }) => {
    return (
      <main className="account-page profile-page">
        <h1>Личный кабинет</h1>
        <section className="mx-auto flex w-full max-w-[1416px] gap-6">
          <aside className="w-[230px] shrink-0 rounded-3xl bg-contrast-bg p-5">
            <div className="mb-6 flex items-start gap-3">
              <div className="profile-avatar">
                {model.ctx.profile.firstName[0]}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-[17px] text-slate-900 leading-[1.02]">
                  {model.ctx.profile.firstName}
                  <br />
                  {model.ctx.profile.lastName}
                </p>
              </div>
            </div>

            {model.menuSections.map((section) => (
              <div key={section.title} className="mb-5">
                <p className="mb-2 font-semibold text-[16px] text-slate-900">
                  {section.title}
                </p>
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-[13px] no-underline transition-colors ${
                          item.active
                            ? 'font-semibold text-slate-900'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                        href={item.href}
                      >
                        <span>{item.label}</span>
                        {item.count ? (
                          <span className="ml-3 rounded-full bg-brand-accent px-1.5 font-bold text-[10px] text-white leading-5">
                            {item.count}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </aside>

          <div className="flex min-w-0 flex-1 flex-col gap-8 profile-sections">
            <section>
              <h2 className="mb-4 font-bold text-[19px] text-slate-900 leading-none">
                Заказы
              </h2>
              <a href="/orders">
                <OrderSummary />
              </a>
            </section>

            <section>
              <h2 className="mb-4 font-bold text-[19px] text-slate-900 leading-none">
                Финансы
              </h2>
              <article className="flex max-w-[350px] items-center justify-between rounded-2xl bg-contrast-bg px-6 py-5 shadow-sm">
                <div>
                  <p className="text-[15px] text-slate-500">GOZON Карта</p>
                  <p className="font-bold text-[20px] text-slate-900 leading-none">
                    239,89 ₽
                  </p>
                </div>
                <ActionButton look="solidBrandRelaxed" text="Пополнить" />
              </article>
            </section>

            <section>
              <h2 className="mb-4 font-bold text-[19px] text-slate-900 leading-none">
                Оцените покупки
              </h2>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                {model.shouldShowRatingSkeletons
                  ? [
                      'rating-skeleton-1',
                      'rating-skeleton-2',
                      'rating-skeleton-3',
                    ].map((skeletonId) => (
                      <article
                        className="relative min-h-[222px] rounded-3xl bg-surface-muted p-5"
                        key={skeletonId}
                      >
                        <Skeleton className="mx-auto mt-2 mb-4 size-17 rounded-2xl" />
                        <Skeleton className="mx-auto h-6 w-4/5 rounded-xl" />
                        <Skeleton className="mx-auto mt-2 h-6 w-3/5 rounded-xl" />
                        <Skeleton className="mx-auto mt-4 h-5 w-1/2 rounded-xl" />
                      </article>
                    ))
                  : null}
                {model.ratingCards.map((item) => (
                  <article
                    key={item.id}
                    className="relative min-h-[222px] rounded-3xl bg-surface-muted p-5"
                  >
                    <ActionButton
                      ariaLabel="Скрыть товар"
                      action={() => model.hideRatingCard(item.id)}
                      className="absolute top-3 right-3"
                      icon={X}
                      iconClassName="size-4"
                      look="ghostMuted"
                    />
                    <img
                      className="mx-auto mt-2 mb-4 size-17 rounded-xl object-cover"
                      src={item.imageSrc}
                      alt=""
                    />
                    <p className="mx-auto max-w-[250px] text-center text-[20px] text-slate-800 leading-[1.1]">
                      {item.title}
                    </p>
                    <p className="mt-4 text-center text-[16px] text-icon-muted">
                      ★★★★★
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-4 font-bold text-[19px] text-slate-900 leading-none">
                Вы смотрели
              </h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
                {model.shouldShowViewedSkeletons
                  ? [
                      'viewed-skeleton-1',
                      'viewed-skeleton-2',
                      'viewed-skeleton-3',
                      'viewed-skeleton-4',
                      'viewed-skeleton-5',
                      'viewed-skeleton-6',
                    ].map((skeletonId) => (
                      <ItemCard
                        activeSlide={0}
                        className="rounded-2xl shadow-sm"
                        key={skeletonId}
                        loading
                      />
                    ))
                  : null}
                {model.viewedCards.map((item) => (
                  <ItemCard
                    activeSlide={0}
                    badge={item.badge}
                    className="rounded-2xl shadow-sm"
                    discount={item.discount}
                    href={`/products/${item.id}`}
                    imageAlt={`${item.brand} ${item.title}`}
                    imageSrc={item.imageSrc}
                    isFavorite={item.isFavorite}
                    onFavoriteClick={() =>
                      void model.toggleViewedFavorite(item.id)
                    }
                    key={item.id}
                    originalPrice={item.originalPrice}
                    price={item.price}
                    title={item.title}
                    titleLines={2}
                  />
                ))}
              </div>
            </section>
          </div>
        </section>
      </main>
    );
  },
  {
    fallback: () => null,
  },
);
