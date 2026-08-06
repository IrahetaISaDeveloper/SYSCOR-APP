import React from "react";
import { View, Text, ActivityIndicator, SafeAreaView, TouchableOpacity } from "react-native";
import { useAuth } from "../../context/AuthContext";
import useWaiterDashboard from "../../hooks/useWaiterDashboard";
import useTableManagement from "../../hooks/useTableManagement";
import TableMap from "../../components/waiterDashboard/TableMap";
import AssignCustomerModal from "../../components/waiterDashboard/AssignCustomerModal";
import OrderModal from "../../components/waiterDashboard/OrderModal";
import TableActionsModal from "../../components/waiterDashboard/TableActionsModal";
import TableManagementModal from "../../components/waiterDashboard/TableManagementModal";
import waiterDashboardScreenStyles from "../../styles/waiterDashboardScreenStyles";

export default function WaiterDashboardScreen({ navigation  }) {
  const { logout } = useAuth();

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
      <View style={waiterDashboardScreenStyles.header}>
        <View style={waiterDashboardScreenStyles.headerTopRow}>
          <Text style={waiterDashboardScreenStyles.title}>Mis mesas</Text>
          <View style={waiterDashboardScreenStyles.headerActions}>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
      <Text style={waiterDashboardScreenStyles.headerActionText}>Mi perfil</Text>
    </TouchableOpacity>
            <TouchableOpacity onPress={tableManagement.openManagement}>
              <Text style={waiterDashboardScreenStyles.headerActionText}>Gestionar mesas</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={logout}>
              <Text style={waiterDashboardScreenStyles.headerLogoutText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={waiterDashboardScreenStyles.subtitle}>
          Toca una mesa para asignar clientes o gestionar la comanda
        </Text>
      </View>

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
          onRefresh(); // refresca el mapa de mesas por si hubo cambios
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
