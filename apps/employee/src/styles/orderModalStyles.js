import { StyleSheet } from "react-native";
import { employeePalette } from '@syscor/shared/src/styles/employeePalette';

export default StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: employeePalette.ink,
    marginBottom: 8,
  },

  // ── Caja "Comandas activas" (mismo lenguaje visual que TableActionsModal) ──
  kitchenBox: {
    backgroundColor: employeePalette.surface2,
    borderRadius: 16,
    padding: 13,
    gap: 8,
    marginBottom: 16,
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

  footer: {
    paddingTop: 12,
    paddingBottom: 4,
  },
});
