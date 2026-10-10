import React from "react";
import { View, Text } from "react-native";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import styles, { DELIVERY_GREEN } from "../../styles/deliveryCommonStyles";

const SIZES = {
  sm: { marker: 9, lineMargin: 3, gap: 12, title: 12.5, detail: 11, railGap: 11 },
  md: { marker: 10, lineMargin: 4, gap: 16, title: 14, detail: 11.5, railGap: 12 },
};

export default function RouteTimeline({ pickup, dropoff, pickupLabel, dropoffLabel, size = "md", showPickupDetail = true }) {
  const s = SIZES[size];

  const renderStop = (label, title, detail) => (
    <View style={[styles.timelineStop, size === "md" && { gap: 3 }]}>
      <Text style={styles.timelineLabel}>{label}</Text>
      <Text style={[styles.timelineTitle, { fontSize: s.title }]} numberOfLines={2}>{title}</Text>
      {detail ? (
        <Text style={[styles.timelineDetail, { fontSize: s.detail }]} numberOfLines={2}>{detail}</Text>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.timeline, { gap: s.railGap }]}>
      <View style={styles.timelineRail}>
        <View style={{ width: s.marker, height: s.marker, borderRadius: s.marker / 2, backgroundColor: employeePalette.accent }} />
        <View style={[styles.timelineLine, { marginVertical: s.lineMargin }]} />
        <View style={{ width: s.marker, height: s.marker, borderRadius: 2, backgroundColor: DELIVERY_GREEN }} />
      </View>
      <View style={[styles.timelineStops, { gap: s.gap }]}>
        {renderStop(pickupLabel, pickup.name, showPickupDetail ? pickup.detail : null)}
        {renderStop(dropoffLabel, dropoff.address, size === "sm" ? dropoff.shortDetail : dropoff.detail)}
      </View>
    </View>
  );
}
