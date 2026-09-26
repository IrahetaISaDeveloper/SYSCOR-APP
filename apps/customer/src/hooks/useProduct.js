import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { getComboById, getDrinkById, getSaucerById, getActiveExtras, getDrinksList } from '../services/api';
import { extrasForProduct } from '../utils/extraTargets';
import { removableOf } from '../utils/ingredients';
import { drinkSurchargeFor, HOUSE_DRINK_CATEGORY } from '../utils/drinkUpgrade';

const idOf = (item, fallback) => item?._id?.$oid || item?._id || fallback;

// Toda la lógica de la pantalla ProductDetails: carga del producto/extras,
// selección de opciones (combo armable, bebida, salsas, ingredientes y extras
// de cada platillo) y cálculo de precios. El componente solo llama a este
// hook y pinta el JSX.
export const useProduct = ({ route, onAddToCart, navigation, productIdProp, itemTypeProp }) => {
  const {
    comboId,
    drinkId,
    saucerId,
    id,
    productId,
    _id,
    itemType: itemTypeParam,
  } = route?.params || {};

  const itemType = itemTypeParam || itemTypeProp || 'combo';

  // Si no llega ningún ID, la API trae el primer producto disponible de ese tipo.
  const activeId = comboId || drinkId || saucerId || id || productId || _id || productIdProp || null;

  // Estados de carga e información
  const [productData, setProductData] = useState(null);
  const [availableExtras, setAvailableExtras] = useState([]);
  // Bebidas de la casa: en un combo siempre se pueden pedir en vez de la
  // incluida, pagando la diferencia.
  const [houseDrinks, setHouseDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Estados de selección del usuario
  const [quantity, setQuantity] = useState(1);
  const [selectedDrinkId, setSelectedDrinkId] = useState(null);
  const [selectedSauces, setSelectedSauces] = useState([]);
  // Lo que el cliente cambió de cada platillo (ver `dishes`):
  //   removedByDish: { [clave]: ['Cebolla', ...] }  (ingredientes quitados)
  //   extrasByDish:  { [clave]: ['<id del extra>', ...] }
  const [removedByDish, setRemovedByDish] = useState({});
  const [extrasByDish, setExtrasByDish] = useState({});
  const [selectedSelectiveItems, setSelectedSelectiveItems] = useState([]);

  // Notificación flotante para avisos de validación
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });
  const showToast = (message, type = 'error') => setToast({ visible: true, message, type });
  const hideToast = () => setToast((t) => ({ ...t, visible: false }));

  // Petición a la API backend
  const fetchProductAndExtras = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      let productRes = null;

      if (itemType === 'drink') {
        productRes = await getDrinkById(activeId);
      } else if (itemType === 'saucer') {
        productRes = await getSaucerById(activeId);
      } else {
        productRes = await getComboById(activeId);
      }

      if (!productRes || !productRes.success || !productRes.data) {
        throw new Error(productRes?.error || 'No se pudo obtener la información del producto.');
      }

      setProductData(productRes.data);

      // Solo los extras que le tocan a este producto: "Extra kétchup" sale en
      // las alitas, no en los tacos (ver utils/extraTargets). Si fallan los
      // extras o las bebidas, el producto se puede pedir igual.
      const [extrasRes, drinksRes] = await Promise.all([
        getActiveExtras(),
        itemType === 'combo' ? getDrinksList() : Promise.resolve(null),
      ]);
      if (extrasRes.success && Array.isArray(extrasRes.data)) {
        setAvailableExtras(extrasForProduct(extrasRes.data, itemType, productRes.data));
      }
      if (drinksRes?.success && Array.isArray(drinksRes.data)) {
        setHouseDrinks(drinksRes.data.filter((d) => d.category === HOUSE_DRINK_CATEGORY));
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductAndExtras();
  }, [activeId, itemType]);

  // Selección de opciones selectivas (combos armables)
  const handleToggleSelectiveOption = (optionId) => {
    const maxPicks = productData?.selectiveMaxPicks || 1;

    setSelectedSelectiveItems((prev) => {
      const exists = prev.includes(optionId);
      if (exists) {
        return prev.filter((itemId) => itemId !== optionId);
      }
      if (prev.length >= maxPicks) {
        showToast(`Solo puedes seleccionar hasta ${maxPicks} opciones para este combo.`);
        return prev;
      }
      return [...prev, optionId];
    });
  };

  // Agregar / quitar un extra a un platillo
  const handleToggleExtra = (dishKey, extraId) => {
    setExtrasByDish((prev) => {
      const current = prev[dishKey] || [];
      const next = current.includes(extraId) ? current.filter((x) => x !== extraId) : [...current, extraId];
      return { ...prev, [dishKey]: next };
    });
  };

  // Quitar / volver a poner un ingrediente de un platillo
  const handleToggleIngredient = (dishKey, name) => {
    setRemovedByDish((prev) => {
      const current = prev[dishKey] || [];
      const next = current.includes(name) ? current.filter((n) => n !== name) : [...current, name];
      return { ...prev, [dishKey]: next };
    });
  };

  // Selección de Salsas
  const handleToggleSauce = (sauceName) => {
    setSelectedSauces((prev) => {
      const exists = prev.includes(sauceName);
      if (exists) {
        return prev.filter((s) => s !== sauceName);
      }
      return [...prev, sauceName];
    });
  };

  // ── Opciones según el modelo del backend ──

  const selectiveOptions = productData?.selectiveOptions || [];
  const saucesOptions = productData?.sauces || [];
  // Platillos fijos del combo (los que no se eligen).
  const fixedSaucers =
    itemType === 'combo' ? (productData?.saucers || []).map((entry) => entry?.saucerId).filter(Boolean) : [];

  // Bebidas: las que el admin incluyó en el combo (sin costo) y, después, las
  // de la casa que no estén ya incluidas, con la diferencia de precio
  // (utils/drinkUpgrade).
  const drinkOptions = useMemo(() => {
    const policy = productData?.drinkPolicy || {};
    const included = [
      ...(policy.drinkSetIds || []).flatMap((set) => set?.drinkIds || []),
      ...(policy.thirdPartyDrinkIds || []),
    ].filter(Boolean);
    if (included.length === 0) return [];

    const seen = new Set();
    const options = [];
    included.forEach((drink, i) => {
      const key = String(idOf(drink, `drink-${i}`));
      if (seen.has(key)) return;
      seen.add(key);
      options.push({ id: key, drink, included: true, surcharge: 0 });
    });
    houseDrinks.forEach((drink, i) => {
      const key = String(idOf(drink, `house-${i}`));
      if (seen.has(key)) return;
      seen.add(key);
      options.push({ id: key, drink, included: false, surcharge: drinkSurchargeFor(included, drink) });
    });
    return options;
  }, [productData, houseDrinks]);

  const selectedDrink = drinkOptions.find((opt) => opt.id === selectedDrinkId) || null;
  const drinkSurcharge = selectedDrink?.surcharge || 0;

  // Platillos que el cliente puede personalizar (quitar ingredientes o
  // agregar extras). Un platillo suelto es uno solo; en un combo son los que
  // trae fijos más los que el cliente eligió (un platillo deseleccionado deja
  // de salir, y lo que se le cambió no cuenta). A cada platillo del combo solo
  // se le ofrecen los extras de su categoría.
  const dishes = useMemo(() => {
    if (!productData) return [];
    if (itemType !== 'combo') {
      return [
        {
          key: 'main',
          name: null,
          image: null,
          ingredients: itemType === 'saucer' ? removableOf(productData) : [],
          extras: availableExtras,
        },
      ].filter((d) => d.ingredients.length || d.extras.length);
    }
    const fixed = (productData.saucers || []).map((entry, i) => ({
      key: `fixed-${i}`,
      saucer: entry?.saucerId,
    }));
    const picked = selectiveOptions
      .map((opt, i) => ({ key: idOf(opt, `opt-${i}`), saucer: opt?.saucerId }))
      .filter((entry) => selectedSelectiveItems.includes(entry.key));
    return [...fixed, ...picked]
      .filter(({ saucer }) => saucer)
      .map(({ key, saucer }) => ({
        key,
        name: saucer.name || 'Platillo',
        image: saucer.image || null,
        ingredients: removableOf(saucer),
        extras: availableExtras.filter((extra) => (extra.appliesTo || []).includes(saucer.category)),
      }))
      .filter((d) => d.ingredients.length || d.extras.length);
  }, [productData, itemType, availableExtras, selectiveOptions, selectedSelectiveItems]);

  // Lo que se va al carrito: [{ saucer, ingredients }] (ver utils/ingredients).
  const removedIngredients = dishes
    .map((d) => ({
      saucer: d.name,
      ingredients: (removedByDish[d.key] || []).filter((n) => d.ingredients.includes(n)),
    }))
    .filter((g) => g.ingredients.length);

  // Extras elegidos, con el platillo al que van (en un combo).
  const selectedExtras = dishes.flatMap((d) =>
    d.extras
      .filter((extra) => (extrasByDish[d.key] || []).includes(extra._id))
      .map((extra) => ({ ...extra, forSaucer: d.name }))
  );

  // Cálculo de Precios
  const extrasTotal = selectedExtras.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const unitPrice = productData ? (Number(productData.price) || 0) + drinkSurcharge + extrasTotal : 0;
  const totalAmount = unitPrice * quantity;

  // Manejador del botón "Agregar al Carrito"
  const handleAddToCartPress = () => {
    const requiredPicks = productData?.selectiveMaxPicks || 1;

    if (productData?.selective && selectedSelectiveItems.length < requiredPicks) {
      const missing = requiredPicks - selectedSelectiveItems.length;
      showToast(
        missing === requiredPicks
          ? `Selecciona ${requiredPicks} opciones para continuar.`
          : `Te falta${missing === 1 ? '' : 'n'} ${missing} opción${missing === 1 ? '' : 'es'} por elegir.`
      );
      return;
    }

    const payload = {
      productType: itemType,
      productId: productData._id,
      name: productData.name,
      imageUrl: productData.image,
      quantity,
      unitPrice,
      totalPrice: totalAmount,
      selectedDrinkId: selectedDrink ? selectedDrink.id : null,
      // Para la bolsa: "Horchata (+$1.25)". El backend recalcula el recargo.
      selectedDrinkName: selectedDrink?.drink?.name || null,
      drinkSurcharge,
      selectedSauces,
      // Con nombre: cocina ve "Elegido: Taco al pastor" y no el id.
      selectedSelectiveItems: selectiveOptions
        .map((opt, i) => ({ optionId: idOf(opt, `opt-${i}`), name: opt.saucerId?.name }))
        .filter((pick) => selectedSelectiveItems.includes(pick.optionId)),
      removedIngredients,
      selectedExtras: selectedExtras.map((e) => ({
        extraId: e._id,
        name: e.name,
        price: e.price,
        forSaucer: e.forSaucer,
      })),
    };

    if (onAddToCart) {
      onAddToCart(payload);
    } else {
      Alert.alert('Éxito', `${productData.name} agregado al carrito.`);
      navigation?.goBack();
    }
  };

  return {
    loading,
    errorMessage,
    productData,
    quantity,
    setQuantity,
    selectedDrinkId,
    setSelectedDrinkId,
    selectedDrink,
    drinkSurcharge,
    selectedSauces,
    selectedExtras,
    extrasTotal,
    selectedSelectiveItems,
    removedByDish,
    extrasByDish,
    removedIngredients,
    dishes,
    toast,
    hideToast,
    unitPrice,
    totalAmount,
    drinkOptions,
    fixedSaucers,
    selectiveOptions,
    saucesOptions,
    fetchProductAndExtras,
    handleToggleSelectiveOption,
    handleToggleExtra,
    handleToggleSauce,
    handleToggleIngredient,
    handleAddToCartPress,
  };
};

export default useProduct;
