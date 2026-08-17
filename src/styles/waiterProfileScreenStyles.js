import { StyleSheet } from "react-native";
import { colors } from "./theme";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
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
    color: colors.primary,
    fontSize: 15,
    fontWeight: "600",
    width: 60,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.textDark,
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
    color: colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
});
