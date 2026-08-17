import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backText: {
    color: "#3498DB",
    fontSize: 15,
    fontWeight: "600",
    width: 60,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: "#2C3E50",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  logoutButton: {
    marginTop: 8,
    marginHorizontal: 20,
    alignItems: "center",
    paddingVertical: 12,
  },
  logoutText: {
    color: "#E74C3C",
    fontWeight: "600",
    fontSize: 14,
  },
});