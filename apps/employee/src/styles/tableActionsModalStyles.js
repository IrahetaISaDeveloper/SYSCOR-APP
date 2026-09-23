import { StyleSheet } from "react-native";
import { employeePalette } from '@syscor/shared/src/styles/employeePalette';

export default StyleSheet.create({
  // ── Encabezado con avatar de mesa, cliente y total ──
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingBottom: 14,
  },
  tableAvatar: {
    width: 52,
    height: 52,
    flexShrink: 0,
    borderRadius: 26,
    backgroundColor: employeePalette.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  tableAvatarNumber: {
    fontFamily: "monospace",
    fontSize: 17,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  tableAvatarLabel: {
    fontFamily: "monospace",
    fontSize: 7.5,
    letterSpacing: 0.4,
    color: "#FFFFFF",
  },
  summaryTextGroup: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  customerName: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: employeePalette.ink,
  },
  customerInfo: {
    fontSize: 12,
    color: employeePalette.muted,
  },
  summaryTotals: {
    alignItems: "flex-end",
    gap: 2,
  },
  totalAmount: {
    fontFamily: "monospace",
    fontSize: 16,
    fontWeight: "500",
    color: employeePalette.price,
  },
  totalOrders: {
    fontFamily: "monospace",
    fontSize: 9.5,
    color: employeePalette.muted,
  },

  // ── Caja "Estado en cocina" con productos por comanda ──
  kitchenBox: {
    backgroundColor: employeePalette.surface2,
    borderRadius: 16,
    padding: 13,
    gap: 8,
    marginBottom: 14,
  },
  kitchenBoxLabel: {
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 0.8,
    color: employeePalette.muted,
  },
  orderBlock: {
    gap: 4,
  },
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  orderRowText: {
    flex: 1,
    fontSize: 12.5,
    color: employeePalette.ink,
  },
  orderRowStatus: {
    fontFamily: "monospace",
    fontSize: 10,
  },
  productsList: {
    paddingLeft: 25,
    gap: 2,
  },
  productItem: {
    fontSize: 12,
    color: employeePalette.ink,
  },

  // ── Filas de acción ──
  body: {
    paddingBottom: 10,
    gap: 9,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: employeePalette.line,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 13,
    gap: 13,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: employeePalette.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleWarn: {
    backgroundColor: employeePalette.warnSoft,
  },
  rowLabel: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: "700",
    color: employeePalette.ink,
  },
  rowLabelWarn: {
    color: employeePalette.warnInk,
  },
});
