import { StyleSheet } from "react-native";

// Medidas idénticas al mockup (Mesero Mesas.dc.html): mesa 74x74, sillas 18x7 (horiz.) / 7x18 (vert.)
const TABLE_SIZE = 74;
const WRAPPER_SIZE = TABLE_SIZE + 30;

export default StyleSheet.create({
  wrapper: {
    width: WRAPPER_SIZE,
    height: WRAPPER_SIZE,
    marginVertical: 13,
    marginHorizontal: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  chairH: {
    position: "absolute",
    width: 18,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#D8CFC2",
    borderWidth: 1,
    borderColor: "#C2B8A8",
  },
  chairV: {
    position: "absolute",
    width: 7,
    height: 18,
    borderRadius: 4,
    backgroundColor: "#D8CFC2",
    borderWidth: 1,
    borderColor: "#C2B8A8",
  },
  chairTop: {
    top: -6,
    left: "50%",
    marginLeft: -9,
  },
  chairBottom: {
    bottom: -6,
    left: "50%",
    marginLeft: -9,
  },
  chairLeft: {
    top: "50%",
    left: -6,
    marginTop: -9,
  },
  chairRight: {
    top: "50%",
    right: -6,
    marginTop: -9,
  },
  tableCircle: {
    width: TABLE_SIZE,
    height: TABLE_SIZE,
    borderRadius: TABLE_SIZE / 2,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  statusIcon: {
    fontSize: 14,
  },
  tableNumber: {
    fontFamily: "monospace",
    fontSize: 19,
    fontWeight: "500",
    color: "#FFFFFF",
    lineHeight: 21,
  },
  statusLabel: {
    fontFamily: "monospace",
    fontSize: 8.5,
    color: "#FFFFFF",
    opacity: 0.9,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  itemsPill: {
    position: "absolute",
    top: -6,
    right: -8,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#2C3E50",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  itemsPillText: {
    fontFamily: "monospace",
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "500",
  },
});
