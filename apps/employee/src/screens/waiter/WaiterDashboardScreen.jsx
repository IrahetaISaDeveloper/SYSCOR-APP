import React, { useCallback, useRef } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@syscor/shared/src/context/AuthContext";
import { getFirstName } from "@syscor/shared/src/utils/userDisplay";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import useWaiterDashboard from "../../hooks/useWaiterDashboard";
import useTableManagement from "../../hooks/useTableManagement";
import WaiterHeader from "../../components/waiter/WaiterHeader";
import WaiterSheet from "../../components/waiter/WaiterSheet";
import SymbolIcon from "../../components/commons/SymbolIcon";
import TableMap from "../../components/waiterDashboard/TableMap";
import TableActionsSheet from "../../components/waiterDashboard/TableActionsSheet";
import AssignTableSheet from "../../components/waiterDashboard/AssignTableSheet";
import ChargeTableSheet from "../../components/waiterDashboard/ChargeTableSheet";
import TableManagementModal from "../../components/waiterDashboard/TableManagementModal";
import waiterDashboardScreenStyles from "../../styles/waiterDashboardScreenStyles";

export default function WaiterDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const firstName = getFirstName(user);

  const {
    tables,
    loading,
    refreshing,
    error,
    onRefresh,
    selectedTable,
    activeSheet,
    busy,
    openTable,
    closeSheet,
    openCharge,
    backToActions,
    occupyTable,
    sendTableToCleaning,
    freeTable,
    chargeTable,
  } = useWaiterDashboard();

  const tableManagement = useTableManagement();
  const lastSheetRef = useRef(null);

  const goToNewOrder = useCallback(
    (table) =>
      navigation.navigate("NewOrder", {
        table: {
          _id: table._id,
          number: table.number,
          customerName: table.customerName || null,
          peopleCount: table.peopleCount || null,
        },
      }),
    [navigation]
  );

  const handleOpenOrder = () => {
    if (!selectedTable) return;
    closeSheet();
    goToNewOrder(selectedTable);
  };

  const handleOccupy = async (occupation, takeOrder) => {
    const occupied = await occupyTable(occupation);
    if (occupied && takeOrder) goToNewOrder(occupied);
  };

  if (activeSheet) lastSheetRef.current = activeSheet;
  const sheetType = activeSheet || lastSheetRef.current;

  const renderSheetContent = () => {
    if (!selectedTable) return null;
    if (sheetType === "assign") {
      return <AssignTableSheet table={selectedTable} busy={busy} onOccupy={handleOccupy} />;
    }
    if (sheetType === "charge") {
      return <ChargeTableSheet table={selectedTable} busy={busy} onBack={backToActions} onConfirm={chargeTable} />;
    }
    return (
      <TableActionsSheet
        table={selectedTable}
        busy={busy}
        onOpenOrder={handleOpenOrder}
        onCharge={openCharge}
        onSendToCleaning={sendTableToCleaning}
        onFreeTable={freeTable}
      />
    );
  };

  return (
    <SafeAreaView style={waiterDashboardScreenStyles.container} edges={["top", "left", "right"]}>
      <WaiterHeader
        eyebrow={firstName ? `HOLA, ${firstName.toUpperCase()} · MESERA` : "MESERA"}
        title="Mis mesas"
        subtitle="Toca una mesa para asignar o ver la comanda"
        accessoryIcon="table_restaurant"
        onAccessoryPress={tableManagement.openManagement}
      />

      {loading ? (
        <View style={waiterDashboardScreenStyles.centered}>
          <ActivityIndicator size="large" color={employeePalette.accent} />
          <Text style={waiterDashboardScreenStyles.loadingText}>Cargando mesas...</Text>
        </View>
      ) : (
        <>
          {error && (
            <View style={waiterDashboardScreenStyles.errorBanner}>
              <SymbolIcon name="warning" size={16} color={employeePalette.warnInk} />
              <Text style={waiterDashboardScreenStyles.errorText}>{error}</Text>
            </View>
          )}
          <TableMap tables={tables} onTablePress={openTable} refreshing={refreshing} onRefresh={onRefresh} />
        </>
      )}

      <WaiterSheet visible={!!activeSheet && !!selectedTable} onClose={closeSheet}>
        {renderSheetContent()}
      </WaiterSheet>

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
