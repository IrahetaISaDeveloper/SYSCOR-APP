import React from "react";
import { View, Text } from "react-native";
import infoSectionStyles from "../../styles/infoSectionStyles";

export default function InfoSection({ title, children }) {
  return (
    <View style={infoSectionStyles.section}>
      <Text style={infoSectionStyles.sectionTitle}>{title}</Text>
      <View style={infoSectionStyles.card}>{children}</View>
    </View>
  );
}