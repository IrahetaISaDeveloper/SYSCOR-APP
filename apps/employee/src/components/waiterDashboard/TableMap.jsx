import React from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import TableNode from "./TableNode";
import SymbolIcon from "../commons/SymbolIcon";
import { TABLE_STATUS, TABLE_STATUS_ORDER } from "../../constants/waiterStatus";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import tableMapStyles from "../../styles/tableMapStyles";

export default function TableMap({ tables, onTablePress, refreshing, onRefresh }) {
  return (
    <>
      <View style={tableMapStyles.legendRow}>
        {TABLE_STATUS_ORDER.map((key) => (
          <View key={key} style={tableMapStyles.legendItem}>
            <View style={[tableMapStyles.legendDot, { backgroundColor: TABLE_STATUS[key].color }]} />
            <Text style={tableMapStyles.legendLabel}>{TABLE_STATUS[key].label}</Text>
          </View>
        ))}
      </View>

      <View style={tableMapStyles.floor}>
        <ScrollView
          contentContainerStyle={tableMapStyles.grid}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={employeePalette.accent}
              colors={[employeePalette.accent]}
            />
          }
        >
          {tables.length === 0 ? (
            <View style={[tableMapStyles.emptyBox, { width: "100%" }]}>
              <SymbolIcon name="table_restaurant" size={28} color={employeePalette.muted} />
              <Text style={tableMapStyles.emptyText}>Aún no hay mesas registradas.</Text>
            </View>
          ) : (
            tables.map((table) => <TableNode key={table._id} table={table} onPress={onTablePress} />)
          )}
        </ScrollView>
      </View>
    </>
  );
}
