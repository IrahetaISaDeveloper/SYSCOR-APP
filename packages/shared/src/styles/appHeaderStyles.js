import { StyleSheet } from "react-native";
import { employeePalette } from "./employeePalette";

export default StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 8,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  eyebrow: {
    fontFamily: "monospace",
    fontSize: 10.5,
    color: employeePalette.muted,
  },
  title: {
    fontSize: 21,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: employeePalette.ink,
  },
  subtitle: {
    fontSize: 11.5,
    color: employeePalette.muted,
    marginTop: 1,
  },
});
