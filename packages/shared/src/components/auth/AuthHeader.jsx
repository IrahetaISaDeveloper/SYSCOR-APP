import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { textStyles } from '../../styles/typography';

const noScale = { ms: (size) => size };

// Cabecera de las pantallas de acceso: botón de regreso a la izquierda y una
// etiqueta centrada ("PASO 1 DE 3"...). La etiqueta es opcional: el login ya no
// la usa.
export default function AuthHeader({
  tokens,
  metrics = noScale,
  label,
  onBack,
  showBack = true,
}) {
  const ms = metrics.ms;
  const size = ms(40);
  const slot = { width: size, height: size };

  return (
    <View style={styles.row}>
      {showBack ? (
        <TouchableOpacity
          style={[
            styles.backButton,
            slot,
            {
              borderRadius: size / 2,
              backgroundColor: tokens.surface,
              borderColor: tokens.border,
            },
          ]}
          onPress={onBack}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Regresar"
        >
          <Icon name="arrow-back" size={ms(20)} color={tokens.textPrimary} />
        </TouchableOpacity>
      ) : (
        <View style={slot} />
      )}

      {label ? (
        <Text
          style={[styles.label, { color: tokens.textMuted, fontSize: ms(11.5) }]}
          numberOfLines={1}
        >
          {label}
        </Text>
      ) : (
        <View style={styles.label} />
      )}

      {/* Mantiene la etiqueta ópticamente centrada */}
      <View style={slot} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...textStyles.kicker,
    flex: 1,
    textAlign: 'center',
    letterSpacing: 1.6,
  },
});
