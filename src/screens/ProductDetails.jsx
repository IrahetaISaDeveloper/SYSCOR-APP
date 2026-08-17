import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';

// Componentes UI de commons
import OptionChip from '../components/commons/OptionChip';
import QuantityStepper from '../components/commons/QuantityStepper';
import CheckRow from '../components/commons/CheckRow';
import SelectableRow from '../components/commons/SelectableRow';
import Toast from '../components/commons/Toast';

import { useProduct } from '../hooks/useProduct';
import styles from '../styles/ProductDetails';
import { colors } from '../styles/theme';

export const ProductDetails = ({ route, navigation, onAddToCart, onGoToCart, onBack, productIdProp, itemTypeProp }) => {
  const {
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
    totalAmount,
    allDrinkOptions,
    selectiveOptions,
    saucesOptions,
    fetchProductAndExtras,
    handleToggleSelectiveOption,
    handleToggleExtra,
    handleToggleSauce,
    handleAddToCartPress,
  } = useProduct({ route, navigation, onAddToCart, productIdProp, itemTypeProp });

  // Render de Carga
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.textGray, fontWeight: '600' }}>
          Cargando producto...
        </Text>
      </View>
    );
  }

  // Render de Error
  if (errorMessage || !productData) {
    return (
      <View style={styles.centered}>
        <Icon name="alert-circle-outline" size={32} color={colors.error} style={{ marginBottom: 8 }} />
        <Text style={[styles.errorText, { marginBottom: 8, fontWeight: 'bold' }]}>
          Error de Carga
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

  return (
    <View style={styles.container}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
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
          <Icon name="arrow-back" size={20} color={colors.textDark} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={() => onGoToCart?.()}>
          <Icon name="cart-outline" size={20} color={colors.textDark} />
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
