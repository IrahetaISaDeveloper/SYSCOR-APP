import { makeStyles } from "../theme/ThemeContext";
import { fonts } from "./fonts";
import { DELIVERY_GREEN } from "./deliveryCommonStyles";

export default makeStyles(({ p }) => ({
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
    color: p.muted,
  },
  title: {
    fontFamily: fonts.sansBold,
    fontSize: 21,
    letterSpacing: -0.525,
    color: p.ink,
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
    backgroundColor: p.surface,
    borderWidth: 1,
    borderColor: p.line,
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
    backgroundColor: p.muted,
  },
  shiftText: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    color: "#FFFFFF",
  },
  shiftTextOff: {
    color: p.muted,
  },

  content: {
    paddingHorizontal: 18,
    paddingBottom: 12,
    gap: 12,
  },

  activeCard: {
    backgroundColor: p.surface,
    borderWidth: 1.5,
    borderColor: p.accent,
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
    color: p.ink,
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
    color: p.muted,
  },
  amountBox: {
    alignItems: "flex-end",
    gap: 2,
  },
  amount: {
    fontFamily: fonts.monoMedium,
    fontSize: 15,
    color: p.price,
  },
  amountPaid: {
    color: p.muted,
  },
  amountLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: p.muted,
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
    color: p.ink,
  },
  routeMin: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: p.muted,
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
    backgroundColor: p.accent,
    borderRadius: 14,
    padding: 13,
  },
  activeButtonLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 13.5,
    color: "#FFFFFF",
  },

  packageReason: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginHorizontal: 14,
    marginBottom: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: p.accentSoft,
  },
  packageReasonText: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 11.5,
    lineHeight: 16,
    color: p.ink,
  },
  packageReasonLabel: {
    fontFamily: fonts.sansBold,
    color: p.accent,
  },
  stopList: {
    marginHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: p.line,
    borderRadius: 14,
    overflow: "hidden",
  },
  stopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 11,
    borderBottomWidth: 1,
    borderBottomColor: p.line,
    backgroundColor: p.surface,
  },
  stopRowCurrent: {
    backgroundColor: p.warnSurface,
  },
  stopNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: p.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  stopNumberCurrent: {
    backgroundColor: p.accent,
    borderColor: p.accent,
  },
  stopNumberDone: {
    backgroundColor: DELIVERY_GREEN,
    borderColor: DELIVERY_GREEN,
  },
  stopNumberText: {
    fontFamily: fonts.monoMedium,
    fontSize: 11.5,
    color: p.ink,
  },
  stopDoneText: {
    color: p.muted,
    textDecorationLine: "line-through",
  },
  stopAmount: {
    fontFamily: fonts.monoMedium,
    fontSize: 12,
    color: p.price,
  },
  queueHint: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: p.muted,
    marginTop: -6,
  },

  pendingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: p.surface,
    borderWidth: 1,
    borderColor: p.line,
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  pendingIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: p.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  pendingTexts: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  pendingCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pendingCode: {
    fontFamily: fonts.monoMedium,
    fontSize: 13.5,
    color: p.ink,
  },
  kmChip: {
    backgroundColor: p.surface2,
    borderRadius: 999,
    paddingVertical: 2,
    paddingHorizontal: 7,
  },
  kmChipText: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 0.54,
    color: p.ink,
  },
  pendingSubtitle: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: p.muted,
  },
  pendingRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  pendingAmount: {
    fontFamily: fonts.monoMedium,
    fontSize: 13,
    color: p.ink,
  },
  pendingWait: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    color: p.warnInk,
  },
}));
