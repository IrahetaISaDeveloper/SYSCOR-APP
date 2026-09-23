import { StyleSheet } from "react-native";
import { employeePalette } from '@syscor/shared/src/styles/employeePalette';

export default StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 12,
    gap: 7,
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
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 0.4,
    color: employeePalette.ink,
  },
  floor: {
    marginHorizontal: 18,
    backgroundColor: employeePalette.surface2,
    borderRadius: 22,
    paddingVertical: 22,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: employeePalette.line,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
});
