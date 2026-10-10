import React from 'react';
import { View, StyleSheet } from 'react-native';

// Barra segmentada que indica el avance del registro (paso 1 de N).
export default function StepProgress({ tokens, total, current }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.segment,
            { backgroundColor: index < current ? tokens.accent : tokens.border },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
});
