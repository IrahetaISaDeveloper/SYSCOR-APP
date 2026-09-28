import { StyleSheet } from "react-native";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import { fonts } from "./fonts";

export default StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  texts: {
    flex: 1,
    gap: 3,
  },
  eyebrow: {
    fontFamily: fonts.mono,
    fontSize: 10.5,
    color: employeePalette.muted,
  },
  title: {
    fontFamily: fonts.sansBold,
    fontSize: 21,
    letterSpacing: -0.525,
    color: employeePalette.ink,
  },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 11.5,
    color: employeePalette.muted,
  },
  accessory: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: employeePalette.surface,
    borderWidth: 1,
    borderColor: employeePalette.line,
    alignItems: "center",
    justifyContent: "center",
  },
});
