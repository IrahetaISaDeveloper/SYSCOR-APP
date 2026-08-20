import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import BottomSheetModal from "../commons/BottomSheetModal";
import PrimaryButton from "../commons/PrimaryButton";
import StatusBadge from "../commons/StatusBadge";
import MenuItemPicker from "./MenuItemPicker";
import orderModalStyles from "../../styles/orderModalStyles";

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
          <View style={orderModalStyles.activeOrdersBox}>
            <Text style={orderModalStyles.sectionTitle}>Comandas activas</Text>
            {activeOrders.map((order) => (
              <View key={order._id} style={orderModalStyles.orderRow}>
                <View>
                  <Text style={orderModalStyles.orderItems}>{order.itemCount} productos</Text>
                  <Text style={orderModalStyles.orderTotal}>${order.total?.toFixed(2)}</Text>
                </View>
                <StatusBadge status={order.status} type="order" />
              </View>
            ))}
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
        />
      </View>
    </BottomSheetModal>
  );
}