import React from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import TableNode from "./TableNode";
import { TABLE_STATUS_META } from "../commons/StatusBadge";
import tableMapStyles from "../../styles/tableMapStyles";

export default function TableMap({ tables, onTablePress, refreshing, onRefresh }) {
  return (
    <ScrollView
      contentContainerStyle={tableMapStyles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E74C3C" />}
    >
      <View style={tableMapStyles.legendRow}>
        {Object.entries(TABLE_STATUS_META).map(([key, meta]) => (
          <View key={key} style={tableMapStyles.legendItem}>
            <View style={[tableMapStyles.legendDot, { backgroundColor: meta.color }]} />
            <Text style={tableMapStyles.legendLabel}>{meta.label}</Text>
          </View>
        ))}
      </View>

      <View style={tableMapStyles.floor}>
        <View style={tableMapStyles.grid}>
          {tables.map((table) => (
            <TableNode key={table._id} table={table} onPress={onTablePress} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
