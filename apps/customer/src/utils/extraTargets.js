// Qué extras se le ofrecen a cada producto. Misma regla que el backend
// (SYSCOR-backEnd: utils/extras/extraTargetsUtils.js), que la vuelve a
// comprobar al cobrar.
//
// Cada extra trae `appliesTo`: los tipos de platillo a los que aplica (las
// categorías de los platillos, más "Bebidas"). Un extra sin tipos no se
// ofrece en ningún lado.
export const DRINKS_TARGET = 'Bebidas';

// Tipos de un producto: la categoría del platillo, las de los platillos de un
// combo, o "Bebidas".
export const targetsForProduct = (productType, product) => {
  if (productType === 'drink') return [DRINKS_TARGET];
  if (productType === 'saucer') return product?.category ? [product.category] : [];
  if (productType === 'combo') {
    const saucers = [...(product?.saucers || []), ...(product?.selectiveOptions || [])];
    return [...new Set(saucers.map((s) => s?.saucerId?.category).filter(Boolean))];
  }
  return [];
};

export const extrasForProduct = (extras, productType, product) => {
  const targets = targetsForProduct(productType, product);
  if (targets.length === 0) return [];
  return (extras || []).filter((extra) => (extra.appliesTo || []).some((t) => targets.includes(t)));
};
