import { StyleSheet } from "react-native";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import { fonts } from "./fonts";

export default StyleSheet.create({
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    paddingTop: 4,
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: employeePalette.surface,
    borderWidth: 1,
    borderColor: employeePalette.line,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.4,
    color: employeePalette.ink,
    includeFontPadding: false,
  },
  floor: {
    flex: 1,
    marginHorizontal: 18,
    marginBottom: 14,
    backgroundColor: employeePalette.surface2,
    borderWidth: 1,
    borderColor: employeePalette.line,
    borderRadius: 22,
    overflow: "hidden",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 26,
    paddingVertical: 22,
    paddingHorizontal: 18,
  },
  emptyBox: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontFamily: fonts.sans,
    fontSize: 12.5,
    color: employeePalette.muted,
    textAlign: "center",
  },
});
