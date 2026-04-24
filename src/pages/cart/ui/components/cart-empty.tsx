export function CartEmpty() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-6 text-center">
        <span className="font-bold text-[120px] text-gray-200 leading-none">
          0
        </span>
        <h2 className="font-semibold text-3xl text-gray-800">Корзина пуста</h2>
        <p className="max-w-md text-gray-500">
          Добавьте товары в корзину, чтобы продолжить оформление заказа.
        </p>
        <a
          className="mt-4 rounded-lg bg-brand px-6 py-3 text-white transition-opacity hover:opacity-85"
          href="/"
        >
          Перейти к покупкам
        </a>
      </div>
    </div>
  );
}
