import { StyleSheet } from "react-native";
import { employeePalette } from '@syscor/shared/src/styles/employeePalette';

export default StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: employeePalette.ink,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: employeePalette.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: employeePalette.ink,
    backgroundColor: employeePalette.surface,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: employeePalette.ink,
    marginTop: 20,
    marginBottom: 4,
  },
  helperText: {
    fontSize: 12,
    color: employeePalette.muted,
    marginBottom: 12,
  },
  footer: {
    paddingTop: 12,
    paddingBottom: 4,
  },
});
