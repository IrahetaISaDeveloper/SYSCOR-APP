import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { getComboById, getDrinkById, getSaucerById, getActiveExtras } from '../services/api';

// Toda la lógica de la pantalla ProductDetails: carga del producto/extras,
// selección de opciones (combo armable, bebida, salsas, extras) y cálculo
// de precios. El componente solo llama a este hook y pinta el JSX.
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
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Estados de selección del usuario
  const [quantity, setQuantity] = useState(1);
  const [selectedDrinkId, setSelectedDrinkId] = useState(null);
  const [selectedSauces, setSelectedSauces] = useState([]);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [selectedSelectiveItems, setSelectedSelectiveItems] = useState([]);
  const [selectiveSectionOpen, setSelectiveSectionOpen] = useState(true);

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

      // Siempre cargamos extras: "otras personas lo combinaron con" aplica
      // a combos, platillos y bebidas por igual
      const extrasRes = await getActiveExtras();
      if (extrasRes.success && Array.isArray(extrasRes.data)) {
        setAvailableExtras(extrasRes.data);
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

  // Selección de Extras
  const handleToggleExtra = (extra) => {
    setSelectedExtras((prev) => {
      const exists = prev.some((item) => item._id === extra._id);
      if (exists) {
        return prev.filter((item) => item._id !== extra._id);
      }
      return [...prev, extra];
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

  // Cálculo de Precios
  const { unitPrice, totalAmount } = useMemo(() => {
    if (!productData) return { unitPrice: 0, totalAmount: 0 };

    const basePrice = Number(productData.price) || 0;
    const extrasTotal = selectedExtras.reduce(
      (sum, item) => sum + (Number(item.price) || 0),
      0
    );

    const calculatedUnitPrice = basePrice + extrasTotal;
    const calculatedTotal = calculatedUnitPrice * quantity;

    return {
      unitPrice: calculatedUnitPrice,
      totalAmount: calculatedTotal,
    };
  }, [productData, selectedExtras, quantity]);

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
      selectedDrinkId,
      selectedSauces,
      selectedSelectiveItems,
      selectedExtras: selectedExtras.map((e) => ({
        extraId: e._id,
        name: e.name,
        price: e.price,
      })),
    };

    if (onAddToCart) {
      onAddToCart(payload);
    } else {
      Alert.alert('Éxito', `${productData.name} agregado al carrito.`);
      navigation?.goBack();
    }
  };

  // Preparación de listas según el modelo de tu JSON
  const drinkSets = productData?.drinkPolicy?.drinkSetIds || [];
  const thirdPartyDrinks = productData?.drinkPolicy?.thirdPartyDrinkIds || [];
  const allDrinkOptions = [
    ...drinkSets.flatMap((set) => set.drinkIds || []),
    ...thirdPartyDrinks,
  ];
  const selectiveOptions = productData?.selectiveOptions || [];
  const saucesOptions = productData?.sauces || [];

  return {
    loading,
    errorMessage,
    productData,
    availableExtras,
    quantity,
    setQuantity,
    selectedDrinkId,
    setSelectedDrinkId,
    selectedSauces,
    selectedExtras,
    selectedSelectiveItems,
    selectiveSectionOpen,
    setSelectiveSectionOpen,
    toast,
    hideToast,
    unitPrice,
    totalAmount,
    allDrinkOptions,
    selectiveOptions,
    saucesOptions,
    fetchProductAndExtras,
    handleToggleSelectiveOption,
    handleToggleExtra,
    handleToggleSauce,
    handleAddToCartPress,
  };
};

export default useProduct;
