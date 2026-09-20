import React from "react";
import { TextInput } from "react-native";
import digitInputStyles from "../../styles/digitInputStyles";

export default function DigitInput({ value, onChangeText, onKeyPress, inputRef }) {
  return (
    <TextInput
      ref={inputRef}
      style={digitInputStyles.input}
      value={value}
      onChangeText={onChangeText}
      onKeyPress={onKeyPress}
      keyboardType="number-pad"
      maxLength={1}
      textAlign="center"
      selectTextOnFocus
    />
  );
}