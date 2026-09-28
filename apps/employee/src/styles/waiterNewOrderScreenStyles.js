import { StyleSheet } from "react-native";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import { fonts } from "./fonts";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: employeePalette.bg,
  },
  flex: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: employeePalette.surface,
    borderWidth: 1,
    borderColor: employeePalette.line,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTexts: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  headerTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 18,
    letterSpacing: -0.36,
    color: employeePalette.ink,
  },
  headerSubtitle: {
    fontFamily: fonts.mono,
    fontSize: 10.5,
    color: employeePalette.muted,
  },
  headerSpacer: {
    width: 38,
  },

  topSection: {
    paddingTop: 4,
    paddingHorizontal: 18,
    paddingBottom: 12,
    gap: 10,
  },
  clientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    backgroundColor: employeePalette.surface,
    borderWidth: 1,
    borderColor: employeePalette.line,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  clientName: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 13.5,
    color: employeePalette.ink,
  },
  clientNameEmpty: {
    color: employeePalette.muted,
  },
  clientTag: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: employeePalette.muted,
  },
  tabs: {
    flexDirection: "row",
    gap: 7,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: employeePalette.surface,
    borderWidth: 1,
    borderColor: employeePalette.line,
    borderRadius: 12,
    padding: 9,
  },
  tabActive: {
    backgroundColor: employeePalette.accent,
    borderColor: employeePalette.accent,
  },
  tabLabel: {
    fontFamily: fonts.sans,
    fontSize: 12.5,
    color: employeePalette.muted,
  },
  tabLabelActive: {
    fontFamily: fonts.sansBold,
    color: "#FFFFFF",
  },

  list: {
    paddingHorizontal: 18,
    paddingBottom: 12,
    gap: 9,
  },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: employeePalette.surface,
    borderWidth: 1,
    borderColor: employeePalette.line,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 13,
  },
  productCardSelected: {
    borderWidth: 1.5,
    borderColor: employeePalette.accent,
    paddingVertical: 11.5,
    paddingHorizontal: 12.5,
  },
  productTexts: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  productName: {
    fontFamily: fonts.sansBold,
    fontSize: 13.5,
    color: employeePalette.ink,
  },
  productPrice: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: employeePalette.muted,
  },
  productPriceSelected: {
    color: employeePalette.price,
  },

  notesCard: {
    gap: 6,
    backgroundColor: employeePalette.surface,
    borderWidth: 1,
    borderColor: employeePalette.line,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 13,
  },
  notesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  notesLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.7,
    color: employeePalette.muted,
  },
  notesInput: {
    fontFamily: fonts.sans,
    fontStyle: "italic",
    fontSize: 12.5,
    color: employeePalette.ink,
    padding: 0,
    minHeight: 18,
    textAlignVertical: "top",
  },

  stateBox: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 36,
  },
  stateText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: employeePalette.muted,
    textAlign: "center",
  },
  retryText: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: employeePalette.accent,
  },

  footer: {
    paddingTop: 12,
    paddingHorizontal: 18,
    gap: 10,
  },
  summaryBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: employeePalette.surface2,
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  summaryCount: {
    fontFamily: fonts.mono,
    fontSize: 11.5,
    color: employeePalette.muted,
  },
  summaryTotal: {
    fontFamily: fonts.monoMedium,
    fontSize: 15,
    color: employeePalette.price,
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: employeePalette.accent,
    borderRadius: 18,
    padding: 16,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
    color: "#FFFFFF",
  },
});
