import { StyleSheet } from "react-native";

const TABLE_SIZE = 78;
const CHAIR_SIZE = 18;
const WRAPPER_SIZE = TABLE_SIZE + CHAIR_SIZE * 2 + 8;

export default StyleSheet.create({
  wrapper: {
    width: WRAPPER_SIZE,
    height: WRAPPER_SIZE,
    margin: 18, // antes: 10 — más aire entre mesas para que las sillas no se toquen
    alignItems: "center",
    justifyContent: "center",
  },
  chair: {
    position: "absolute",
    width: CHAIR_SIZE,
    height: CHAIR_SIZE,
    borderRadius: CHAIR_SIZE / 2,
    backgroundColor: "#D8CFC2",
    borderWidth: 1,
    borderColor: "#C2B8A8",
  },
  tableCircle: {
    width: TABLE_SIZE,
    height: TABLE_SIZE,
    borderRadius: TABLE_SIZE / 2,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  statusIcon: {
    fontSize: 14,
    marginBottom: 1,
  },
  tableNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    lineHeight: 22,
  },
  statusLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#FFFFFF",
    opacity: 0.9,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  itemsPill: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#2C3E50",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  itemsPillText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
});