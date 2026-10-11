import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons as Icon } from "@expo/vector-icons";
import { useAuthMetrics } from "@syscor/shared/src/styles/authTheme";
import { useEmployeeNotifications } from "../../hooks/useEmployeeNotifications";
import { useTheme } from "../../theme/ThemeContext";

// Campana del encabezado con el número de avisos sin leer. Abre la bandeja.
export default function NotificationBell() {
  const navigation = useNavigation();
  const { c } = useTheme();
  const { ms } = useAuthMetrics();
  const { unreadCount } = useEmployeeNotifications();
  const size = ms(40);

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("Notifications")}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={unreadCount > 0 ? `Notificaciones, ${unreadCount} sin leer` : "Notificaciones"}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1,
        borderColor: c.border,
        backgroundColor: c.surface,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon name={unreadCount > 0 ? "notifications" : "notifications-outline"} size={ms(19)} color={c.textDark} />
      {unreadCount > 0 ? (
        <View
          style={{
            position: "absolute",
            top: -ms(3),
            right: -ms(3),
            minWidth: ms(18),
            height: ms(18),
            borderRadius: ms(9),
            paddingHorizontal: ms(4),
            backgroundColor: c.primary,
            borderWidth: 2,
            borderColor: c.background,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: c.white, fontSize: ms(9.5), fontWeight: "700" }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}
