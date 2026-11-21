import { Star } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import type { ProductPageVM } from '../../model';

export const FeedbackSections = observer(
  ({ model }: { model: ProductPageVM }) => {
    const product = model.product;
    const data = product?.feedback;
    if (!product || !data) return null;
    return (
      <div className="product-sections">
        <section id="description">
          <h2>Описание</h2>
          <p>{data.description}</p>
        </section>
        <section id="reviews">
          <h2>
            Отзывы о товаре <small>{data.reviews.length}</small>
          </h2>
          <div className="reviews-layout">
            <aside aria-label="Распределение оценок">
              <strong>
                {product.rating.toFixed(1)} <Star size={22} />
              </strong>
              {model.reviewDistribution.map(({ stars: n, count }) => {
                return (
                  <div className="rating-bar" key={n}>
                    <span>{n} ★</span>
                    <progress value={count} max={data.reviews.length || 1} />
                    <span>{count}</span>
                  </div>
                );
              })}
            </aside>
            <div>
              <label>
                Сортировка{' '}
                <select
                  value={model.reviewSort}
                  onChange={(e) => model.setReviewSort(e.target.value)}
                >
                  <option value="recent">Сначала новые</option>
                  <option value="high">Сначала с высокой оценкой</option>
                  <option value="low">Сначала с низкой оценкой</option>
                </select>
              </label>
              {model.visibleReviews.map((r) => (
                <article key={r.author}>
                  <header>
                    <b>{r.author}</b>
                    <time dateTime={r.date}>{r.dateLabel}</time>
                  </header>
                  <span
                    className="review-stars"
                    aria-label={`Оценка ${r.stars} из 5`}
                  >
                    {r.starsLabel}
                  </span>
                  <p>{r.text}</p>
                </article>
              ))}
              {model.reviewLimit < data.reviews.length && (
                <button type="button" onClick={model.showMoreReviews}>
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
                <b>{model.shopName}</b>
                <small>Ответ продавца</small>
                <p>{q.answer}</p>
              </div>
            </article>
          ))}
        </section>
      </div>
    );
  },
);
