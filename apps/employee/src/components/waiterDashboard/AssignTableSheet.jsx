import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import SymbolIcon from "../commons/SymbolIcon";
import TableSummaryHeader from "./TableSummaryHeader";
import QuantityStepper from "../waiter/QuantityStepper";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import styles from "../../styles/waiterSheetContentStyles";

const MAX_PEOPLE = 50;

export default function AssignTableSheet({ table, busy, onOccupy }) {
  const [customerName, setCustomerName] = useState("");
  const [peopleCount, setPeopleCount] = useState(2);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    setCustomerName("");
    setPeopleCount(2);
  }, [table._id]);

  const submit = async (takeOrder) => {
    setPendingAction(takeOrder ? "order" : "occupy");
    await onOccupy({ customerName: customerName.trim(), peopleCount }, takeOrder);
    setPendingAction(null);
  };

  const isReserved = table.status === "reservada";

  return (
    <>
      <TableSummaryHeader
        tableNumber={table.number}
        title="Asignar mesa"
        info={isReserved ? `Mesa ${table.number} · reservada` : `Mesa ${table.number} · libre`}
      />

      <View style={{ gap: 10 }}>
        <View style={styles.inputRow}>
          <SymbolIcon name="person" size={18} color={employeePalette.muted} />
          <TextInput
            style={styles.input}
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="Nombre del cliente (opcional)"
            placeholderTextColor={employeePalette.muted}
            maxLength={60}
            autoCapitalize="words"
            returnKeyType="done"
          />
          <Text style={styles.inputTag}>CLIENTE</Text>
        </View>

        <View style={styles.inputRow}>
          <SymbolIcon name="group" size={18} color={employeePalette.muted} />
          <Text style={styles.inputRowLabel}>Personas</Text>
          <QuantityStepper
            value={peopleCount}
            min={1}
            max={MAX_PEOPLE}
            onDecrease={() => setPeopleCount((n) => Math.max(1, n - 1))}
            onIncrease={() => setPeopleCount((n) => Math.min(MAX_PEOPLE, n + 1))}
          />
        </View>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.primaryButton, busy && styles.buttonDisabled]}
          onPress={() => submit(true)}
          disabled={busy}
          activeOpacity={0.85}
        >
          {pendingAction === "order" ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <SymbolIcon name="receipt_long" size={17} color="#FFFFFF" />
              <Text style={styles.primaryButtonLabel}>Ocupar y tomar comanda</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, busy && styles.buttonDisabled]}
          onPress={() => submit(false)}
          disabled={busy}
          activeOpacity={0.85}
        >
          {pendingAction === "occupy" ? (
            <ActivityIndicator color={employeePalette.accent} />
          ) : (
            <Text style={styles.secondaryButtonLabel}>Solo ocupar mesa</Text>
          )}
        </TouchableOpacity>
      </View>
    </>
  );
}
