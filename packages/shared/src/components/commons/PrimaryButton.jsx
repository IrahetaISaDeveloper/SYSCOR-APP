import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import primaryButtonStyles from "../../styles/primaryButtonStyles";

export default function PrimaryButton({
  label,
  onPress,
  variant = "primary", // primary | danger | ghost
  loading = false,
  disabled = false,
  icon = null,
  color = null, // color de fondo opcional, sobreescribe el del variant (no aplica a "ghost")
}) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        primaryButtonStyles.base,
        primaryButtonStyles[variant],
        color && variant !== "ghost" && { backgroundColor: color },
        isDisabled && primaryButtonStyles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              primaryButtonStyles.label,
              variant === "ghost" && primaryButtonStyles.ghostLabel,
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
