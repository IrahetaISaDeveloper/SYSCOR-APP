import React from "react";
import { View, Image } from "react-native";
import authCardStyles from "../../styles/authCardStyles";

export default function AuthCard({ children }) {
  return (
    <View style={authCardStyles.container}>
      <View style={authCardStyles.circleLeft} />
      <View style={authCardStyles.circleRight} />

      <View style={authCardStyles.card}>
        <View style={authCardStyles.logoContainer}>
          <Image
            source={require("../../../assets/logo png horizontal claro.png")}
            style={authCardStyles.logo}
            resizeMode="contain"
          />
        </View>
        {children}
      </View>
    </View>
  );
}