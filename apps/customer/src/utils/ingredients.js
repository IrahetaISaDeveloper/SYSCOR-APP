// Ingredientes que el cliente puede pedir quitar ("sin cebolla").
//
// Salen de la receta del platillo: solo los que el panel marcó como
// "el cliente puede quitarlo" (`recipe[].removable`).
export const removableOf = (saucer) => [
  ...new Set(
    (saucer?.recipe || [])
      .filter((row) => row?.removable && row?.name?.trim())
      .map((row) => row.name.trim())
  ),
];

// En el carrito se guardan como [{ saucer, ingredients }]: `saucer` es el
// nombre del platillo dentro de un combo, o null si el producto es el mismo
// platillo. Texto corto para la bolsa y los resúmenes:
//   "Sin cebolla, cilantro"  ·  "Taco al pastor: sin cebolla"
export const describeRemovals = (removed = []) =>
  removed
    .filter((group) => group?.ingredients?.length)
    .map((group) => {
      const list = group.ingredients.map((n) => n.toLowerCase()).join(', ');
      return group.saucer ? `${group.saucer}: sin ${list}` : `Sin ${list}`;
    })
    .join(' · ');
