/* ==============================================
   SYRYM — Service catalog & contact configuration
   Замените значения CONTACT на реальные перед публикацией.
   ============================================== */

// === НАСТРОЙКИ КОНТАКТОВ ===
window.SYRYM_CONFIG = {
  phone: '+77716547799',
  phoneDisplay: '8 771 654 77 99',
  whatsapp: '77716547799',
  telegram: 'syrym_bot',         // TODO: уточнить username бота / личного аккаунта
  city: 'Атырау',
  address: 'ул. Курмангазы, 116а',
  hours: '9:00 — 19:00, без выходных',
  experience: '25+ лет в сфере услуг'
};

// === КАТАЛОГ УСЛУГ ===
window.SYRYM_SERVICES = [
  {
    id: 'full',
    title: 'Полная организация похорон',
    text: 'Берём на себя все хлопоты «под ключ»: документы, транспорт, омовение, кафен, могила, жаназа, поминки.',
    icon: 'shield'
  },
  {
    id: 'transport',
    title: 'Катафалк и перевозка',
    text: 'Транспортировка по городу и между регионами. Перевозка из больниц и моргов. Международная репатриация.',
    icon: 'truck'
  },
  {
    id: 'gusl',
    title: 'Омовение по обычаям',
    text: 'Гусл (омовение) с соблюдением канонов Ислама. Мужской и женский персонал. Закрытое помещение.',
    icon: 'droplet'
  },
  {
    id: 'kafen',
    title: 'Кафен и принадлежности',
    text: 'Полный комплект кафена для мужчин и женщин. Носилки, табыт, погребальные принадлежности.',
    icon: 'package'
  },
  {
    id: 'janaza',
    title: 'Жаназа и услуги муллы',
    text: 'Организация жаназа-намаза. Опытные муллы, чтение Корана, проведение всех религиозных обрядов.',
    icon: 'book'
  },
  {
    id: 'grave',
    title: 'Могила и захоронение',
    text: 'Подготовка могилы на любом кладбище города. Профессиональная бригада. Помощь с участком.',
    icon: 'mountain'
  },
  {
    id: 'asberu',
    title: 'Организация поминок (Ас беру)',
    text: 'Зал, повара, обслуживание гостей. 7, 40 дней, годовщина. Меню по казахским традициям.',
    icon: 'users'
  },
  {
    id: 'monument',
    title: 'Памятники и оградки',
    text: 'Изготовление и установка памятников из гранита и мрамора. Гравировка, портреты, оградки.',
    icon: 'square',
    link: 'monument/',
    badge: '3D Конструктор'
  },
  {
    id: 'wreaths',
    title: 'Венки, цветы, ритуальная атрибутика',
    text: 'Траурные венки, корзины, ленты с надписями. Свечи, ароматические принадлежности.',
    icon: 'flower'
  }
];

// === SVG ИКОНКИ (Lucide-style stroke 1.8) ===
window.SYRYM_ICONS = {
  shield: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>',
  truck:  '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="6" width="15" height="11" rx="1"/><path d="M16 9h4l3 3v5h-7"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>',
  droplet:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
  package:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
  book:   '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  mountain:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3l4 8 5-5 5 15H2L8 3z"/></svg>',
  users:  '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  square: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="2"/><line x1="10" y1="8" x2="14" y2="8"/><line x1="10" y1="12" x2="14" y2="12"/></svg>',
  flower: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 9V2M12 22v-7M9 12H2M22 12h-7M5.6 5.6l4.95 4.95M13.45 13.45l4.95 4.95M5.6 18.4l4.95-4.95M13.45 10.55l4.95-4.95"/></svg>'
};
