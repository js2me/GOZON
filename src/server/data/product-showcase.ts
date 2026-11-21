import ozonProducts from './ozon-products.json';

import beautyProducts from './beauty-products.json';

interface ShowcaseProduct {
  collections?: string[];
  image: string;
  gallery?: string[];
  title: string;
  category: number;
  color?: string;
  features?: { label: string; value: string }[];
  source?: string;
}

export const productShowcase: readonly ShowcaseProduct[] = [
  { image: '7111870503.webp', title: 'Детский рюкзак с принтом', category: 5 },
  {
    image: '7142368034.webp',
    title: 'Рубашка мужская с длинным рукавом',
    category: 1,
  },
  {
    image: '7157351777.webp',
    title: 'Универсальный переходник для шуруповёрта',
    category: 2,
  },
  { image: '7165032470.webp', title: 'Экстрактор для крепежа', category: 2 },
  { image: '7176018121.webp', title: 'Смесь семян для посадки', category: 2 },
  { image: '7268334982.webp', title: 'Крем-краска для волос', category: 3 },
  { image: '7320026354.webp', title: 'Сумка через плечо мужская', category: 1 },
  {
    image: '7336347880.webp',
    title: 'Бальзам оттеночный для волос, 150 мл',
    category: 3,
  },
  { image: '7449809893.webp', title: 'Влажный корм для кошек', category: 2 },
  {
    image: '7488691838.webp',
    title: 'Лакомство для домашних животных',
    category: 2,
  },
  { image: '7489987186.webp', title: 'Набор кормов для питомцев', category: 2 },
  {
    image: '7504839753.webp',
    title: 'Джинсы мужские прямые голубые',
    category: 1,
  },
  { image: '7515623558.webp', title: 'Брюки карго мужские', category: 1 },
  { image: '7544726654.webp', title: 'Шорты мужские летние', category: 1 },
  {
    image: '7549066810.webp',
    title: 'Игрушечный пистолет детский',
    category: 5,
  },
  {
    image: '7582438591.webp',
    title: 'Стол обеденный круглый белый',
    category: 2,
  },
  {
    image: '7607360777.webp',
    title: 'Кабель для подключения устройств',
    category: 0,
  },
  {
    image: '7632055653.webp',
    title: 'Когтеточка с домиком для кошки',
    category: 2,
  },
  {
    image: '7654241386.webp',
    title: 'Кольцо-держатель, комплект 2 шт.',
    category: 0,
  },
  { image: '7675157851.webp', title: 'Игрушка для кошек «Рыба»', category: 2 },
  { image: '7706524141.webp', title: 'Игрушка для котят, 8 см', category: 2 },
  { image: '7715939748.webp', title: 'Гель для защитного стекла', category: 0 },
  {
    image: '7869603128.webp',
    title: 'Лакомство для кошек в упаковке',
    category: 2,
  },
  { image: '7972646764.webp', title: 'Игрушка для собак зелёная', category: 2 },
  {
    image: '7984084422.webp',
    title: 'Брюки карго мужские широкие Darya Selskaya',
    gallery: [
      'ozon/7984084086.webp',
      'ozon/7984084342.webp',
      'ozon/7984083566.webp',
      'ozon/7984083989.webp',
      'ozon/7984083565.webp',
      'ozon/7984083880.webp',
      'ozon/7984083523.webp',
      'ozon/7984083796.webp',
    ],
    source: 'https://www.ozon.ru/product/2830240807/',
    category: 1,
    color: 'Коричневый',
    features: [
      { label: 'Состав', value: 'Хлопок 100%' },
      { label: 'Сезон', value: 'На любой сезон' },
      { label: 'Пояс', value: 'На резинке' },
      { label: 'Размерный ряд', value: '38–58' },
    ],
  },
  {
    image: '8037569485.webp',
    title: 'Поилка для кошек с подставкой',
    category: 2,
  },
  {
    image: '8151726936.webp',
    title: 'Сублимированное лакомство для кошек и собак',
    category: 2,
  },
  { image: '8153773694.webp', title: 'Швабра для мытья окон', category: 2 },
  {
    image: '8191157995.webp',
    title: 'Беруши многоразовые с футляром',
    category: 3,
  },
  { image: '8214670381.webp', title: 'Водолазка мужская базовая', category: 1 },
  {
    image: '8285909268.webp',
    title: 'Стеллаж угловой для хранения',
    category: 2,
  },
  { image: '8325149935.webp', title: 'Рубашка мужская джинсовая', category: 1 },
  { image: '8346218546.webp', title: 'Шкаф-витрина с дверцами', category: 2 },
  {
    image: '8350289385.webp',
    title: 'Модель автомобиля коллекционная',
    category: 5,
  },
  {
    image: '8397679254.webp',
    title: 'Игрушка для кошек с перьями',
    category: 2,
  },
  {
    image: '8436568447.webp',
    title: 'Свитер мужской с воротником',
    category: 1,
  },
  {
    image: '8464571888.webp',
    title: 'Брюки спортивные свободные',
    category: 4,
  },
  {
    image: '8502408421.webp',
    title: 'Стол регулируемый письменный',
    category: 2,
  },
  { image: '8542969435.webp', title: 'Набор для ухода за зубами', category: 3 },
  { image: '8586889665.webp', title: 'Стол письменный с тумбой', category: 2 },
  {
    image: '8640876794.webp',
    title: 'Кружка с автоматическим перемешиванием',
    category: 2,
  },
  {
    image: '8746960565.webp',
    title: 'Миска для медленного кормления',
    category: 2,
  },
  { image: '8761110539.webp', title: 'Свитшот мужской чёрный', category: 1 },
  {
    image: '8792922974.webp',
    title: 'Заглушки для разъёма Type-C',
    category: 0,
  },
  { image: '8815358129.webp', title: 'Набор цветных ручек', category: 5 },
  {
    image: '8842889041.webp',
    title: 'Обложка для паспорта и карт',
    category: 1,
  },
  {
    image: '8886015617.webp',
    title: 'Очки антибликовые для вождения',
    category: 1,
  },
  {
    image: '9014392099.webp',
    title: 'Кресло компьютерное с подлокотниками',
    category: 2,
  },
  {
    image: '9148386396.webp',
    title: 'Балетная лангетка для стопы',
    category: 4,
  },
  {
    image: '9525716956.webp',
    title: 'Кресло детское регулируемое',
    category: 5,
  },
  {
    image: '9586177606.webp',
    title: 'Шорты спортивные для тренировок',
    category: 4,
  },
  { image: '9688800167.webp', title: 'Блокнот в твёрдой обложке', category: 2 },
  {
    image: '9710821704.webp',
    title: 'Пластилин детский, 12 цветов',
    category: 5,
  },
  {
    image: '9760239168.webp',
    title: 'Салфетки для чистки ушей собак и кошек',
    category: 2,
  },
  ...ozonProducts,
  ...beautyProducts,
];
