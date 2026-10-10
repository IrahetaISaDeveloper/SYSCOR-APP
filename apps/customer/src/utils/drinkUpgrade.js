// Cambio de bebida dentro de un combo. Misma regla que el backend
// (SYSCOR-backEnd: utils/drinks/drinkUpgradeUtils.js), que la vuelve a
// calcular al cobrar.
//
// El combo incluye sin costo las bebidas que el admin eligió para él. Además
// siempre se ofrecen las bebidas de la casa, pagando la diferencia (las
// embotelladas solo salen si el admin las incluyó):
//
//   recargo = precio de la bebida elegida − precio de la incluida más barata
//
// Nunca es negativo: si la elegida cuesta lo mismo o menos, no se cobra.

export const HOUSE_DRINK_CATEGORY = 'casa';

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

export const drinkSurchargeFor = (includedDrinks, drink) => {
  const prices = (includedDrinks || []).map((d) => Number(d.price) || 0);
  if (prices.length === 0) return 0;
  return Math.max(0, round2((Number(drink?.price) || 0) - Math.min(...prices)));
};
