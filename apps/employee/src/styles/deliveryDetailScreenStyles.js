import { makeStyles } from "../theme/ThemeContext";
import { fonts } from "./fonts";

export default makeStyles(({ p }) => ({
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
    backgroundColor: p.surface2,
    borderRadius: 20,
    padding: 15,
  },
  summaryIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: p.accent,
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
    color: p.muted,
  },
  summaryValue: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
    color: p.ink,
  },
  summaryAmountBox: {
    alignItems: "flex-end",
    gap: 2,
  },
  summaryAmount: {
    fontFamily: fonts.monoMedium,
    fontSize: 17,
    color: p.price,
  },
  summaryAmountPaid: {
    color: p.muted,
  },
  summaryPayment: {
    fontFamily: fonts.mono,
    fontSize: 9.5,
    color: p.muted,
  },

  card: {
    backgroundColor: p.surface,
    borderWidth: 1,
    borderColor: p.line,
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
    color: p.muted,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  itemQty: {
    fontFamily: fonts.monoMedium,
    fontSize: 12.5,
    color: p.accent,
  },
  itemName: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 13,
    color: p.ink,
  },
  divider: {
    height: 1,
    backgroundColor: p.line,
  },
  noteBox: {
    flexDirection: "row",
    gap: 9,
    backgroundColor: p.warnSurface,
    borderWidth: 1,
    borderColor: p.warnLine,
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
    color: p.warnText,
  },

  customerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    backgroundColor: p.surface,
    borderWidth: 1,
    borderColor: p.line,
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  customerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: p.surface2,
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
    color: p.ink,
  },
  customerPhone: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: p.muted,
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: p.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
}));
