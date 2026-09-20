import { StyleSheet } from "react-native";

export default StyleSheet.create({
  loadingBox: {
    paddingVertical: 30,
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    color: "#7F8C8D",
    fontSize: 13,
  },
  tabsRow: {
    flexDirection: "row",
    backgroundColor: "#F4F4F4",
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
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  tabLabel: {
    fontSize: 13,
    color: "#7F8C8D",
    fontWeight: "500",
  },
  tabLabelActive: {
    color: "#C62828",
    fontWeight: "700",
  },
  emptyText: {
    color: "#B0B4B8",
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
    borderBottomColor: "#F0F0F0",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
  },
  productPrice: {
    fontSize: 12,
    color: "#7F8C8D",
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
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#C62828",
    lineHeight: 18,
  },
  stepperButtonTextDisabled: {
    color: "#CCCCCC",
  },
  stepperValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2C3E50",
    minWidth: 16,
    textAlign: "center",
  },
  summaryBox: {
    marginTop: 14,
    backgroundColor: "#FDF2F0",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  summaryText: {
    color: "#C62828",
    fontWeight: "700",
    fontSize: 13,
    textAlign: "center",
  },
});
