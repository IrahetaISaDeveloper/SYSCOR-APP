import React, { useState } from "react";
import { View, Text, TextInput, ScrollView } from "react-native";
import BottomSheetModal from "../commons/BottomSheetModal";
import PrimaryButton from "../commons/PrimaryButton";
import MenuItemPicker from "./MenuItemPicker";
import assignCustomerModalStyles from "../../styles/assignCustomerModalStyles";

export default function AssignCustomerModal({
  visible,
  table,
  menu,
  menuLoading,
  onClose,
  onConfirm,
}) {
  const [customerName, setCustomerName] = useState("");
  const [peopleCount, setPeopleCount] = useState("1");
  const [selectedItems, setSelectedItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const resetAndClose = () => {
    setCustomerName("");
    setPeopleCount("1");
    setSelectedItems([]);
    onClose();
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    await onConfirm({
      customerName: customerName.trim() || undefined,
      peopleCount: Number(peopleCount) || 1,
      items: selectedItems,
    });
    setSubmitting(false);
    setCustomerName("");
    setPeopleCount("1");
    setSelectedItems([]);
  };

  return (
    <BottomSheetModal
      visible={visible}
      onClose={resetAndClose}
      title={table ? `Asignar Mesa ${table.number}` : "Asignar mesa"}
    >
      <ScrollView
        style={assignCustomerModalStyles.scroll}
        contentContainerStyle={assignCustomerModalStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={assignCustomerModalStyles.label}>Nombre del cliente (opcional)</Text>
        <TextInput
          style={assignCustomerModalStyles.input}
          placeholder="Ej. Familia Pérez"
          placeholderTextColor="#B0B4B8"
          value={customerName}
          onChangeText={setCustomerName}
        />

        <Text style={assignCustomerModalStyles.label}>Número de personas</Text>
        <TextInput
          style={assignCustomerModalStyles.input}
          placeholder="1"
          placeholderTextColor="#B0B4B8"
          keyboardType="number-pad"
          value={peopleCount}
          onChangeText={setPeopleCount}
        />

        <Text style={assignCustomerModalStyles.sectionTitle}>Comanda inicial (opcional)</Text>
        <Text style={assignCustomerModalStyles.helperText}>
          Puedes ocupar la mesa sin pedidos y agregar la comanda después.
        </Text>

        <MenuItemPicker
          menu={menu}
          loading={menuLoading}
          selectedItems={selectedItems}
          onChangeSelectedItems={setSelectedItems}
        />
      </ScrollView>

      <View style={assignCustomerModalStyles.footer}>
        <PrimaryButton label="Ocupar mesa" onPress={handleConfirm} loading={submitting} />
      </View>
    </BottomSheetModal>
  );
}
