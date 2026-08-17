import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import QuantityStepper from '../components/commons/QuantityStepper';
import { styles } from '../styles/Cart';
import { colors } from '../styles/theme';

export const Cart = ({ 
  cartItems = [], 
  subtotal = 0, 
  tip = 0, 
  total = 0, 
  onBack,
  onClearCart,
  onUpdateQuantity,
  onCheckout
}) => {
  const safeSubtotal = Number(subtotal) || 0;
  const safeTip = Number(tip) || 0;
  const safeTotal = Number(total) || safeSubtotal + safeTip;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
          <Icon name="arrow-back" size={20} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Carrito</Text>
        <TouchableOpacity onPress={onClearCart} activeOpacity={0.7}>
          <Icon name="trash-outline" size={18} color={colors.textGray} />
        </TouchableOpacity>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="cart-outline" size={48} color={colors.textLight} style={{ marginBottom: 8 }} />
          <Text style={styles.emptyText}>No hay nada aún</Text>
        </View>
      ) : (
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Renderizado dinámico de la lista enviada por tu API */}
        <View style={styles.itemsContainer}>
          {cartItems.map((item, index) => {
            const itemId = item.id || item._id || item.productId || `item-${index}`;
            const itemQty = Number(item.quantity) || 1;

            return (
              <View key={itemId} style={styles.itemCard}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                ) : (
                  <View style={styles.itemImage} />
                )}
                <View style={styles.itemDetails}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.itemPrice}>
                      ${(Number(item.price) || 0).toFixed(2)}
                    </Text>
                  </View>

                  <Text style={styles.itemDescription} numberOfLines={2}>
                    {item.description}
                  </Text>

                  <QuantityStepper
                    value={itemQty}
                    onIncrement={() => onUpdateQuantity?.(itemId, itemQty + 1)}
                    onDecrement={() => onUpdateQuantity?.(itemId, itemQty > 1 ? itemQty - 1 : 1)}
                  />
                </View>
              </View>
            );
          })}
        </View>

        {/* Resumen del Pedido */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>RESUMEN DEL PEDIDO</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${safeSubtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Propina</Text>
            <Text style={styles.tipValue}>+${safeTip.toFixed(2)}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalPrice}>${safeTotal.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>
      )}

      {/* Botón de Checkout Rojo */}
      {cartItems.length > 0 && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={onCheckout}
            activeOpacity={0.9}
          >
            <Text style={styles.checkoutText}>Continuar al Pago</Text>
            <View style={styles.checkoutRight}>
              <View style={styles.checkoutDivider} />
              <Text style={styles.checkoutPrice}>${safeTotal.toFixed(2)}</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};
export default Cart;
