import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { textStyles } from '@syscor/shared/src/styles/typography';

// Cantidad en forma de píldora: "−" en un círculo claro, el número y "+" en
// un círculo del color principal. Se usa en el detalle del producto y en la bolsa.
const PillStepper = ({ value, onIncrement, onDecrement, colors: c, bandColor, ms, size = 'md', min = 1 }) => {
  const circle = ms(size === 'sm' ? 26 : 32);
  const atMin = value <= min;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: ms(size === 'sm' ? 10 : 14),
        padding: ms(4),
        borderRadius: circle,
        backgroundColor: bandColor,
      }}
    >
      <TouchableOpacity
        onPress={onDecrement}
        disabled={atMin}
        style={{
          width: circle,
          height: circle,
          borderRadius: circle / 2,
          backgroundColor: c.surface,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: atMin ? 0.5 : 1,
        }}
        accessibilityRole="button"
        accessibilityLabel="Quitar uno"
      >
        <Icon name="remove" size={ms(size === 'sm' ? 14 : 16)} color={c.textDark} />
      </TouchableOpacity>
      <Text
        style={[textStyles.num, { color: c.textDark, fontSize: ms(size === 'sm' ? 14 : 15), minWidth: ms(14), textAlign: 'center' }]}
      >
        {value}
      </Text>
      <TouchableOpacity
        onPress={onIncrement}
        style={{
          width: circle,
          height: circle,
          borderRadius: circle / 2,
          backgroundColor: c.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        accessibilityRole="button"
        accessibilityLabel="Agregar uno"
      >
        <Icon name="add" size={ms(size === 'sm' ? 14 : 16)} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

export default PillStepper;
