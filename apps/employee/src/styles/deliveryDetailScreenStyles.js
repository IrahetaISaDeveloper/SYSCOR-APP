import { StyleSheet } from "react-native";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import { fonts } from "./fonts";

export default StyleSheet.create({
  content: {
    paddingTop: 6,
    paddingHorizontal: 18,
    paddingBottom: 4,
    gap: 12,
  },

  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: employeePalette.surface2,
    borderRadius: 20,
    padding: 15,
  },
  summaryIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: employeePalette.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryTexts: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  summaryLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.7,
    color: employeePalette.muted,
  },
  summaryValue: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
    color: employeePalette.ink,
  },
  summaryAmountBox: {
    alignItems: "flex-end",
    gap: 2,
  },
  summaryAmount: {
    fontFamily: fonts.monoMedium,
    fontSize: 17,
    color: employeePalette.price,
  },
  summaryPayment: {
    fontFamily: fonts.mono,
    fontSize: 9.5,
    color: employeePalette.muted,
  },

  card: {
    backgroundColor: employeePalette.surface,
    borderWidth: 1,
    borderColor: employeePalette.line,
    borderRadius: 20,
    padding: 15,
  },
  itemsCard: {
    gap: 11,
  },
  cardLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.8,
    color: employeePalette.muted,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  itemQty: {
    fontFamily: fonts.monoMedium,
    fontSize: 12.5,
    color: employeePalette.accent,
  },
  itemName: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 13,
    color: employeePalette.ink,
  },
  divider: {
    height: 1,
    backgroundColor: employeePalette.line,
  },
  noteBox: {
    flexDirection: "row",
    gap: 9,
    backgroundColor: employeePalette.warnSurface,
    borderWidth: 1,
    borderColor: employeePalette.warnLine,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 11,
    marginTop: 2,
  },
  noteText: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 11.5,
    lineHeight: 16,
    color: employeePalette.warnText,
  },

  customerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    backgroundColor: employeePalette.surface,
    borderWidth: 1,
    borderColor: employeePalette.line,
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  customerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: employeePalette.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  customerTexts: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  customerName: {
    fontFamily: fonts.sansBold,
    fontSize: 13.5,
    color: employeePalette.ink,
  },
  customerPhone: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: employeePalette.muted,
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: employeePalette.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  footerRow: {
    flexDirection: "row",
    gap: 10,
  },
  rejectButton: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: employeePalette.line,
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 17,
  },
  rejectLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: employeePalette.muted,
  },
});
