import React from "react";
import { View, Text } from "react-native";
import SymbolIcon from "../commons/SymbolIcon";
import { formatKm, formatMinutes } from "../../constants/deliveryStatus";
import useDeliveryRouteScreenStyles from "../../styles/deliveryRouteScreenStyles";
import { useTheme } from "../../theme/ThemeContext";

export default function NavigationCard({ navigation, arrivalClock, distanceKm, etaMinutes }) {
  const { p } = useTheme();
  const styles = useDeliveryRouteScreenStyles();
  return (
    <View style={styles.navCard}>
      <View style={styles.navRow}>
        <View style={styles.navIcon}>
          <SymbolIcon name={navigation.icon} size={25} color={p.inverseText} />
        </View>
        <View style={styles.navTexts}>
          <Text style={styles.navInstruction} numberOfLines={2}>{navigation.instruction}</Text>
          {navigation.street ? (
            <Text style={styles.navStreet} numberOfLines={1}>{navigation.street}</Text>
          ) : null}
        </View>
        <Text style={styles.navDistance}>{navigation.distance}</Text>
      </View>

      <View style={styles.navDivider} />

      <View style={styles.navFooter}>
        <View style={styles.navArrival}>
          <SymbolIcon name="schedule" size={15} color={p.inverseText} />
          <Text style={styles.navMono}>LLEGADA {arrivalClock}</Text>
        </View>
        <View style={styles.navMetrics}>
          <Text style={[styles.navMono, styles.navMonoDim]}>{formatKm(distanceKm).toUpperCase()}</Text>
          <Text style={[styles.navMono, styles.navMonoStrong]}>{formatMinutes(etaMinutes).toUpperCase()}</Text>
        </View>
      </View>
    </View>
  );
}
