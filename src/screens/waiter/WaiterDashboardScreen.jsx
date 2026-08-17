import React from "react";
import { View, Text, ActivityIndicator, SafeAreaView, TouchableOpacity } from "react-native";
import { Ionicons as Icon } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { getFirstName } from "../../utils/userDisplay";
import useWaiterDashboard from "../../hooks/useWaiterDashboard";
import useTableManagement from "../../hooks/useTableManagement";
import AppHeader from "../../components/commons/AppHeader";
import TableMap from "../../components/waiterDashboard/TableMap";
import AssignCustomerModal from "../../components/waiterDashboard/AssignCustomerModal";
import OrderModal from "../../components/waiterDashboard/OrderModal";
import TableActionsModal from "../../components/waiterDashboard/TableActionsModal";
import TableManagementModal from "../../components/waiterDashboard/TableManagementModal";
import waiterDashboardScreenStyles from "../../styles/waiterDashboardScreenStyles";

export default function WaiterDashboardScreen() {
  const { user } = useAuth();
  const firstName = getFirstName(user);

  const {
    tables,
    loading,
    refreshing,
    error,
    onRefresh,

    menu,
    menuLoading,

    selectedTable,
    isActionsModalVisible,
    isAssignModalVisible,
    isOrderModalVisible,

    openTable,
    setActionsModalVisible,
    setAssignModalVisible,
    setOrderModalVisible,
    openOrderModal,

    assignCustomer,
    addItemsToOrder,
    sendTableToCleaning,
    freeTable,
  } = useWaiterDashboard();

  const tableManagement = useTableManagement();

  if (loading) {
    return (
      <SafeAreaView style={waiterDashboardScreenStyles.centered}>
        <ActivityIndicator size="large" color="#E74C3C" />
        <Text style={waiterDashboardScreenStyles.loadingText}>Cargando mesas...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={waiterDashboardScreenStyles.container}>
      {firstName ? (
        <Text style={waiterDashboardScreenStyles.welcomeText}>Hola, {firstName} 👋</Text>
      ) : null}

      <AppHeader
        title="Mis mesas"
        subtitle="Toca una mesa para asignar clientes o gestionar la comanda"
        accessory={
          <TouchableOpacity
            onPress={tableManagement.openManagement}
            style={waiterDashboardScreenStyles.tablesButton}
            activeOpacity={0.8}
          >
            <Icon name="restaurant-outline" size={20} color="#E74C3C" />
          </TouchableOpacity>
        }
      />

      {error && (
        <View style={waiterDashboardScreenStyles.errorBanner}>
          <Text style={waiterDashboardScreenStyles.errorText}>{error}</Text>
        </View>
      )}

      <TableMap
        tables={tables}
        onTablePress={openTable}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />

      <AssignCustomerModal
        visible={isAssignModalVisible}
        table={selectedTable}
        menu={menu}
        menuLoading={menuLoading}
        onClose={() => setAssignModalVisible(false)}
        onConfirm={assignCustomer}
      />

      <TableActionsModal
        visible={isActionsModalVisible}
        table={selectedTable}
        onClose={() => setActionsModalVisible(false)}
        onOpenOrder={openOrderModal}
        onSendToCleaning={sendTableToCleaning}
        onFreeTable={freeTable}
      />

      <OrderModal
        visible={isOrderModalVisible}
        table={selectedTable}
        menu={menu}
        menuLoading={menuLoading}
        onClose={() => setOrderModalVisible(false)}
        onAddItems={addItemsToOrder}
      />

      <TableManagementModal
        visible={tableManagement.isModalVisible}
        onClose={() => {
          tableManagement.closeManagement();
          onRefresh();
        }}
        tables={tableManagement.tables}
        loading={tableManagement.loading}
        error={tableManagement.error}
        isFormVisible={tableManagement.isFormVisible}
        editingTable={tableManagement.editingTable}
        onOpenCreateForm={tableManagement.openCreateForm}
        onOpenEditForm={tableManagement.openEditForm}
        onCancelForm={tableManagement.cancelForm}
        formNumber={tableManagement.formNumber}
        setFormNumber={tableManagement.setFormNumber}
        formStatus={tableManagement.formStatus}
        setFormStatus={tableManagement.setFormStatus}
        submitting={tableManagement.submitting}
        onSubmitForm={tableManagement.submitForm}
        onRemoveTable={tableManagement.removeTable}
      />
    </SafeAreaView>
  );
}