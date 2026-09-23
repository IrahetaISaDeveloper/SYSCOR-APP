import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { Ionicons as Icon } from "@expo/vector-icons";
import BottomSheetModal from '@syscor/shared/src/components/commons/BottomSheetModal';
import PrimaryButton from '@syscor/shared/src/components/commons/PrimaryButton';
import MenuItemPicker from "./MenuItemPicker";
import orderModalStyles from "../../styles/orderModalStyles";
import { employeePalette as palette } from '@syscor/shared/src/styles/employeePalette';

// Config visual por estado de comanda — igual a la usada en TableActionsModal
const ORDER_STATE_META = {
  pending:   { icon: "time-outline",     color: palette.muted,   label: "PENDIENTE" },
  preparing: { icon: "flame",            color: palette.warnInk, label: "EN PREP." },
  ready:     { icon: "checkmark-circle", color: palette.okInk,   label: "LISTA" },
  delivered: { icon: "checkmark-done",   color: palette.muted,   label: "ENTREGADA" },
  cancelled: { icon: "close-circle",     color: palette.accent,  label: "CANCELADA" },
};

export default function OrderModal({ visible, table, menu, menuLoading, onClose, onAddItems }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const activeOrders = table?.activeOrders || [];

  const handleAdd = async () => {
    if (selectedItems.length === 0) return;
    setSubmitting(true);
    await onAddItems(selectedItems);
    setSubmitting(false);
    setSelectedItems([]);
  };

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title={table ? `Comanda · Mesa ${table.number}` : "Comanda"}
    >
      <ScrollView
        style={orderModalStyles.scroll}
        contentContainerStyle={orderModalStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {activeOrders.length > 0 && (
          <View style={orderModalStyles.kitchenBox}>
            <Text style={orderModalStyles.kitchenBoxLabel}>COMANDAS ACTIVAS</Text>
            {activeOrders.map((order) => {
              const meta = ORDER_STATE_META[order.status] || ORDER_STATE_META.pending;
              const items = Array.isArray(order.items) ? order.items : [];
              return (
                <View key={order._id} style={orderModalStyles.orderBlock}>
                  <View style={orderModalStyles.orderRow}>
                    <Icon name={meta.icon} size={16} color={meta.color} />
                    <Text style={orderModalStyles.orderRowText} numberOfLines={1}>
                      {order.displayId ? `#${order.displayId}` : `#${String(order._id).slice(-4).toUpperCase()}`}
                      {' · '}{order.itemCount ?? items.length} producto{(order.itemCount ?? items.length) === 1 ? '' : 's'}
                      {typeof order.total === 'number' ? ` · $${order.total.toFixed(2)}` : ''}
                    </Text>
                    <Text style={[orderModalStyles.orderRowStatus, { color: meta.color }]}>
                      {meta.label}
                    </Text>
                  </View>

                  {/* Productos concretos de la comanda, cuando el backend los incluye */}
                  {items.length > 0 && (
                    <View style={orderModalStyles.productsList}>
                      {items.map((item, idx) => (
                        <Text key={item._id || idx} style={orderModalStyles.productItem}>
                          · {item.quantity ? `${item.quantity}× ` : ''}{item.name}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        <Text style={orderModalStyles.sectionTitle}>Agregar productos</Text>
        <MenuItemPicker
          menu={menu}
          loading={menuLoading}
          selectedItems={selectedItems}
          onChangeSelectedItems={setSelectedItems}
        />
      </ScrollView>

      <View style={orderModalStyles.footer}>
        <PrimaryButton
          label="Agregar a comanda"
          onPress={handleAdd}
          loading={submitting}
          disabled={selectedItems.length === 0}
          color={palette.accent}
        />
      </View>
    </BottomSheetModal>
  );
}
