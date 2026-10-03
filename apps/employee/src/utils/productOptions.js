// Reglas para personalizar un producto, iguales a las de la app de clientes
// (apps/customer/src/utils/ingredients.js, extraTargets.js, drinkUpgrade.js)
// y a las que el backend vuelve a comprobar al crear la comanda.

const idOf = (item, fallback) => String(item?._id?.$oid || item?._id || fallback);

// Bebidas de la casa: en un combo siempre se pueden pedir en vez de la incluida.
export const HOUSE_DRINK_CATEGORY = 'casa';
export const DRINKS_TARGET = 'Bebidas';

// Ingredientes que se pueden pedir quitar ("sin cebolla"): los que el panel
// marcó como removibles en la receta del platillo.
export const removableOf = (saucer) => [
  ...new Set(
    (saucer?.recipe || [])
      .filter((row) => row?.removable && row?.name?.trim())
      .map((row) => row.name.trim())
  ),
];

// Tipos de platillo de un producto, para saber qué extras le tocan.
const targetsForProduct = (itemType, product) => {
  if (itemType === 'drink') return [DRINKS_TARGET];
  if (itemType === 'saucer') return product?.category ? [product.category] : [];
  if (itemType === 'combo') {
    const saucers = [...(product?.saucers || []), ...(product?.selectiveOptions || [])];
    return [...new Set(saucers.map((s) => s?.saucerId?.category).filter(Boolean))];
  }
  return [];
};

export const extrasForProduct = (extras, itemType, product) => {
  const targets = targetsForProduct(itemType, product);
  if (targets.length === 0) return [];
  return (extras || []).filter((extra) => (extra.appliesTo || []).some((t) => targets.includes(t)));
};

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

export const formatMoney = (n) => `$${(Number(n) || 0).toFixed(2)}`;

// Bebidas que se pueden elegir en un combo: las incluidas (sin costo) y,
// después, las de la casa pagando la diferencia con la incluida más barata.
// Misma regla que el backend (utils/drinks/drinkUpgradeUtils.js), que la
// vuelve a calcular al crear la comanda.
export const drinkOptionsOf = (combo, houseDrinks) => {
  const policy = combo?.drinkPolicy || {};
  const included = [
    ...(policy.drinkSetIds || []).flatMap((set) => set?.drinkIds || []),
    ...(policy.thirdPartyDrinkIds || []),
  ].filter(Boolean);
  if (included.length === 0) return [];

  const seen = new Set();
  const options = [];
  included.forEach((drink, i) => {
    const id = idOf(drink, `drink-${i}`);
    if (seen.has(id)) return;
    seen.add(id);
    options.push({ id, drink, included: true, surcharge: 0 });
  });
  const cheapestIncluded = Math.min(...included.map((d) => Number(d.price) || 0));
  (houseDrinks || []).forEach((drink, i) => {
    const id = idOf(drink, `house-${i}`);
    if (seen.has(id)) return;
    seen.add(id);
    options.push({ id, drink, included: false, surcharge: Math.max(0, round2((Number(drink.price) || 0) - cheapestIncluded)) });
  });
  return options;
};

// Platillos de un producto que se pueden personalizar (quitar ingredientes o
// agregar extras). En un combo: los fijos más los elegidos.
export const dishesOf = (itemType, product, extras, pickedOptionIds = []) => {
  if (!product) return [];
  if (itemType !== 'combo') {
    return [
      {
        key: 'main',
        name: null,
        ingredients: itemType === 'saucer' ? removableOf(product) : [],
        extras: extrasForProduct(extras, itemType, product),
      },
    ].filter((d) => d.ingredients.length || d.extras.length);
  }
  const fixed = (product.saucers || []).map((entry, i) => ({ key: `fixed-${i}`, saucer: entry?.saucerId }));
  const picked = (product.selectiveOptions || [])
    .map((opt, i) => ({ key: idOf(opt, `opt-${i}`), saucer: opt?.saucerId }))
    .filter((entry) => pickedOptionIds.includes(entry.key));
  return [...fixed, ...picked]
    .filter(({ saucer }) => saucer)
    .map(({ key, saucer }) => ({
      key,
      name: saucer.name || 'Platillo',
      ingredients: removableOf(saucer),
      extras: (extras || []).filter((extra) => (extra.appliesTo || []).includes(saucer.category)),
    }))
    .filter((d) => d.ingredients.length || d.extras.length);
};

// ¿Tiene algo que elegir? Entonces al tocarlo se abre la personalización.
export const isCustomizable = (itemType, product, extras, houseDrinks) => {
  if (itemType === 'extra') return false;
  if ((product?.sauces || []).length) return true;
  if (itemType === 'combo') {
    if (product?.selective && (product.selectiveOptions || []).length) return true;
    if (drinkOptionsOf(product, houseDrinks).length > 1) return true;
    const allPicked = (product?.selectiveOptions || []).map((opt, i) => idOf(opt, `opt-${i}`));
    return dishesOf(itemType, product, extras, allPicked).length > 0;
  }
  return dishesOf(itemType, product, extras).length > 0;
};

// Renglones legibles de la personalización, para la orden y el resumen:
//   ["Elegido: Taco al pastor", "Bebida: Horchata", "Taco al pastor: sin cebolla", ...]
export const describeCustomization = (custom) => {
  if (!custom) return [];
  const rows = [];
  const picks = (custom.selectedSelectiveItems || []).map((p) => p.name).filter(Boolean);
  if (picks.length) rows.push(`Elegido: ${picks.join(', ')}`);
  if (custom.selectedDrinkName) rows.push(`Bebida: ${custom.selectedDrinkName}`);
  if ((custom.selectedSauces || []).length) rows.push(`Salsas: ${custom.selectedSauces.join(', ')}`);
  for (const group of custom.removedIngredients || []) {
    if (!group.ingredients?.length) continue;
    const list = group.ingredients.map((n) => n.toLowerCase()).join(', ');
    rows.push(group.saucer ? `${group.saucer}: sin ${list}` : `Sin ${list}`);
  }
  const extras = custom.selectedExtras || [];
  if (extras.length) {
    rows.push(`Con: ${extras.map((e) => (e.forSaucer ? `${e.name} (${e.forSaucer})` : e.name)).join(', ')}`);
  }
  return rows;
};

// Ingredientes de la receta, para que el mesero se los lea al cliente. Todos
// (no solo los que se pueden quitar), sin repetir.
export const ingredientsOf = (item) => [
  ...new Set((item?.recipe || []).map((row) => row?.name?.trim()).filter(Boolean)),
];

// Ingredientes agrupados por platillo: uno solo para un platillo o bebida; en
// un combo, uno por cada platillo fijo y cada opción elegible.
export const ingredientGroupsOf = (itemType, product) => {
  if (!product) return [];
  if (itemType !== 'combo') {
    const list = ingredientsOf(product);
    return list.length ? [{ key: 'main', name: null, ingredients: list }] : [];
  }
  const entries = [...(product.saucers || []), ...(product.selectiveOptions || [])];
  const seen = new Set();
  return entries
    .map((entry) => entry?.saucerId)
    .filter((saucer) => saucer && !seen.has(String(saucer._id)) && seen.add(String(saucer._id)))
    .map((saucer) => ({ key: String(saucer._id), name: saucer.name || 'Platillo', ingredients: ingredientsOf(saucer) }))
    .filter((g) => g.ingredients.length);
};
