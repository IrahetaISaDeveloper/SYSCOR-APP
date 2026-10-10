// Categorías del menú del mesero: las mismas tarjetas que ve el cliente
// (apps/customer/src/constants/menuCategories.js), más "Extras".
//
// El `id` debe coincidir carácter por carácter con lo que el backend guarda en
// `saucer.category` (SAUCER_CATEGORIES del backend). Combos, Bebidas y Extras
// no son platillos: useWaiterMenu les pone esa categoría.
export const MENU_CATEGORIES = [
  { id: 'Combos', label: 'Combos', image: require('../../assets/promo-tacos-pastor.jpg') },
  { id: 'Tacos', label: 'Tacos', image: require('../../assets/taco-pastor-single.jpg') },
  { id: 'Burritos', label: 'Burritos', image: require('../../assets/promo-burrito.jpg') },
  { id: 'Tortas', label: 'Tortas', image: require('../../assets/torta-milanesa.jpg') },
  { id: 'Quesadillas', label: 'Quesadillas', image: require('../../assets/quesadilla-birria.jpg') },
  { id: 'Antojitos', label: 'Antojitos', image: require('../../assets/categories/antojitos.jpg') },
  { id: 'Nachos', label: 'Nachos', image: require('../../assets/categories/nachos.jpg') },
  { id: 'A la plancha', label: 'A la plancha', image: require('../../assets/categories/a-la-plancha.jpg') },
  { id: 'Alitas', label: 'Alitas', image: require('../../assets/categories/alitas.jpg') },
  { id: 'Sopas', label: 'Sopas', image: require('../../assets/categories/sopas.jpg') },
  { id: 'Postres', label: 'Postres', image: require('../../assets/categories/postres.jpg') },
  { id: 'Especiales', label: 'Especiales', image: require('../../assets/categories/especiales.jpg') },
  { id: 'Bebidas', label: 'Bebidas', image: require('../../assets/agua-jamaica.jpg') },
  { id: 'Extras', label: 'Extras', image: require('../../assets/welcome-tacos.jpg') },
];

export default MENU_CATEGORIES;
