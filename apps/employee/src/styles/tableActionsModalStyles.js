import { StyleSheet } from "react-native";

export default StyleSheet.create({
  body: {
    paddingBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F4F4F4",
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleDanger: {
    backgroundColor: "#FDEDEA",
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
  },
  rowLabelDanger: {
    color: "#C62828",
  },
  iconEmoji: {
    fontSize: 17,
  },
  chevron: {
    fontSize: 20,
    color: "#B0B4B8",
    fontWeight: "600",
  },
});
