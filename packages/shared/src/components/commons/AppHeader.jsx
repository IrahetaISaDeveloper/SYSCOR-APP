import React from "react";
import { View, Text } from "react-native";
import appHeaderStyles from "../../styles/appHeaderStyles";

export default function AppHeader({ title, subtitle, accessory }) {
  return (
    <View style={appHeaderStyles.container}>
      <View style={appHeaderStyles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={appHeaderStyles.title}>{title}</Text>
          {subtitle ? <Text style={appHeaderStyles.subtitle}>{subtitle}</Text> : null}
        </View>
        {accessory ? <View>{accessory}</View> : null}
      </View>
    </View>
  );
}