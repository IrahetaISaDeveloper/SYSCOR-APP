import { StyleSheet, Dimensions } from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SHEET_HEIGHT = Math.round(SCREEN_HEIGHT * 0.78);

export default StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 20, 25, 0.55)",
    justifyContent: "flex-end",
  },
  backdropFill: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    // Altura NUMÉRICA fija (no maxHeight) — esto es lo que evita que el
    // contenido colapse a 0 por dependencias circulares de layout.
    height: SHEET_HEIGHT,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: "#E3DACA",
    paddingHorizontal: 20,
    paddingTop: 10,
    shadowColor: "#1B1613",
    shadowOffset: { width: 0, height: -14 },
    shadowOpacity: 0.18,
    shadowRadius: 17,
    elevation: 12,
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E3DACA",
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  title: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1B1613",
  },
  closeIcon: {
    fontSize: 18,
    color: "#7F8C8D",
    fontWeight: "700",
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  contentArea: {
    flex: 1,
  },
});
