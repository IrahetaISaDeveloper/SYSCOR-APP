import { StyleSheet } from "react-native";
import { employeePalette } from '@syscor/shared/src/styles/employeePalette';

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
    backgroundColor: employeePalette.bg,
  },
  loadingText: {
    color: employeePalette.muted,
    fontSize: 13,
  },
  errorBanner: {
    marginHorizontal: 18,
    marginTop: 4,
    backgroundColor: employeePalette.warnSurface,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  errorText: {
    color: employeePalette.warnText,
    fontSize: 12,
    fontWeight: "600",
  },
  tablesButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: employeePalette.surface,
    borderWidth: 1,
    borderColor: employeePalette.line,
    alignItems: "center",
    justifyContent: "center",
  },
});
