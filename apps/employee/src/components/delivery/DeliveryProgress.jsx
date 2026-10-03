import React, { Fragment } from "react";
import { View, Text } from "react-native";
import SymbolIcon from "../commons/SymbolIcon";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import { DELIVERY_GREEN, DELIVERY_ORANGE } from "../../styles/deliveryCommonStyles";
import styles from "../../styles/deliveryRouteScreenStyles";

const STEPS = [
  { key: "pickup", label: "RECOGIDA", icon: "storefront" },
  { key: "on_route", label: "EN CAMINO", icon: "two_wheeler" },
  { key: "delivered", label: "ENTREGADA", icon: "home" },
];

export default function DeliveryProgress({ stage = "on_route" }) {
  const current = Math.max(0, STEPS.findIndex((s) => s.key === stage));

  const stepStyle = (index) => {
    if (index < current) return { bg: DELIVERY_GREEN, color: "#FFFFFF", icon: "check" };
    if (index === current) return { bg: DELIVERY_ORANGE, color: "#FFFFFF", icon: STEPS[index].icon };
    return { bg: employeePalette.surface2, color: employeePalette.muted, icon: STEPS[index].icon };
  };

  return (
    <View style={styles.progressCard}>
      <Text style={styles.cardLabel}>PROGRESO DE LA ENTREGA</Text>

      <View style={styles.progressTrack}>
        {STEPS.map((step, index) => {
          const s = stepStyle(index);
          return (
            <Fragment key={step.key}>
              {index > 0 ? (
                <View
                  style={[
                    styles.progressBar,
                    { backgroundColor: index <= current ? DELIVERY_GREEN : employeePalette.line },
                  ]}
                />
              ) : null}
              <View style={[styles.progressStep, { backgroundColor: s.bg }]}>
                <SymbolIcon name={s.icon} size={15} color={s.color} />
              </View>
            </Fragment>
          );
        })}
      </View>

      <View style={styles.progressLabels}>
        {STEPS.map((step, index) => (
          <Text
            key={step.key}
            style={[styles.progressLabel, { color: index === current ? employeePalette.warnInk : employeePalette.muted }]}
          >
            {step.label}
          </Text>
        ))}
      </View>
    </View>
  );
}
