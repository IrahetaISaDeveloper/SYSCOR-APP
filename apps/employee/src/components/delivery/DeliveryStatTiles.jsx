import React from "react";
import { View, Text } from "react-native";
import styles from "../../styles/deliveryCommonStyles";

export default function DeliveryStatTiles({ tiles }) {
  return (
    <View style={styles.statsRow}>
      {tiles.map((tile) => (
        <View key={tile.label} style={styles.statTile}>
          <Text style={[styles.statValue, tile.color && { color: tile.color }]} numberOfLines={1} adjustsFontSizeToFit>
            {tile.value}
          </Text>
          <Text style={styles.statLabel} numberOfLines={1}>{tile.label}</Text>
        </View>
      ))}
    </View>
  );
}
