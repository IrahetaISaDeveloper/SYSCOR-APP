import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons as Icon } from "@expo/vector-icons";
import { useAuth } from "@syscor/shared/src/context/AuthContext";
import { textStyles } from "@syscor/shared/src/styles/typography";
import { useAuthMetrics } from "@syscor/shared/src/styles/authTheme";
import useTableRequests from "../../hooks/useTableRequests";
import { useTheme } from "../../theme/ThemeContext";

// Cuántas tarjetas se ven a la vez; el resto se resume en "+N".
const MAX_VISIBLE = 3;

const secondsUntil = (iso, now) => Math.max(0, Math.ceil((new Date(iso).getTime() - now) / 1000));

// Avisos de las mesas encima de cualquier pantalla del mesero: "Mesa 5 pide
// la cuenta", "Mesa 3 te llama"... con "Voy" para tomarla y "Atendida" para
// cerrarla. Tocar la tarjeta abre la mesa en el tablero.
export default function TableRequestsOverlay() {
  const { c } = useTheme();
  const { ms, gutter } = useAuthMetrics();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user } = useAuth();
  const myId = String(user?.id || user?._id || "");
  const { requests, busyId, acknowledge, resolve } = useTableRequests();

  // Reloj para la cuenta regresiva de "pasa a todos en 20 s".
  const counting = requests.some((r) => r.status === "pending" && r.escalateAt);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!counting) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [counting]);

  if (requests.length === 0) return null;

  const visible = requests.slice(0, MAX_VISIBLE);
  const hidden = requests.length - visible.length;

  const openTable = (request) =>
    navigation.navigate("WaiterTabs", {
      screen: "Dashboard",
      params: { openTableId: request.table, openAt: Date.now() },
    });

  return (
    <View
      pointerEvents="box-none"
      style={{ position: "absolute", top: insets.top + ms(6), left: gutter, right: gutter, gap: ms(6) }}
    >
      {visible.map((request) => {
        const mine = request.acknowledgedBy?.id === myId;
        const taken = request.status === "acknowledged";
        const busy = busyId === request._id;
        const isBill = request.type === "bill";
        const accent = taken ? c.success : c.primary;

        let subtitle = isBill ? request.payMethodLabel : request.reasonLabel;
        let hint = null;
        if (taken) hint = "Vas en camino. Márcala cuando la atiendas.";
        else if (request.escalated) hint = request.assignedWaiterName ? `${request.assignedWaiterName.split(" ")[0]} no respondió: es de todos.` : "Para cualquier mesero.";
        else if (request.status === "pending" && request.escalateAt) hint = `Pasa a todos en ${secondsUntil(request.escalateAt, now)} s.`;
        else if (request.reason === "tip") hint = "Es para ti: no se pasa a otros.";

        return (
          <TouchableOpacity
            key={request._id}
            onPress={() => openTable(request)}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel={`Mesa ${request.tableNumber}. ${isBill ? "Pide la cuenta" : "Te llama"}. ${subtitle || ""}`}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: ms(10),
              padding: ms(10),
              paddingLeft: ms(12),
              borderRadius: ms(16),
              borderWidth: 1,
              borderColor: accent,
              backgroundColor: c.surface,
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              elevation: 8,
            }}
          >
            <View
              style={{
                width: ms(42),
                height: ms(42),
                borderRadius: ms(12),
                backgroundColor: accent,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={[textStyles.title, { color: c.white, fontSize: ms(16), lineHeight: ms(18) }]}>{request.tableNumber}</Text>
              <Text style={{ color: c.white, fontSize: ms(7.5), fontWeight: "700", letterSpacing: 0.6 }}>MESA</Text>
            </View>

            <View style={{ flex: 1, gap: ms(1) }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: ms(5) }}>
                <Icon name={isBill ? "receipt-outline" : "hand-left-outline"} size={ms(14)} color={accent} />
                <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(14) }]} numberOfLines={1}>
                  {isBill ? "Pide la cuenta" : "Te llama"}
                </Text>
              </View>
              {subtitle ? (
                <Text style={[textStyles.body, { color: c.textDark, fontSize: ms(12.5) }]} numberOfLines={1}>
                  {subtitle}
                </Text>
              ) : null}
              {hint ? (
                <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(11.5) }]} numberOfLines={1}>
                  {hint}
                </Text>
              ) : null}
            </View>

            <TouchableOpacity
              onPress={() => (taken ? resolve(request._id) : acknowledge(request._id))}
              disabled={busy || (taken && !mine)}
              activeOpacity={0.85}
              accessibilityRole="button"
              style={{
                minWidth: ms(78),
                height: ms(40),
                paddingHorizontal: ms(12),
                borderRadius: ms(12),
                backgroundColor: taken ? c.surfaceMuted : c.primary,
                borderWidth: taken ? 1 : 0,
                borderColor: c.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {busy ? (
                <ActivityIndicator size="small" color={taken ? c.textDark : c.white} />
              ) : (
                <Text style={[textStyles.title, { color: taken ? c.textDark : c.white, fontSize: ms(13.5) }]}>
                  {taken ? "Atendida" : "Voy"}
                </Text>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        );
      })}

      {hidden > 0 ? (
        <View
          style={{
            alignSelf: "center",
            paddingHorizontal: ms(12),
            paddingVertical: ms(4),
            borderRadius: ms(12),
            backgroundColor: c.textDark,
          }}
        >
          <Text style={{ color: c.background, fontSize: ms(11.5), fontWeight: "700" }}>
            +{hidden} {hidden === 1 ? "solicitud más" : "solicitudes más"}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
