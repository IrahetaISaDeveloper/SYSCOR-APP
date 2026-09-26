import { StyleSheet } from "react-native";
import { fonts } from "./fonts";

const TABLE_SIZE = 74;

const chair = {
  position: "absolute",
  borderRadius: 4,
  backgroundColor: "#D8CFC2",
  borderWidth: 1,
  borderColor: "#C2B8A8",
};

export default StyleSheet.create({
  cell: {
    width: "33.333%",
    alignItems: "center",
  },
  wrapper: {
    width: TABLE_SIZE,
    height: TABLE_SIZE,
  },
  chairTop: {
    ...chair,
    top: -6,
    left: "50%",
    marginLeft: -9,
    width: 18,
    height: 7,
  },
  chairBottom: {
    ...chair,
    bottom: -6,
    left: "50%",
    marginLeft: -9,
    width: 18,
    height: 7,
  },
  chairLeft: {
    ...chair,
    top: "50%",
    left: -6,
    marginTop: -9,
    width: 7,
    height: 18,
  },
  chairRight: {
    ...chair,
    top: "50%",
    right: -6,
    marginTop: -9,
    width: 7,
    height: 18,
  },
  tableCircle: {
    width: TABLE_SIZE,
    height: TABLE_SIZE,
    borderRadius: TABLE_SIZE / 2,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
  },
  tableNumber: {
    fontFamily: fonts.monoMedium,
    fontSize: 19,
    lineHeight: 22,
    color: "#FFFFFF",
    includeFontPadding: false,
  },
  statusLabel: {
    fontFamily: fonts.mono,
    fontSize: 8.5,
    lineHeight: 11,
    letterSpacing: 0.51,
    color: "#FFFFFF",
    includeFontPadding: false,
  },
  itemsPill: {
    position: "absolute",
    top: -6,
    right: -8,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 4,
    borderRadius: 11,
    backgroundColor: "#2C3E50",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  itemsPillText: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    color: "#FFFFFF",
    includeFontPadding: false,
  },
});
