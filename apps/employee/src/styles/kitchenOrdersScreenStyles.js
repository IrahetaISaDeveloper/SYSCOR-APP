import { StyleSheet } from "react-native";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import { fonts } from "./fonts";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: employeePalette.bg,
  },
  filtersScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  filters: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 2,
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  filterChip: {
    backgroundColor: employeePalette.surface,
    borderWidth: 1,
    borderColor: employeePalette.line,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  filterChipActive: {
    backgroundColor: employeePalette.accent,
    borderColor: employeePalette.accent,
  },
  filterText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: employeePalette.muted,
  },
  filterTextActive: {
    fontFamily: fonts.sansBold,
    color: "#FFFFFF",
  },
  list: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingBottom: 18,
    gap: 12,
  },
  stateBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  stateText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: employeePalette.muted,
    textAlign: "center",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: employeePalette.accent,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  retryText: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: "#FFFFFF",
  },
});
