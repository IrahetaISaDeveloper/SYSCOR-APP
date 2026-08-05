import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';

// Componentes UI de commons
import OptionChip from '../components/commons/OptionChip';
import QuantityStepper from '../components/commons/QuantityStepper';
import CheckRow from '../components/commons/CheckRow';
import SelectableRow from '../components/commons/SelectableRow';
import Toast from '../components/commons/Toast';

import {
  getComboById,
  getDrinkById,
  getSaucerById,
  getActiveExtras,
} from '../services/api';

import styles from '../styles/ProductDetails';

export const ProductDetails = ({ route, navigation, onAddToCart, onGoToCart, onBack, productIdProp, itemTypeProp }) => {
  // Extraemos variables posibles de navegación (o de props directas si se usa sin navegación)
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
      {
        const extrasRes = await getActiveExtras();
        if (extrasRes.success && Array.isArray(extrasRes.data)) {
          setAvailableExtras(extrasRes.data);
        }
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
        return prev.filter((id) => id !== optionId);
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

  // Render de Carga
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#C62828" />
        <Text style={{ marginTop: 12, color: '#8A8A8A', fontWeight: '600' }}>
          Cargando producto...
        </Text>
      </View>
    );
  }

  // Render de Error
  if (errorMessage || !productData) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.errorText, { marginBottom: 8, fontWeight: 'bold' }]}>
          ⚠️ Error de Carga
        </Text>
        <Text style={styles.errorText}>
          {errorMessage || 'No se encontró información del producto.'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProductAndExtras}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Preparación de listas según el modelo de tu JSON
  const drinkSets = productData?.drinkPolicy?.drinkSetIds || [];
  const thirdPartyDrinks = productData?.drinkPolicy?.thirdPartyDrinkIds || [];
  const allDrinkOptions = [
    ...drinkSets.flatMap((set) => set.drinkIds || []),
    ...thirdPartyDrinks,
  ];

  const selectiveOptions = productData?.selectiveOptions || [];
  const saucesOptions = productData?.sauces || [];

  return (
    <View style={styles.container}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Imagen del Producto */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: productData.image || 'https://via.placeholder.com/300' }}
            style={styles.productImage}
          />
        </View>

        {/* Información Principal */}
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{productData.name}</Text>
          <Text style={styles.price}>${(Number(productData.price) || 0).toFixed(2)}</Text>
          {productData.description ? (
            <Text style={styles.description}>{productData.description}</Text>
          ) : null}
        </View>

        {/* Opciones Selectivas (Combos Armables) */}
        {productData?.selective && selectiveOptions.length > 0 && (
          <View style={styles.sectionContainer}>
            <TouchableOpacity
              style={styles.requiredSectionHeader}
              onPress={() => setSelectiveSectionOpen((open) => !open)}
              activeOpacity={0.7}
            >
              <View style={styles.requiredSectionHeaderLeft}>
                <Text style={styles.sectionTitleNormal}>Selecciona tus platillos</Text>
                <View style={styles.requiredBadge}>
                  <Text style={styles.requiredText}>REQUERIDO</Text>
                </View>
              </View>
              <Text style={styles.chevron}>{selectiveSectionOpen ? '︿' : '﹀'}</Text>
            </TouchableOpacity>
            <Text style={styles.requiredSubtitle}>
              Elige {productData.selectiveMaxPicks || 1} opciones
            </Text>

            {selectiveSectionOpen && (
              <View style={styles.plainListContainer}>
                {selectiveOptions.map((opt, index) => {
                  const optId = opt._id?.$oid || opt._id || `opt-${index}`;
                  const labelName = opt.saucerId?.name || `Opción ${index + 1}`;
                  const isSelected = selectedSelectiveItems.includes(optId);

                  return (
                    <SelectableRow
                      key={optId}
                      label={labelName}
                      selected={isSelected}
                      isLast={index === selectiveOptions.length - 1}
                      onPress={() => handleToggleSelectiveOption(optId)}
                    />
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Selección de Bebidas */}
        {allDrinkOptions.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>SELECCIONA TU BEBIDA</Text>
            <View style={styles.listContainer}>
              {allDrinkOptions.map((drink, index) => {
                const drinkIdItem = drink._id?.$oid || drink._id || `drink-${index}`;
                const drinkName = drink.name || 'Bebida';
                const isSelected = selectedDrinkId === drinkIdItem;

                return (
                  <OptionChip
                    key={drinkIdItem}
                    label={drinkName}
                    image={drink.image}
                    selected={isSelected}
                    onPress={() => setSelectedDrinkId(drinkIdItem)}
                  />
                );
              })}
            </View>
          </View>
        )}

        {/* Selección de Salsas */}
        {saucesOptions.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>SALSAS DE TU ELECCIÓN</Text>
            <View style={styles.chipsRow}>
              {saucesOptions.map((sauce) => {
                const sauceName = typeof sauce === 'string' ? sauce : sauce.name;
                const isChecked = selectedSauces.includes(sauceName);

                return (
                  <OptionChip
                    key={sauceName}
                    label={sauceName}
                    selected={isChecked}
                    onPress={() => handleToggleSauce(sauceName)}
                  />
                );
              })}
            </View>
          </View>
        )}

        {/* Complementos y Extras con CheckRow */}
        {availableExtras.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitleNormal}>Otras personas lo combinaron con</Text>
            <View style={styles.listContainer}>
              {availableExtras.map((extra) => {
                const isChecked = selectedExtras.some((e) => e._id === extra._id);
                return (
                  <CheckRow
                    key={extra._id}
                    label={extra.name}
                    image={extra.image}
                    price={Number(extra.price) || 0}
                    checked={isChecked}
                    onPress={() => handleToggleExtra(extra)}
                  />
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Header flotante superior */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => (onBack ? onBack() : navigation?.goBack())}>
          <Text style={styles.headerIcon}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={() => onGoToCart?.()}>
          <Text style={styles.headerIcon}>🛒</Text>
        </TouchableOpacity>
      </View>

      {/* Control Inferior y Añadir */}
      <View style={styles.bottomBar}>
        <QuantityStepper
          value={quantity}
          onIncrement={() => setQuantity((q) => q + 1)}
          onDecrement={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
        />

        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.85}
          onPress={handleAddToCartPress}
        >
          <Text style={styles.addButtonText}>AGREGAR AL CARRITO</Text>
          <Text style={styles.addButtonPrice}>
            ${totalAmount.toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductDetails;