import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import menuItemPickerStyles from "../../styles/menuItemPickerStyles";

const CATEGORIES = [
  { key: "combos", label: "Combos", itemType: "combo" },
  { key: "drinks", label: "Bebidas", itemType: "drink" },
  { key: "extras", label: "Extras", itemType: "extra" },
];

export default function MenuItemPicker({ menu, loading, selectedItems, onChangeSelectedItems }) {
  const [activeCategory, setActiveCategory] = useState("combos");

  if (loading) {
    return (
      <View style={menuItemPickerStyles.loadingBox}>
        <ActivityIndicator color="#E74C3C" />
        <Text style={menuItemPickerStyles.loadingText}>Cargando menú...</Text>
      </View>
    );
  }

  const getQuantity = (itemId, itemType) =>
    selectedItems.find((i) => i.itemId === itemId && i.itemType === itemType)?.quantity || 0;

  const changeQuantity = (product, itemType, delta) => {
    const existing = selectedItems.find(
      (i) => i.itemId === product._id && i.itemType === itemType
    );

    if (!existing && delta > 0) {
      onChangeSelectedItems([
        ...selectedItems,
        { itemId: product._id, itemType, name: product.name, price: product.price, quantity: 1, notes: "" },
      ]);
      return;
    }

    if (!existing) return;

    const newQuantity = existing.quantity + delta;
    if (newQuantity <= 0) {
      onChangeSelectedItems(
        selectedItems.filter((i) => !(i.itemId === product._id && i.itemType === itemType))
      );
    } else {
      onChangeSelectedItems(
        selectedItems.map((i) =>
          i.itemId === product._id && i.itemType === itemType
            ? { ...i, quantity: newQuantity }
            : i
        )
      );
    }
  };

  const activeCategoryMeta = CATEGORIES.find((c) => c.key === activeCategory);
  const products = menu[activeCategory] || [];

  return (
    <View>
      <View style={menuItemPickerStyles.tabsRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            onPress={() => setActiveCategory(cat.key)}
            style={[
              menuItemPickerStyles.tab,
              activeCategory === cat.key && menuItemPickerStyles.tabActive,
            ]}
          >
            <Text
              style={[
                menuItemPickerStyles.tabLabel,
                activeCategory === cat.key && menuItemPickerStyles.tabLabelActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {products.length === 0 ? (
        <Text style={menuItemPickerStyles.emptyText}>No hay productos en esta categoría.</Text>
      ) : (
        products.map((product) => {
          const quantity = getQuantity(product._id, activeCategoryMeta.itemType);
          return (
            <View key={product._id} style={menuItemPickerStyles.productRow}>
              <View style={menuItemPickerStyles.productInfo}>
                <Text style={menuItemPickerStyles.productName}>{product.name}</Text>
                <Text style={menuItemPickerStyles.productPrice}>${product.price?.toFixed(2)}</Text>
              </View>

              <View style={menuItemPickerStyles.stepper}>
                <TouchableOpacity
                  style={menuItemPickerStyles.stepperButton}
                  onPress={() => changeQuantity(product, activeCategoryMeta.itemType, -1)}
                  disabled={quantity === 0}
                >
                  <Text
                    style={[
                      menuItemPickerStyles.stepperButtonText,
                      quantity === 0 && menuItemPickerStyles.stepperButtonTextDisabled,
                    ]}
                  >
                    −
                  </Text>
                </TouchableOpacity>
                <Text style={menuItemPickerStyles.stepperValue}>{quantity}</Text>
                <TouchableOpacity
                  style={menuItemPickerStyles.stepperButton}
                  onPress={() => changeQuantity(product, activeCategoryMeta.itemType, 1)}
                >
                  <Text style={menuItemPickerStyles.stepperButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}

      {selectedItems.length > 0 && (
        <View style={menuItemPickerStyles.summaryBox}>
          <Text style={menuItemPickerStyles.summaryText}>
            {selectedItems.reduce((sum, i) => sum + i.quantity, 0)} productos · $
            {selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)}
          </Text>
        </View>
      )}
    </View>
  );
}
