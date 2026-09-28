import { StyleSheet } from "react-native";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import { fonts } from "./fonts";

export default StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  texts: {
    flexShrink: 1,
    gap: 2,
  },
  title: {
    fontFamily: fonts.sansBold,
    fontSize: 19,
    letterSpacing: -0.38,
    color: employeePalette.ink,
  },
  eyebrow: {
    fontFamily: fonts.mono,
    fontSize: 10.5,
    color: employeePalette.muted,
  },
  accessories: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  activePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: employeePalette.accent,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 11,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },
  activeText: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    color: "#FFFFFF",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: employeePalette.surface,
    borderWidth: 1,
    borderColor: employeePalette.line,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: employeePalette.price,
    borderWidth: 1.5,
    borderColor: employeePalette.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBadgeText: {
    fontFamily: fonts.monoMedium,
    fontSize: 9,
    color: "#FFFFFF",
    includeFontPadding: false,
  },
});
