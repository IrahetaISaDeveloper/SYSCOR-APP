// Categorías de platillos del menú.
//
// Son exactamente las que acepta el backend (SAUCER_CATEGORIES en
// utils/saucers/saucerCategoriesUtils.js). El valor de `id` debe coincidir
// carácter por carácter con lo que el backend guarda en `saucer.category`,
// porque el filtro es una comparación directa. El orden de esta lista es el
// orden de las tarjetas en el menú.
//
// La imagen es la portada de la tarjeta. Las de `assets/categories/` son fotos
// de Pexels (licencia libre, uso comercial sin atribución obligatoria).
export const MENU_CATEGORIES = [
  // Los combos no son platillos: vienen de /menu/combos y useMenu les pone
  // esta categoría.
  {
    id: 'Combos',
    label: 'Combos',
    image: require('../../assets/promo-tacos-pastor.png'),
  },
  {
    id: 'Tacos',
    label: 'Tacos',
    image: require('../../assets/taco-pastor-single.png'),
  },
  {
    id: 'Burritos',
    label: 'Burritos',
    image: require('../../assets/promo-burrito.png'),
  },
  {
    id: 'Tortas',
    label: 'Tortas',
    image: require('../../assets/torta-milanesa.png'),
  },
  {
    id: 'Quesadillas',
    label: 'Quesadillas',
    image: require('../../assets/quesadilla-birria.png'),
  },
  {
    id: 'Antojitos',
    label: 'Antojitos',
    image: require('../../assets/categories/antojitos.jpg'),
  },
  {
    id: 'Nachos',
    label: 'Nachos',
    image: require('../../assets/categories/nachos.jpg'),
  },
  {
    id: 'A la plancha',
    label: 'A la plancha',
    image: require('../../assets/categories/a-la-plancha.jpg'),
  },
  {
    id: 'Alitas',
    label: 'Alitas',
    image: require('../../assets/categories/alitas.jpg'),
  },
  {
    id: 'Sopas',
    label: 'Sopas',
    image: require('../../assets/categories/sopas.jpg'),
  },
  {
    id: 'Postres',
    label: 'Postres',
    image: require('../../assets/categories/postres.jpg'),
  },
  {
    id: 'Especiales',
    label: 'Especiales',
    image: require('../../assets/categories/especiales.jpg'),
  },
];

export default MENU_CATEGORIES;
