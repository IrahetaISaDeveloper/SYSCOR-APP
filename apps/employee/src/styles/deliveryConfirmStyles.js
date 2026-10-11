import { makeStyles } from "../theme/ThemeContext";
import { fonts } from "./fonts";

export default makeStyles(({ p }) => ({
  content: {
    paddingTop: 6,
    paddingHorizontal: 18,
    paddingBottom: 4,
    gap: 12,
  },

  collectCard: {
    backgroundColor: p.surface2,
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
  collectRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  collectTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
    color: p.ink,
  },
  collectAmount: {
    fontFamily: fonts.monoMedium,
    fontSize: 26,
    letterSpacing: -0.52,
    color: p.price,
  },
  collectAmountPaid: {
    color: p.muted,
  },
  collectDivider: {
    height: 1,
    backgroundColor: p.line,
  },
  collectDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  collectDetailText: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 12.5,
    color: p.muted,
  },

  sectionLabel: {
    fontFamily: fonts.mono,
    fontSize: 10.5,
    letterSpacing: 0.84,
    color: p.muted,
  },

  methodGrid: {
    flexDirection: "row",
    gap: 9,
  },
  methodOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: p.surface,
    borderWidth: 1,
    borderColor: p.line,
    borderRadius: 14,
    padding: 12,
  },
  methodOptionSelected: {
    borderWidth: 1.5,
    borderColor: p.accent,
  },
  methodLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 12.5,
    color: p.muted,
  },
  methodLabelSelected: {
    color: p.ink,
  },

  proofSection: {
    gap: 9,
  },
  proofSlot: {
    height: 132,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: p.line,
    borderStyle: "dashed",
    backgroundColor: p.surface,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  proofSlotFilled: {
    borderStyle: "solid",
    borderColor: p.accent,
  },
  proofImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  proofPlaceholderText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: p.muted,
  },
  cameraButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: p.surface,
    borderWidth: 1,
    borderColor: p.line,
    borderRadius: 14,
    padding: 12,
  },
  cameraLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 12.5,
    color: p.ink,
  },

  noteCard: {
    backgroundColor: p.surface,
    borderWidth: 1,
    borderColor: p.line,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 6,
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  noteHeaderLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.7,
    color: p.muted,
  },
  noteHint: {
    fontFamily: fonts.sans,
    fontSize: 12.5,
    color: p.muted,
  },
  noteInput: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: p.ink,
    minHeight: 48,
    paddingTop: 4,
    paddingBottom: 4,
    textAlignVertical: "top",
  },

  footerNote: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.5,
    color: p.muted,
    textAlign: "center",
  },
}));
