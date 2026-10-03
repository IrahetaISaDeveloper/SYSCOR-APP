import { StyleSheet } from "react-native";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import { fonts } from "./fonts";
import { DELIVERY_GREEN } from "./deliveryCommonStyles";

export default StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  headerTexts: {
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
  shiftPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: DELIVERY_GREEN,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  shiftPillOff: {
    backgroundColor: employeePalette.surface,
    borderWidth: 1,
    borderColor: employeePalette.line,
    paddingVertical: 6,
    paddingHorizontal: 11,
  },
  shiftDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  shiftDotOff: {
    backgroundColor: employeePalette.muted,
  },
  shiftText: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    color: "#FFFFFF",
  },
  shiftTextOff: {
    color: employeePalette.muted,
  },

  content: {
    paddingHorizontal: 18,
    paddingBottom: 12,
    gap: 12,
  },

  activeCard: {
    backgroundColor: employeePalette.surface,
    borderWidth: 1.5,
    borderColor: employeePalette.accent,
    borderRadius: 20,
    overflow: "hidden",
  },
  activeTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    paddingTop: 13,
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  activeTopLeft: {
    flex: 1,
    gap: 4,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  code: {
    fontFamily: fonts.monoMedium,
    fontSize: 16,
    color: employeePalette.ink,
  },
  badge: {
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  badgeText: {
    fontFamily: fonts.mono,
    fontSize: 9.5,
    letterSpacing: 0.665,
    color: "#FFFFFF",
    includeFontPadding: false,
  },
  activeSubtitle: {
    fontFamily: fonts.sans,
    fontSize: 11.5,
    color: employeePalette.muted,
  },
  amountBox: {
    alignItems: "flex-end",
    gap: 2,
  },
  amount: {
    fontFamily: fonts.monoMedium,
    fontSize: 15,
    color: employeePalette.price,
  },
  amountLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: employeePalette.muted,
  },
  activeRoute: {
    flexDirection: "row",
    gap: 11,
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  activeRouteMetrics: {
    alignItems: "flex-end",
    justifyContent: "flex-end",
    gap: 2,
  },
  routeKm: {
    fontFamily: fonts.monoMedium,
    fontSize: 14,
    color: employeePalette.ink,
  },
  routeMin: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: employeePalette.muted,
  },
  activeAction: {
    paddingHorizontal: 14,
    paddingBottom: 13,
  },
  activeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: employeePalette.accent,
    borderRadius: 14,
    padding: 13,
  },
  activeButtonLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 13.5,
    color: "#FFFFFF",
  },

  availableRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: employeePalette.surface,
    borderWidth: 1,
    borderColor: employeePalette.line,
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  availableIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: employeePalette.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  availableTexts: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  availableCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  availableCode: {
    fontFamily: fonts.monoMedium,
    fontSize: 13.5,
    color: employeePalette.ink,
  },
  kmChip: {
    backgroundColor: employeePalette.surface2,
    borderRadius: 999,
    paddingVertical: 2,
    paddingHorizontal: 7,
  },
  kmChipText: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 0.54,
    color: employeePalette.ink,
  },
  availableSubtitle: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: employeePalette.muted,
  },
  availableRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  availableAmount: {
    fontFamily: fonts.monoMedium,
    fontSize: 13,
    color: employeePalette.ink,
  },
  acceptText: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    color: employeePalette.price,
  },
});
