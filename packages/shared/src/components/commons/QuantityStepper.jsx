import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { darkPalette as d } from '../../styles/darkPalette';

const QuantityStepper = ({ value = 1, onIncrement, onDecrement }) => {
  const isDark = useColorScheme() === 'dark';
  return (
    <View style={[styles.container, isDark && darkStyles.container]}>
      <TouchableOpacity
        style={[styles.button, styles.decrementButton, isDark && darkStyles.decrementButton]}
        onPress={onDecrement}
        activeOpacity={0.7}
      >
        <Text style={[styles.decrementText, isDark && darkStyles.text]}>−</Text>
      </TouchableOpacity>

      <Text style={[styles.value, isDark && darkStyles.text]}>{value}</Text>

      <TouchableOpacity
        style={[styles.button, styles.incrementButton]}
        onPress={onIncrement}
        activeOpacity={0.7}
      >
        <Text style={styles.incrementText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F5',
    borderRadius: 24,
    padding: 3,
    alignSelf: 'flex-start',
  },
  button: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decrementButton: {
    backgroundColor: '#FFFFFF',
  },
  incrementButton: {
    backgroundColor: '#C62828',
  },
  decrementText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3F3F46',
  },
  incrementText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  value: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: '#18181B',
  },
});

// Capa para modo oscuro: solo cambia colores.
const darkStyles = StyleSheet.create({
  container: { backgroundColor: d.surfaceMuted },
  decrementButton: { backgroundColor: d.borderStrong },
  text: { color: d.textDark },
});

export default QuantityStepper;
