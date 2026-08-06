import React from "react";
import { View, Text, Image } from "react-native";
import profileHeaderStyles from "../../styles/profileHeaderStyles";

export default function ProfileHeader({ image, fullName, typeLabel, email }) {
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  return (
    <View style={profileHeaderStyles.container}>
      <View style={profileHeaderStyles.avatarWrapper}>
        {image ? (
          <Image source={{ uri: image }} style={profileHeaderStyles.avatarImage} />
        ) : (
          <View style={profileHeaderStyles.avatarPlaceholder}>
            <Text style={profileHeaderStyles.avatarInitials}>{initials || "?"}</Text>
          </View>
        )}
      </View>

      <Text style={profileHeaderStyles.name}>{fullName || "Sin nombre"}</Text>
      <View style={profileHeaderStyles.typeBadge}>
        <Text style={profileHeaderStyles.typeBadgeText}>{typeLabel}</Text>
      </View>
      <Text style={profileHeaderStyles.email}>{email}</Text>
    </View>
  );
}