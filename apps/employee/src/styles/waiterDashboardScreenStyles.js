import { StyleSheet } from "react-native";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import { fonts } from "./fonts";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: employeePalette.bg,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: employeePalette.muted,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 18,
    marginBottom: 10,
    backgroundColor: employeePalette.warnSurface,
    borderWidth: 1,
    borderColor: employeePalette.warnLine,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  errorText: {
    flex: 1,
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: employeePalette.warnText,
  },
});
