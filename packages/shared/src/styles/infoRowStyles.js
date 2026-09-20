import { StyleSheet } from "react-native";

export default StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  label: {
    fontSize: 13,
    color: "#7F8C8D",
    flex: 1,
  },
  value: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2C3E50",
    flex: 1,
    textAlign: "right",
  },
});