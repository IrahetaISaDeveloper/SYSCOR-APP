import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    color: "#7F8C8D",
    fontSize: 13,
  },
  errorBanner: {
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: "#FDEDEA",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  errorText: {
    color: "#E74C3C",
    fontSize: 12,
    fontWeight: "600",
  },
  welcomeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#E74C3C",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  tablesButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FDEDEA",
    alignItems: "center",
    justifyContent: "center",
  },
});