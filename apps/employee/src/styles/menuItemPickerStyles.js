import { StyleSheet } from "react-native";
import { employeePalette } from '@syscor/shared/src/styles/employeePalette';

export default StyleSheet.create({
  loadingBox: {
    paddingVertical: 30,
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    color: employeePalette.muted,
    fontSize: 13,
  },
  tabsRow: {
    flexDirection: "row",
    backgroundColor: employeePalette.surface2,
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: employeePalette.surface,
    shadowColor: "#1B1613",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  tabLabel: {
    fontSize: 13,
    color: employeePalette.muted,
    fontWeight: "500",
  },
  tabLabelActive: {
    color: employeePalette.accent,
    fontWeight: "700",
  },
  emptyText: {
    color: employeePalette.muted,
    fontSize: 13,
    paddingVertical: 20,
    textAlign: "center",
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: employeePalette.line,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: employeePalette.ink,
  },
  productPrice: {
    fontFamily: "monospace",
    fontSize: 12,
    color: employeePalette.muted,
    marginTop: 2,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepperButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: employeePalette.line,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: employeePalette.accent,
    lineHeight: 18,
  },
  stepperButtonTextDisabled: {
    color: employeePalette.line,
  },
  stepperValue: {
    fontFamily: "monospace",
    fontSize: 14,
    fontWeight: "500",
    color: employeePalette.ink,
    minWidth: 16,
    textAlign: "center",
  },
  summaryBox: {
    marginTop: 14,
    backgroundColor: employeePalette.accentSoft,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  summaryText: {
    color: employeePalette.accent,
    fontWeight: "700",
    fontSize: 13,
    textAlign: "center",
  },
});
