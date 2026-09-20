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
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0E0E0",
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
    color: "#2C3E50",
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
