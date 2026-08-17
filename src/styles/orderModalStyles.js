import { StyleSheet } from "react-native";

export default StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 12,
  },
  activeOrdersBox: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 8,
  },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  orderItems: {
    fontSize: 13,
    color: "#2C3E50",
    fontWeight: "600",
  },
  orderTotal: {
    fontSize: 12,
    color: "#7F8C8D",
    marginTop: 2,
  },
  footer: {
    paddingTop: 12,
    paddingBottom: 4,
  },
});
