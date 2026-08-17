import React from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import BottomSheetModal from "../commons/BottomSheetModal";
import PrimaryButton from "../commons/PrimaryButton";
import StatusBadge from "../commons/StatusBadge";
import StatusPicker from "../commons/StatusPicker";
import tableManagementModalStyles from "../../styles/tableManagementModalStyles";

export default function TableManagementModal({
  visible,
  onClose,
  tables,
  loading,
  error,

  isFormVisible,
  editingTable,
  onOpenCreateForm,
  onOpenEditForm,
  onCancelForm,

  formNumber,
  setFormNumber,
  formStatus,
  setFormStatus,
  submitting,
  onSubmitForm,

  onRemoveTable,
}) {
  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title={isFormVisible ? (editingTable ? "Editar mesa" : "Nueva mesa") : "Gestionar mesas"}
    >
      {isFormVisible ? (
        <>
          <ScrollView
            style={tableManagementModalStyles.scroll}
            contentContainerStyle={tableManagementModalStyles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={tableManagementModalStyles.label}>Número de mesa</Text>
            <TextInput
              style={tableManagementModalStyles.input}
              placeholder="Ej. 5"
              placeholderTextColor="#B0B4B8"
              keyboardType="number-pad"
              value={formNumber}
              onChangeText={setFormNumber}
            />

            <Text style={tableManagementModalStyles.label}>Estado</Text>
            <StatusPicker value={formStatus} onChange={setFormStatus} />
          </ScrollView>

          <View style={tableManagementModalStyles.formFooter}>
            <TouchableOpacity onPress={onCancelForm} style={tableManagementModalStyles.cancelButton}>
              <Text style={tableManagementModalStyles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <PrimaryButton
                label={editingTable ? "Guardar cambios" : "Crear mesa"}
                onPress={onSubmitForm}
                loading={submitting}
              />
            </View>
          </View>
        </>
      ) : (
        <>
          {loading ? (
            <View style={tableManagementModalStyles.centered}>
              <ActivityIndicator color="#C62828" />
            </View>
          ) : error ? (
            <View style={tableManagementModalStyles.centered}>
              <Text style={tableManagementModalStyles.errorText}>{error}</Text>
            </View>
          ) : (
            <ScrollView
              style={tableManagementModalStyles.scroll}
              contentContainerStyle={tableManagementModalStyles.scrollContent}
            >
              {tables.length === 0 && (
                <Text style={tableManagementModalStyles.emptyText}>
                  Aún no hay mesas registradas.
                </Text>
              )}

              {tables.map((table) => (
                <View key={table._id} style={tableManagementModalStyles.row}>
                  <View style={tableManagementModalStyles.rowInfo}>
                    <Text style={tableManagementModalStyles.rowNumber}>Mesa {table.number}</Text>
                    <StatusBadge status={table.status} type="table" />
                  </View>
                  <View style={tableManagementModalStyles.rowActions}>
                    <TouchableOpacity
                      onPress={() => onOpenEditForm(table)}
                      style={tableManagementModalStyles.actionButton}
                    >
                      <Text style={tableManagementModalStyles.actionButtonText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => onRemoveTable(table)}
                      style={[tableManagementModalStyles.actionButton, tableManagementModalStyles.deleteButton]}
                    >
                      <Text style={tableManagementModalStyles.deleteButtonText}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          <View style={tableManagementModalStyles.formFooter}>
            <PrimaryButton label="+ Agregar mesa" onPress={onOpenCreateForm} />
          </View>
        </>
      )}
    </BottomSheetModal>
  );
}
