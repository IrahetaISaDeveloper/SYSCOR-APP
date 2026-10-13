import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons as Icon } from "@expo/vector-icons";
import { textStyles } from "@syscor/shared/src/styles/typography";
import { useAuthMetrics } from "@syscor/shared/src/styles/authTheme";
import { TABLE_STATE, getTableState } from "../../styles/waiterTheme";
import { useTheme, makeStyles } from "../../theme/ThemeContext";

export default function TableOptionsSheet({ table, onChangeStatus, onAssignTable, onViewAccount }) {
  const { c, isDark } = useTheme();
  const styles = useStyles();
  const { ms } = useAuthMetrics();
  const state = getTableState(table.status, isDark);

  return (
    <View style={{ gap: ms(12) }}>
      <View style={[styles.row, { gap: ms(12), marginBottom: ms(4) }]}>
        <View style={[styles.badge, { width: ms(52), height: ms(52), borderRadius: ms(14) }]}>
          <Text style={[textStyles.kicker, { color: "rgba(255,255,255,0.65)", fontSize: ms(8) }]}>MESA</Text>
          <Text style={[textStyles.title, { color: c.white, fontSize: ms(21) }]}>{table.number}</Text>
        </View>
        <View style={{ flex: 1, gap: ms(3) }}>
          <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(19) }]}>Mesa {table.number}</Text>
          <View style={[styles.row, { alignSelf: "flex-start", gap: ms(6), borderRadius: ms(12), paddingHorizontal: ms(9), paddingVertical: ms(5), backgroundColor: isDark ? `${state.color}33` : state.tint }]}>
            <View style={{ width: ms(6), height: ms(6), borderRadius: ms(3), backgroundColor: state.color }} />
            <Text style={[textStyles.kicker, { color: c.textDark, fontSize: ms(9.5) }]}>{state.label}</Text>
          </View>
        </View>
      </View>

      <OptionButton
        icon="swap-horizontal-outline"
        label="Cambiar estado"
        description="Actualizar solo el estado de esta mesa."
        onPress={onChangeStatus}
        ms={ms}
      />
      <OptionButton
        icon="people-outline"
        label="Asignar mesa"
        description="Crear una comanda o asignar una de caja."
        onPress={onAssignTable}
        ms={ms}
      />
      {table.status === "ocupada" ? (
        <OptionButton
          icon="receipt-outline"
          label="Ver cuenta"
          description="Revisar comandas, cobrar o liberar la mesa."
          onPress={onViewAccount}
          ms={ms}
        />
      ) : null}
    </View>
  );
}

function OptionButton({ icon, label, description, onPress, ms }) {
  const { c } = useTheme();
  const styles = useStyles();
  return (
    <TouchableOpacity
      style={[
        styles.option,
        styles.row,
        { borderRadius: ms(14), padding: ms(14), gap: ms(12) },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
    >
      <Icon name={icon} size={ms(20)} color={TABLE_STATE.ocupada.color} />
      <View style={{ flex: 1, gap: ms(2) }}>
        <Text style={[textStyles.button, { color: c.textDark, fontSize: ms(14.5) }]}>{label}</Text>
        <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12) }]}>{description}</Text>
      </View>
      <Icon name="chevron-forward" size={ms(18)} color={c.textLight} />
    </TouchableOpacity>
  );
}

const useStyles = makeStyles(({ c }) => ({
  row: { flexDirection: "row", alignItems: "center" },
  badge: { alignItems: "center", justifyContent: "center", backgroundColor: "#211C18" },
  option: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border },
}));
