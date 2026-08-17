import React from "react";
import { View, Text, ActivityIndicator, SafeAreaView, Alert } from "react-native";
import { useAuth } from "../../context/AuthContext";
import useWaiterDashboard from "../../hooks/useWaiterDashboard";
import useTableManagement from "../../hooks/useTableManagement";
import AppHeader from "../../components/commons/AppHeader";
import BottomNavBar from "../../components/commons/BottomNavBar";
import TableMap from "../../components/waiterDashboard/TableMap";
import AssignCustomerModal from "../../components/waiterDashboard/AssignCustomerModal";
import OrderModal from "../../components/waiterDashboard/OrderModal";
import TableActionsModal from "../../components/waiterDashboard/TableActionsModal";
import TableManagementModal from "../../components/waiterDashboard/TableManagementModal";
import waiterDashboardScreenStyles from "../../styles/waiterDashboardScreenStyles";

export default function WaiterDashboardScreen({ navigation }) {
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

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Seguro que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar sesión", style: "destructive", onPress: logout },
    ]);
  };

  const navItems = [
  { key: "profile", icon: "person-outline", label: "Mi perfil", active: false, onPress: () => navigation.navigate("Profile") },
  { key: "tables", icon: "restaurant-outline", label: "Mesas", active: false, onPress: tableManagement.openManagement },
  { key: "logout", icon: "log-out-outline", label: "Salir", active: false, onPress: handleLogout },
];

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
      <AppHeader title="Mis mesas" subtitle="Toca una mesa para asignar clientes o gestionar la comanda" />

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

      <BottomNavBar items={navItems} accentColor="#E74C3C" />

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