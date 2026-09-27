import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import SymbolIcon from "../../components/commons/SymbolIcon";
import { MOCK_HISTORY } from "../../mocks/deliveryMock";
import { PAYMENT_LABELS, formatMoney } from "../../constants/deliveryStatus";
import { fonts } from "../../styles/fonts";

const METHOD_LABELS = { hand: "En mano", reception: "Recepción" };

function HistoryRow({ item }) {
  const isCard = item.paymentMethod === "card" || item.paymentMethod === "online";
  return (
    <View style={s.row}>
      <View style={s.iconBox}>
        <SymbolIcon name="check_circle" size={18} color={employeePalette.muted} />
      </View>
      <View style={s.texts}>
        <View style={s.codeRow}>
          <Text style={s.code}>{item.code}</Text>
          <Text style={s.chip}>{METHOD_LABELS[item.method] || item.method}</Text>
        </View>
        <Text style={s.address} numberOfLines={1}>{item.address}</Text>
      </View>
      <View style={s.right}>
        <Text style={s.amount}>{formatMoney(item.total)}</Text>
        <Text style={s.time}>{item.deliveredAt}</Text>
      </View>
    </View>
  );
}

export default function DeliveryHistoryScreen() {
  return (
    <SafeAreaView style={s.screen} edges={["top", "left", "right"]}>
      <View style={s.header}>
        <Text style={s.title}>Historial</Text>
      </View>
      <FlatList
        data={MOCK_HISTORY}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <HistoryRow item={item} />}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={s.sep} />}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: employeePalette.bg },
  header: { paddingTop: 10, paddingHorizontal: 18, paddingBottom: 12 },
  title: {
    fontFamily: fonts.sansBold,
    fontSize: 21,
    letterSpacing: -0.525,
    color: employeePalette.ink,
  },
  list: { paddingHorizontal: 18, paddingBottom: 24 },
  sep: { height: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: employeePalette.surface,
    borderWidth: 1,
    borderColor: employeePalette.line,
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: employeePalette.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  texts: { flex: 1, minWidth: 0, gap: 3 },
  codeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  code: { fontFamily: fonts.monoMedium, fontSize: 13.5, color: employeePalette.ink },
  chip: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 0.54,
    backgroundColor: employeePalette.surface2,
    borderRadius: 999,
    paddingVertical: 2,
    paddingHorizontal: 7,
    color: employeePalette.muted,
  },
  address: { fontFamily: fonts.sans, fontSize: 11, color: employeePalette.muted },
  right: { alignItems: "flex-end", gap: 2 },
  amount: { fontFamily: fonts.monoMedium, fontSize: 13, color: employeePalette.ink },
  time: { fontFamily: fonts.mono, fontSize: 10, color: employeePalette.muted },
});
