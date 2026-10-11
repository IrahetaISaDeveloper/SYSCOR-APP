import { makeStyles } from "../theme/ThemeContext";
import { fonts } from "./fonts";

export const DELIVERY_GREEN = "#2ECC71";
export const DELIVERY_ORANGE = "#F39C12";

export default makeStyles(({ p }) => ({
  screen: {
    flex: 1,
    backgroundColor: p.bg,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  roundButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: p.surface,
    borderWidth: 1,
    borderColor: p.line,
    alignItems: "center",
    justifyContent: "center",
  },
  roundSpacer: {
    width: 38,
  },
  topBarTexts: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  topBarTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 18,
    letterSpacing: -0.36,
    color: p.ink,
  },
  topBarTitleMono: {
    fontFamily: fonts.monoMedium,
    fontSize: 17,
    color: p.ink,
  },
  topBarSubtitle: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.6,
    color: p.muted,
  },

  timeline: {
    flexDirection: "row",
  },
  timelineRail: {
    width: 18,
    alignItems: "center",
    paddingTop: 4,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: p.line,
  },
  timelineStops: {
    flex: 1,
    minWidth: 0,
  },
  timelineStop: {
    gap: 2,
  },
  timelineLabel: {
    fontFamily: fonts.mono,
    fontSize: 9.5,
    letterSpacing: 0.57,
    color: p.muted,
  },
  timelineTitle: {
    fontFamily: fonts.sansBold,
    color: p.ink,
  },
  timelineDetail: {
    fontFamily: fonts.sans,
    color: p.muted,
  },

  statsRow: {
    flexDirection: "row",
    gap: 9,
    paddingTop: 2,
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  statTile: {
    flex: 1,
    backgroundColor: p.surface,
    borderWidth: 1,
    borderColor: p.line,
    borderRadius: 16,
    padding: 11,
    gap: 3,
  },
  statValue: {
    fontFamily: fonts.monoMedium,
    fontSize: 19,
    color: p.ink,
  },
  statLabel: {
    fontFamily: fonts.mono,
    fontSize: 9,
    letterSpacing: 0.45,
    color: p.muted,
  },

  sectionLabel: {
    fontFamily: fonts.mono,
    fontSize: 10.5,
    letterSpacing: 0.84,
    color: p.muted,
  },

  footer: {
    paddingTop: 12,
    paddingHorizontal: 18,
    gap: 10,
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
  buttonDisabled: {
    opacity: 0.5,
  },

  emptyBox: {
    alignItems: "center",
    gap: 8,
    backgroundColor: p.surface,
    borderWidth: 1,
    borderColor: p.line,
    borderStyle: "dashed",
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 18,
  },
  emptyText: {
    fontFamily: fonts.sans,
    fontSize: 12.5,
    color: p.muted,
    textAlign: "center",
  },
}));
