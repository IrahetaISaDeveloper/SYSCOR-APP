import { StyleSheet } from "react-native";

export default StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 12,
    color: "#7F8C8D",
    fontWeight: "500",
  },
  floor: {
    marginTop: 14,
    marginHorizontal: 16,
    backgroundColor: "#EFE6D8",
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E1D4BE",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
});