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
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2C3E50",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  headerActionText: {
    color: "#3498DB",
    fontSize: 13,
    fontWeight: "600",
  },
  headerLogoutText: {
    color: "#E74C3C",
    fontSize: 13,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 13,
    color: "#7F8C8D",
    marginTop: 2,
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
});
