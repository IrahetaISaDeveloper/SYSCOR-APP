import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import quantityStepperStyles from "../../styles/quantityStepperStyles";

export default function QuantityStepper({ value, onDecrease, onIncrease, min = 0, max = 99 }) {
  const atMin = value <= min;

  return (
    <View style={quantityStepperStyles.container}>
      <TouchableOpacity
        style={quantityStepperStyles.minus}
        onPress={onDecrease}
        disabled={atMin}
        hitSlop={4}
        accessibilityLabel="Disminuir"
      >
        <Text style={[quantityStepperStyles.sign, atMin && quantityStepperStyles.muted]}>−</Text>
      </TouchableOpacity>
      <Text style={[quantityStepperStyles.value, value === 0 && quantityStepperStyles.muted]}>{value}</Text>
      <TouchableOpacity
        style={quantityStepperStyles.plus}
        onPress={onIncrease}
        disabled={value >= max}
        hitSlop={4}
        accessibilityLabel="Aumentar"
      >
        <Text style={[quantityStepperStyles.sign, quantityStepperStyles.signLight]}>+</Text>
      </TouchableOpacity>
    </View>
  );
}
