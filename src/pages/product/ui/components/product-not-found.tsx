import { Link } from '@heroui/react';

export const ProductNotFound = () => {
  return (
    <main className="w-full bg-base-bg py-8">
      <section className="mx-auto w-full max-w-[1416px] px-4">
        <div className="rounded-3xl bg-contrast-bg p-10 text-center">
          <h1 className="font-bold text-[22px] text-slate-900">
            Товар не найден
          </h1>
          <p className="mt-3 text-slate-500">
            Проверьте ссылку или вернитесь на главную страницу.
          </p>
          <Link
            className="mt-5 inline-flex text-link-primary no-underline"
            href="/"
          >
            Перейти к каталогу
          </Link>
        </div>
      </section>
    </main>
  );
};
