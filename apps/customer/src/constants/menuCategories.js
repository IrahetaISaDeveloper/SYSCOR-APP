// Categorías de platillos del menú.
//
// Son exactamente las que el panel de administración ofrece al crear un
// platillo (ver DISH_CATEGORIES en AddDishModal.jsx y SAUCER_CATEGORIES en
// AddComboModal.jsx del sistema web). El valor de `id` debe coincidir
// carácter por carácter con lo que el backend guarda en `saucer.category`,
// porque el filtro es una comparación directa.
//
// La imagen es la que se ve en la tarjeta del menú. Mientras el backend no
// devuelva una foto por categoría, se usan las locales que ya trae la app.
export const MENU_CATEGORIES = [
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
    id: 'Sopas',
    label: 'Sopas',
    image: require('../../assets/quesadilla-birria.png'),
  },
  {
    id: 'Especiales',
    label: 'Especiales',
    image: require('../../assets/promo-tacos-pastor.png'),
  },
];

export default MENU_CATEGORIES;
