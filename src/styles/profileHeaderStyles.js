import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    marginBottom: 12,
  },
  avatarImage: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  avatarPlaceholder: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "#C62828",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
  },
  name: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2C3E50",
  },
  typeBadge: {
    backgroundColor: "#FDEDEA",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginTop: 6,
  },
  typeBadgeText: {
    color: "#C62828",
    fontSize: 12,
    fontWeight: "700",
  },
  email: {
    fontSize: 13,
    color: "#7F8C8D",
    marginTop: 8,
  },
});