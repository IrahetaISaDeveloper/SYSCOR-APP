import { StyleSheet } from "react-native";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import { fonts } from "./fonts";

export default StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: employeePalette.surface,
    borderTopWidth: 1,
    borderTopColor: employeePalette.line,
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
    color: employeePalette.muted,
  },
  labelActive: {
    fontFamily: fonts.sansBold,
    color: employeePalette.accent,
  },
});
