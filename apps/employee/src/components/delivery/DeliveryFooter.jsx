import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useDeliveryCommonStyles from "../../styles/deliveryCommonStyles";

export default function DeliveryFooter({ children, style }) {
  const styles = useDeliveryCommonStyles();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.footer, { paddingBottom: Math.max(22, insets.bottom + 10) }, style]}>
      {children}
    </View>
  );
}
