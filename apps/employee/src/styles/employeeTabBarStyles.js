import { makeStyles } from "../theme/ThemeContext";
import { fonts } from "./fonts";

export default makeStyles(({ p }) => ({
  container: {
    flexDirection: "row",
    backgroundColor: p.surface,
    borderTopWidth: 1,
    borderTopColor: p.line,
    paddingTop: 9,
    paddingHorizontal: 8,
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    color: p.muted,
  },
  labelActive: {
    fontFamily: fonts.sansBold,
    color: p.accent,
  },
}));
