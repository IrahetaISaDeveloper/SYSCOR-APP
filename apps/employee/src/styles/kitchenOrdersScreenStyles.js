import { makeStyles } from "../theme/ThemeContext";
import { fonts } from "./fonts";

export default makeStyles(({ p }) => ({
  container: {
    flex: 1,
    backgroundColor: p.bg,
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
    backgroundColor: p.surface,
    borderWidth: 1,
    borderColor: p.line,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  filterChipActive: {
    backgroundColor: p.accent,
    borderColor: p.accent,
  },
  filterText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: p.muted,
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
    color: p.muted,
    textAlign: "center",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: p.accent,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  retryText: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: "#FFFFFF",
  },
}));
