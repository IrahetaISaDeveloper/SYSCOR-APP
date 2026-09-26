import { StyleSheet } from "react-native";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";

export default StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(27,22,19,0.45)",
  },
  sheet: {
    backgroundColor: employeePalette.surface,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: employeePalette.line,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    shadowColor: "#1B1613",
    shadowOffset: { width: 0, height: -14 },
    shadowOpacity: 0.18,
    shadowRadius: 17,
    elevation: 16,
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: employeePalette.line,
    marginBottom: 16,
  },
  scroll: {
    flexGrow: 0,
  },
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
});
