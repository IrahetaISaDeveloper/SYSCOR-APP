import { makeStyles } from "../theme/ThemeContext";
import { fonts } from "./fonts";

export default makeStyles(({ p, isDark }) => ({
  card: {
    backgroundColor: p.surface,
    borderWidth: 1,
    borderColor: p.line,
    borderRadius: 20,
    overflow: "hidden",
  },
  cardLate: {
    borderWidth: 1.5,
    borderColor: p.price,
  },
  cardCancelled: {
    opacity: 0.65,
  },
  bottomSpacer: {
    height: 5,
  },

  top: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    paddingTop: 13,
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  topLeft: {
    flex: 1,
    gap: 4,
  },
  idRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  displayId: {
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
  contextRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  contextText: {
    flexShrink: 1,
    fontFamily: fonts.sans,
    fontSize: 11.5,
    color: p.muted,
  },
  topRight: {
    alignItems: "flex-end",
    gap: 2,
  },
  clockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  clock: {
    fontFamily: fonts.monoMedium,
    fontSize: 15,
    color: p.ink,
  },
  clockLate: {
    color: p.price,
  },
  ago: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: p.muted,
  },

  assigneeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: p.surface2,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  assigneeLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.6,
    color: p.muted,
  },
  assigneeName: {
    flexShrink: 1,
    fontFamily: fonts.sansBold,
    fontSize: 11.5,
    color: p.ink,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 10,
    paddingHorizontal: 14,
    paddingBottom: 4,
  },
  sectionLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.8,
    color: p.muted,
  },

  items: {
    paddingHorizontal: 14,
    paddingBottom: 8,
    gap: 7,
  },
  itemBox: {
    borderWidth: 1,
    borderColor: p.line,
    borderRadius: 12,
    overflow: "hidden",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingVertical: 9,
    paddingHorizontal: 11,
  },
  itemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  itemName: {
    flex: 1,
    fontFamily: fonts.sansBold,
    fontSize: 13.5,
    color: p.ink,
  },
  notes: {
    flexDirection: "row",
    gap: 7,
    backgroundColor: p.warnSurface,
    borderTopWidth: 1,
    borderTopColor: p.warnLine,
    paddingVertical: 7,
    paddingHorizontal: 11,
  },
  notesStandalone: {
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: p.warnLine,
    borderRadius: 12,
  },
  notesTexts: {
    flex: 1,
    gap: 1,
  },
  notesLabel: {
    fontFamily: fonts.mono,
    fontSize: 9.5,
    letterSpacing: 0.57,
    color: p.warnInk,
  },
  notesText: {
    fontFamily: fonts.sansMedium,
    fontStyle: "italic",
    fontSize: 11.5,
    color: p.warnText,
  },

  actions: {
    flexDirection: "row",
    gap: 9,
    paddingHorizontal: 14,
    paddingBottom: 13,
  },
  waitingBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: isDark ? "#252B38" : "#E3E7EF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  waitingText: {
    flex: 1,
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: isDark ? "#B7C3DE" : "#3D4A66",
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 14,
    padding: 12,
    minHeight: 44,
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: p.line,
    padding: 11,
  },
  buttonAccent: {
    backgroundColor: p.accent,
  },
  buttonInk: {
    backgroundColor: p.inverseBg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: "#FFFFFF",
  },
  buttonLabelMuted: {
    color: p.muted,
  },
  buttonLabelInk: {
    color: p.inverseText,
  },
}));
