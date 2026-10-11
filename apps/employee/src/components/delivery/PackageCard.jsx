import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import SymbolIcon from "../commons/SymbolIcon";
import {
  PACKAGE_BADGE,
  collectsOnDelivery,
  formatKm,
  formatMoney,
  stopsLabel,
} from "../../constants/deliveryStatus";
import useDeliveriesScreenStyles from "../../styles/deliveriesScreenStyles";
import { useTheme } from "../../theme/ThemeContext";

// Paquete de entregas que armó Chef Panchita: las paradas en el orden en que
// conviene entregarlas, por qué se agruparon así y el botón para salir (o
// para seguir con la parada que toca).
export default function PackageCard({ pkg, starting, onStart, onContinue, onOpenStop }) {
  const { p } = useTheme();
  const styles = useDeliveriesScreenStyles();
  const badge = PACKAGE_BADGE[pkg.status] || PACKAGE_BADGE.assigned;
  const toCollect = pkg.stops.reduce((sum, stop) => sum + (collectsOnDelivery(stop) ? Number(stop.amountToCollect) : 0), 0);
  const delivered = pkg.stops.filter((stop) => stop.status === "delivered").length;
  const isAssigned = pkg.status === "assigned";

  return (
    <View style={styles.activeCard}>
      <View style={styles.activeTop}>
        <View style={styles.activeTopLeft}>
          <View style={styles.codeRow}>
            <Text style={styles.code}>{pkg.code}</Text>
            <View style={[styles.badge, { backgroundColor: badge.color }]}>
              <Text style={styles.badgeText}>{badge.label}</Text>
            </View>
          </View>
          <Text style={styles.activeSubtitle} numberOfLines={1}>
            {stopsLabel(pkg.stops.length)}
            {pkg.distanceKm != null ? ` · ${formatKm(pkg.distanceKm)} de recorrido` : ""}
            {!isAssigned ? ` · ${delivered}/${pkg.stops.length} entregadas` : ""}
          </Text>
        </View>
        <View style={styles.amountBox}>
          <Text style={[styles.amount, toCollect === 0 && styles.amountPaid]}>
            {toCollect > 0 ? formatMoney(toCollect) : "PAGADO"}
          </Text>
          <Text style={styles.amountLabel}>{toCollect > 0 ? "POR COBRAR" : "EN LÍNEA"}</Text>
        </View>
      </View>

      {pkg.reason ? (
        <View style={styles.packageReason}>
          <SymbolIcon name="merge" size={15} color={p.accent} />
          <Text style={styles.packageReasonText}>
            <Text style={styles.packageReasonLabel}>Chef Panchita: </Text>
            {pkg.reason}
          </Text>
        </View>
      ) : null}

      <View style={styles.stopList}>
        {pkg.stops.map((stop, index) => {
          const done = stop.status === "delivered";
          const current = String(stop.id) === String(pkg.currentStopId) && !isAssigned;
          return (
            <TouchableOpacity
              key={stop.id}
              style={[styles.stopRow, current && styles.stopRowCurrent]}
              onPress={() => onOpenStop(stop)}
              activeOpacity={0.8}
            >
              <View style={[styles.stopNumber, done && styles.stopNumberDone, current && styles.stopNumberCurrent]}>
                {done ? (
                  <SymbolIcon name="check" size={13} color="#FFFFFF" />
                ) : (
                  <Text style={[styles.stopNumberText, current && { color: "#FFFFFF" }]}>{stop.sequence || index + 1}</Text>
                )}
              </View>
              <View style={styles.pendingTexts}>
                <Text style={[styles.pendingCode, done && styles.stopDoneText]}>{stop.code}</Text>
                <Text style={styles.pendingSubtitle} numberOfLines={1}>
                  {stop.dropoff?.address} · {stop.customer?.name}
                </Text>
              </View>
              <Text style={[styles.stopAmount, !collectsOnDelivery(stop) && styles.amountPaid]}>
                {collectsOnDelivery(stop) ? formatMoney(stop.amountToCollect) : "PAGADO"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.activeAction}>
        <TouchableOpacity
          style={[styles.activeButton, starting && { opacity: 0.7 }]}
          onPress={isAssigned ? onStart : onContinue}
          activeOpacity={0.85}
          disabled={starting}
        >
          {starting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <SymbolIcon name="navigation" size={17} color="#FFFFFF" />
              <Text style={styles.activeButtonLabel}>
                {isAssigned ? "Salir a ruta con el paquete" : "Continuar con la siguiente parada"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
