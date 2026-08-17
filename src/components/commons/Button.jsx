import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, radius } from '../../styles/theme';

const Button = ({ title, onPress, loading, disabled, icon, style }) => (
  <TouchableOpacity
    style={[styles.button, disabled && styles.disabled, style]}
    onPress={onPress}
    disabled={disabled || loading}
    activeOpacity={0.8}
  >
    {loading ? (
      <ActivityIndicator color={colors.white} />
    ) : (
      <>
        {icon}
        <Text style={styles.text}>{title}</Text>
      </>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 5,
  },
  disabled: { opacity: 0.5 },
  text: { color: colors.white, fontSize: 16, fontWeight: '700' },
});

export default Button;
