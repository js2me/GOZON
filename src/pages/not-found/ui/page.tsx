import { withViewModel } from 'mobx-view-model-react';
import { NotFoundPageVM } from '../model';

export const NotFoundPage = withViewModel(NotFoundPageVM, ({ model }) => {
  return (
    <main className="account-page">
      <div className="empty-panel">
        <span className="not-found-number">404</span>
        <h1 className="font-semibold text-3xl text-gray-800">
          Страница не найдена
        </h1>
        <p className="max-w-md text-gray-500">
          К сожалению, запрашиваемая страница не существует или была перемещена.
        </p>
        <p className="text-gray-400 text-xs">{model.labels.server}</p>
        <p className="text-gray-400 text-xs">{model.labels.user}</p>
        <a
          href="/"
          className="mt-4 rounded-lg bg-brand px-6 py-3 text-white transition-opacity hover:opacity-85"
        >
          Вернуться на главную
        </a>
      </div>
    </main>
  );
});
