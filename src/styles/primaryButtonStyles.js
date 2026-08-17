import { StyleSheet } from "react-native";

export default StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  primary: {
    backgroundColor: "#E74C3C",
  },
  danger: {
    backgroundColor: "#C0392B",
  },
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  ghostLabel: {
    color: "#2C3E50",
  },
});
