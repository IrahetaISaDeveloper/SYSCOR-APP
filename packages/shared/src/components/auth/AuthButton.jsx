import React from 'react';
import { Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { textStyles } from '../../styles/typography';

const noScale = { ms: (size) => size };

// Botón de las pantallas de acceso. `variant` distingue la acción principal
// (relleno) de la secundaria (contorno), que se usa para "Crear cuenta".
export default function AuthButton({
  tokens,
  metrics = noScale,
  title,
  onPress,
  loading = false,
  disabled = false,
  arrow = true,
  variant = 'primary',
  style,
}) {
  const ms = metrics.ms;
  const isInactive = loading || disabled;
  const isPrimary = variant === 'primary';

  const textColor = isPrimary ? '#FFFFFF' : tokens.textPrimary;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: isPrimary ? tokens.accent : tokens.surface,
          borderWidth: isPrimary ? 0 : 1,
          borderColor: tokens.border,
          borderRadius: ms(14),
          paddingVertical: ms(16),
          gap: ms(8),
        },
        isInactive && styles.inactive,
        style,
      ]}
      onPress={onPress}
      disabled={isInactive}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ disabled: isInactive, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          <Text style={[styles.text, { color: textColor, fontSize: ms(16) }]}>{title}</Text>
          {arrow ? <Icon name="arrow-forward" size={ms(17)} color={textColor} /> : null}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactive: {
    opacity: 0.55,
  },
  text: {
    ...textStyles.button,
  },
});
