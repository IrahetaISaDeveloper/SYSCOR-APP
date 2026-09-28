import { StyleSheet } from "react-native";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import { fonts } from "./fonts";

export default StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: employeePalette.surface2,
    borderRadius: 999,
    padding: 3,
  },
  minus: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: employeePalette.surface,
    borderWidth: 1,
    borderColor: employeePalette.line,
    alignItems: "center",
    justifyContent: "center",
  },
  plus: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: employeePalette.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  sign: {
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 18,
    color: employeePalette.ink,
    includeFontPadding: false,
  },
  signLight: {
    color: "#FFFFFF",
  },
  muted: {
    color: employeePalette.muted,
  },
  value: {
    minWidth: 22,
    textAlign: "center",
    fontFamily: fonts.monoMedium,
    fontSize: 13,
    color: employeePalette.ink,
  },
});
