import React, { useMemo } from "react";
import { View, Text, SectionList, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons as Icon } from "@expo/vector-icons";
import { textStyles } from "@syscor/shared/src/styles/typography";
import { useAuthMetrics } from "@syscor/shared/src/styles/authTheme";
import { useEmployeeNotifications } from "../hooks/useEmployeeNotifications";
import { iconForNotification, openNotificationTarget } from "../utils/notificationTargets";
import { useTheme } from "../theme/ThemeContext";

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

// Agrupa por día: Hoy, Ayer y Anteriores.
const groupByDay = (notifications) => {
  const today = startOfDay(new Date());
  const yesterday = today - 24 * 60 * 60 * 1000;
  const groups = { Hoy: [], Ayer: [], Anteriores: [] };
  for (const n of notifications) {
    const day = startOfDay(new Date(n.createdAt));
    if (day >= today) groups.Hoy.push(n);
    else if (day >= yesterday) groups.Ayer.push(n);
    else groups.Anteriores.push(n);
  }
  return Object.entries(groups)
    .filter(([, data]) => data.length > 0)
    .map(([title, data]) => ({ title, data }));
};

// "Ahora", "Hace 5 min", "14:32" o "lun 14:32".
const timeLabel = (iso) => {
  const date = new Date(iso);
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `Hace ${minutes} min`;
  const time = date.toLocaleTimeString("es-SV", { hour: "2-digit", minute: "2-digit" });
  if (startOfDay(date) === startOfDay(new Date())) return time;
  return `${date.toLocaleDateString("es-SV", { weekday: "short" })} ${time}`;
};

// Bandeja personal del empleado: los avisos que son para él (paquete
// asignado, comanda lista...). Tocar uno lo marca como leído y abre lo que
// corresponde.
export default function NotificationsScreen({ navigation }) {
  const { c } = useTheme();
  const { ms, gutter } = useAuthMetrics();
  const {
    notifications,
    unreadCount,
    hasMore,
    loading,
    refreshing,
    loadingMore,
    error,
    refresh,
    loadMore,
    markRead,
    markAllRead,
  } = useEmployeeNotifications();

  const sections = useMemo(() => groupByDay(notifications), [notifications]);

  const openItem = (item) => {
    if (!item.readAt) markRead(item._id);
    openNotificationTarget(item.data, navigation);
  };

  const header = (
    <View style={{ flexDirection: "row", alignItems: "center", gap: ms(12), paddingHorizontal: gutter, paddingTop: ms(10), paddingBottom: ms(12) }}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Regresar"
        style={{
          width: ms(40),
          height: ms(40),
          borderRadius: ms(20),
          borderWidth: 1,
          borderColor: c.border,
          backgroundColor: c.surface,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="arrow-back" size={ms(19)} color={c.textDark} />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(22) }]}>Notificaciones</Text>
        <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10) }]}>
          {unreadCount > 0 ? `${unreadCount} SIN LEER` : "TODO AL DÍA"}
        </Text>
      </View>
      {unreadCount > 0 ? (
        <TouchableOpacity onPress={markAllRead} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityRole="button">
          <Text style={[textStyles.link, { color: c.primary, fontSize: ms(13) }]}>Marcar leídas</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  const renderItem = ({ item }) => {
    const unread = !item.readAt;
    return (
      <TouchableOpacity
        onPress={() => openItem(item)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`${unread ? "Sin leer. " : ""}${item.title}. ${item.body}`}
        style={{
          flexDirection: "row",
          gap: ms(12),
          marginHorizontal: gutter,
          marginBottom: ms(8),
          padding: ms(14),
          borderRadius: ms(14),
          borderWidth: 1,
          borderColor: unread ? c.primary : c.border,
          backgroundColor: unread ? c.primaryTint : c.surface,
        }}
      >
        <View
          style={{
            width: ms(38),
            height: ms(38),
            borderRadius: ms(19),
            backgroundColor: unread ? c.primary : c.surfaceMuted,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name={iconForNotification(item.type)} size={ms(18)} color={unread ? c.white : c.textGray} />
        </View>
        <View style={{ flex: 1, gap: ms(3) }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: ms(8) }}>
            <Text style={[textStyles.title, { flex: 1, color: c.textDark, fontSize: ms(14.5) }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(11.5) }]}>{timeLabel(item.createdAt)}</Text>
          </View>
          <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13), lineHeight: ms(18) }]}>{item.body}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const empty = loading ? (
    <View style={{ paddingVertical: ms(60), alignItems: "center" }}>
      <ActivityIndicator color={c.primary} />
    </View>
  ) : (
    <View style={{ paddingVertical: ms(60), paddingHorizontal: ms(32), alignItems: "center", gap: ms(10) }}>
      <Icon name={error ? "cloud-offline-outline" : "notifications-off-outline"} size={ms(36)} color={c.textLight} />
      <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(16), textAlign: "center" }]}>
        {error ? "No se pudo cargar" : "Sin notificaciones"}
      </Text>
      <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13.5), textAlign: "center" }]}>
        {error || "Aquí te avisamos cuando haya algo para ti. Se guardan 7 días."}
      </Text>
      {error ? (
        <TouchableOpacity onPress={() => refresh({ pull: true })} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={[textStyles.link, { color: c.primary, fontSize: ms(13.5) }]}>Reintentar</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top", "left", "right"]}>
      {header}
      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item._id)}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => (
          <Text
            style={[
              textStyles.kicker,
              { color: c.textGray, fontSize: ms(10.5), paddingHorizontal: gutter, paddingTop: ms(8), paddingBottom: ms(8), backgroundColor: c.background },
            ]}
          >
            {section.title.toUpperCase()}
          </Text>
        )}
        ListEmptyComponent={empty}
        ListFooterComponent={loadingMore ? <ActivityIndicator style={{ marginVertical: ms(16) }} color={c.primary} /> : null}
        onEndReached={hasMore ? loadMore : undefined}
        onEndReachedThreshold={0.4}
        contentContainerStyle={{ paddingBottom: ms(32), flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => refresh({ pull: true })} tintColor={c.primary} colors={[c.primary]} />
        }
      />
    </SafeAreaView>
  );
}
