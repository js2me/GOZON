import { Star } from 'lucide-react';
import { useState } from 'react';
import type { ProductDC } from '../../../../shared/api/api';

export function FeedbackSections({
  product,
  shop,
}: {
  product: ProductDC;
  shop: string;
}) {
  const [sort, setSort] = useState('recent');
  const [limit, setLimit] = useState(3);
  const data = product.feedback;
  if (!data) return null;
  const reviews = [...data.reviews].sort((a, b) =>
    sort === 'recent'
      ? b.date.localeCompare(a.date)
      : sort === 'high'
        ? b.stars - a.stars
        : a.stars - b.stars,
  );
  return (
    <div className="product-sections">
      <section id="description">
        <h2>Описание</h2>
        <p>{data.description}</p>
      </section>
      <section id="reviews">
        <h2>
          Отзывы о товаре <small>{reviews.length}</small>
        </h2>
        <div className="reviews-layout">
          <aside aria-label="Распределение оценок">
            <strong>
              {product.rating.toFixed(1)} <Star size={22} />
            </strong>
            {[5, 4, 3, 2, 1].map((n) => {
              const count = reviews.filter((r) => r.stars === n).length;
              return (
                <div className="rating-bar" key={n}>
                  <span>{n} ★</span>
                  <progress value={count} max={reviews.length || 1} />
                  <span>{count}</span>
                </div>
              );
            })}
          </aside>
          <div>
            <label>
              Сортировка{' '}
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setLimit(3);
                }}
              >
                <option value="recent">Сначала новые</option>
                <option value="high">Сначала с высокой оценкой</option>
                <option value="low">Сначала с низкой оценкой</option>
              </select>
            </label>
            {reviews.slice(0, limit).map((r) => (
              <article key={r.author}>
                <header>
                  <b>{r.author}</b>
                  <time dateTime={r.date}>
                    {new Date(r.date).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      timeZone: 'UTC',
                    })}
                  </time>
                </header>
                <span
                  className="review-stars"
                  aria-label={`Оценка ${r.stars} из 5`}
                >
                  {'★'.repeat(r.stars)}
                  {'☆'.repeat(5 - r.stars)}
                </span>
                <p>{r.text}</p>
              </article>
            ))}
            {limit < reviews.length && (
              <button type="button" onClick={() => setLimit(limit + 3)}>
                Показать ещё отзывы
              </button>
            )}
          </div>
        </div>
      </section>
      <section id="questions">
        <h2>
          Вопросы и ответы <small>{data.questions.length}</small>
        </h2>
        {data.questions.map((q) => (
          <article key={q.question}>
            <header>
              <b>{q.author}</b>
            </header>
            <p>{q.question}</p>
            <div className="seller-answer">
              <b>{shop}</b>
              <small>Ответ продавца</small>
              <p>{q.answer}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
