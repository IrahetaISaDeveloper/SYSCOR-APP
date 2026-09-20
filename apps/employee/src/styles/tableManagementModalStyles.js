import { StyleSheet } from "react-native";

export default StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 12,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#C62828",
    fontSize: 13,
  },
  emptyText: {
    color: "#B0B4B8",
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 30,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2C3E50",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: "#2C3E50",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  rowInfo: {
    gap: 4,
  },
  rowNumber: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2C3E50",
  },
  rowActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#F4F4F4",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2C3E50",
  },
  deleteButton: {
    backgroundColor: "#FDEDEA",
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#C62828",
  },
  formFooter: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 12,
    paddingBottom: 4,
    alignItems: "center",
  },
  cancelButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    color: "#7F8C8D",
    fontWeight: "600",
    fontSize: 14,
  },
});
