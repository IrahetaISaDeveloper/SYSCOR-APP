import React from "react";
import { View, Text, FlatList, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SymbolIcon from "../../components/commons/SymbolIcon";
import { formatClock, formatMoney, isToday } from "../../constants/deliveryStatus";
import useDelivery from "../../hooks/useDelivery";
import { fonts } from "../../styles/fonts";
import useDeliveryCommonStyles from "../../styles/deliveryCommonStyles";
import { useTheme, makeStyles } from "../../theme/ThemeContext";

const METHOD_LABELS = { hand: "En mano", reception: "Recepción" };

function HistoryRow({ item }) {
  const s = useLocalStyles();
  const { p } = useTheme();
  const methodKey = item.deliveryMethod || "hand";
  const address = item.dropoff?.address || "Sin dirección";
  const time = isToday(item.deliveredAt)
    ? formatClock(item.deliveredAt)
    : item.deliveredAt
    ? new Date(item.deliveredAt).toLocaleDateString("es-SV", { day: "2-digit", month: "short" })
    : "--";

  return (
    <View style={s.row}>
      <View style={s.iconBox}>
        <SymbolIcon name="check_circle" size={18} color={p.muted} />
      </View>
      <View style={s.texts}>
        <View style={s.codeRow}>
          <Text style={s.code}>{item.code}</Text>
          <Text style={s.chip}>{METHOD_LABELS[methodKey] || methodKey}</Text>
        </View>
        <Text style={s.address} numberOfLines={1}>
          {address}
        </Text>
      </View>
      <View style={s.right}>
        <Text style={s.amount}>{item.collectedAmount > 0 ? formatMoney(item.collectedAmount) : "PAGADO"}</Text>
        <Text style={s.time}>{time}</Text>
      </View>
    </View>
  );
}

export default function DeliveryHistoryScreen() {
  const s = useLocalStyles();
  const { p } = useTheme();
  const commonStyles = useDeliveryCommonStyles();
  const { history, refreshing, onRefresh } = useDelivery();

  return (
    <SafeAreaView style={s.screen} edges={["top", "left", "right"]}>
      <View style={s.header}>
        <Text style={s.title}>Historial</Text>
      </View>
      <FlatList
        data={history}
        keyExtractor={(item) => String(item.id || item._id)}
        renderItem={({ item }) => <HistoryRow item={item} />}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={s.sep} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={p.accent}
          />
        }
        ListEmptyComponent={
          <View style={[commonStyles.emptyBox, { marginTop: 40 }]}>
            <SymbolIcon name="history" size={28} color={p.muted} />
            <Text style={commonStyles.emptyText}>No tienes entregas registradas aún.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const useLocalStyles = makeStyles(({ p }) => ({
  screen: { flex: 1, backgroundColor: p.bg },
  header: { paddingTop: 10, paddingHorizontal: 18, paddingBottom: 12 },
  title: {
    fontFamily: fonts.sansBold,
    fontSize: 21,
    letterSpacing: -0.525,
    color: p.ink,
  },
  list: { paddingHorizontal: 18, paddingBottom: 24, flexGrow: 1 },
  sep: { height: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: p.surface,
    borderWidth: 1,
    borderColor: p.line,
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: p.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  texts: { flex: 1, minWidth: 0, gap: 3 },
  codeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  code: { fontFamily: fonts.monoMedium, fontSize: 13.5, color: p.ink },
  chip: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 0.54,
    backgroundColor: p.surface2,
    borderRadius: 999,
    paddingVertical: 2,
    paddingHorizontal: 7,
    color: p.muted,
  },
  address: { fontFamily: fonts.sans, fontSize: 11, color: p.muted },
  right: { alignItems: "flex-end", gap: 2 },
  amount: { fontFamily: fonts.monoMedium, fontSize: 13, color: p.ink },
  time: { fontFamily: fonts.mono, fontSize: 10, color: p.muted },
}));
