import { makeStyles } from "../theme/ThemeContext";
import { fonts } from "./fonts";

export default makeStyles(({ p }) => ({
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  tableAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: p.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  tableAvatarNumber: {
    fontFamily: fonts.monoMedium,
    fontSize: 17,
    lineHeight: 20,
    color: "#FFFFFF",
    includeFontPadding: false,
  },
  tableAvatarLabel: {
    fontFamily: fonts.mono,
    fontSize: 7.5,
    lineHeight: 10,
    letterSpacing: 0.45,
    color: "#FFFFFF",
    includeFontPadding: false,
  },
  summaryTexts: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  summaryTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 18,
    letterSpacing: -0.36,
    color: p.ink,
  },
  summaryInfo: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: p.muted,
  },
  summaryTotals: {
    alignItems: "flex-end",
    gap: 2,
  },
  totalAmount: {
    fontFamily: fonts.monoMedium,
    fontSize: 16,
    color: p.price,
  },
  totalLabel: {
    fontFamily: fonts.mono,
    fontSize: 9.5,
    color: p.muted,
  },

  infoBox: {
    backgroundColor: p.surface2,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 14,
    gap: 8,
  },
  boxLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.8,
    color: p.muted,
  },
  boxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  boxRowText: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 12.5,
    color: p.ink,
  },
  boxRowStatus: {
    fontFamily: fonts.mono,
    fontSize: 10,
  },
  boxRowAmount: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: p.ink,
  },
  boxDivider: {
    height: 1,
    backgroundColor: p.line,
    marginVertical: 2,
  },
  boxTotalLabel: {
    flex: 1,
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    letterSpacing: 0.5,
    color: p.ink,
  },
  boxTotalAmount: {
    fontFamily: fonts.monoMedium,
    fontSize: 15,
    color: p.price,
  },

  actions: {
    gap: 9,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    borderWidth: 1,
    borderColor: p.line,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 13,
  },
  actionRowSelected: {
    borderWidth: 1.5,
    borderColor: p.accent,
    paddingVertical: 11.5,
    paddingHorizontal: 12.5,
  },
  actionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: p.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  actionIconBoxWarn: {
    backgroundColor: p.warnSoft,
  },
  actionTexts: {
    flex: 1,
  },
  actionLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 13.5,
    color: p.ink,
  },
  actionLabelWarn: {
    color: p.warnInk,
  },
  actionHint: {
    fontFamily: fonts.sans,
    fontSize: 11.5,
    color: p.muted,
    marginTop: 2,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    backgroundColor: p.surface,
    borderWidth: 1,
    borderColor: p.line,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 13.5,
    color: p.ink,
    padding: 0,
  },
  inputRowLabel: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 13.5,
    color: p.ink,
  },
  inputTag: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: p.muted,
  },

  warnBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    backgroundColor: p.warnSurface,
    borderWidth: 1,
    borderColor: p.warnLine,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  warnText: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 16,
    color: p.warnText,
  },

  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: p.accent,
    borderRadius: 18,
    padding: 16,
  },
  primaryButtonLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
    color: "#FFFFFF",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: p.surface,
    borderWidth: 1,
    borderColor: p.line,
    borderRadius: 18,
    padding: 15,
  },
  secondaryButtonLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: p.ink,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttons: {
    gap: 9,
  },
}));
