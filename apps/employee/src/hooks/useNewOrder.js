import { useState, useEffect, useMemo, useCallback } from "react";
import { Alert } from "react-native";
import { fetchMenu, createOrder } from "../services/waiterDashboardApi";

export const MENU_CATEGORIES = [
  { key: "combos", label: "Combos", itemType: "combo" },
  { key: "drinks", label: "Bebidas", itemType: "drink" },
  { key: "extras", label: "Extras", itemType: "extra" },
];

const itemKey = (itemType, itemId) => `${itemType}:${itemId}`;

export default function useNewOrder(table) {
  const [menu, setMenu] = useState({ combos: [], drinks: [], extras: [] });
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState(null);

  const [activeCategory, setActiveCategory] = useState("combos");
  const [selection, setSelection] = useState({});
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadMenu = useCallback(async () => {
    try {
      setMenuLoading(true);
      setMenu(await fetchMenu());
      setMenuError(null);
    } catch (err) {
      console.error("useNewOrder.loadMenu:", err);
      setMenuError("No se pudo cargar el menú");
    } finally {
      setMenuLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const category = MENU_CATEGORIES.find((c) => c.key === activeCategory) || MENU_CATEGORIES[0];

  const products = useMemo(
    () =>
      (menu[category.key] || []).map((product) => ({
        ...product,
        quantity: selection[itemKey(category.itemType, product._id)]?.quantity || 0,
      })),
    [menu, category, selection]
  );

  const changeQuantity = useCallback(
    (product, delta) => {
      const key = itemKey(category.itemType, product._id);
      setSelection((prev) => {
        const current = prev[key]?.quantity || 0;
        const next = Math.max(0, current + delta);
        if (next === 0) {
          const { [key]: _removed, ...rest } = prev;
          return rest;
        }
        return {
          ...prev,
          [key]: {
            itemId: product._id,
            itemType: category.itemType,
            name: product.name,
            price: Number(product.price) || 0,
            quantity: next,
          },
        };
      });
    },
    [category]
  );

  const selectedItems = useMemo(() => Object.values(selection), [selection]);

  const summary = useMemo(
    () => ({
      count: selectedItems.reduce((sum, i) => sum + i.quantity, 0),
      total: selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    [selectedItems]
  );

  const submit = useCallback(async () => {
    if (!table?._id || selectedItems.length === 0) return false;
    setSubmitting(true);
    try {
      await createOrder({
        table: table._id,
        customerName: table.customerName || undefined,
        notes: notes.trim(),
        items: selectedItems.map(({ itemId, itemType, quantity }) => ({ itemId, itemType, quantity })),
      });
      return true;
    } catch (err) {
      console.error("useNewOrder.submit:", err);
      Alert.alert("Error", err?.response?.data?.message || "No se pudo enviar la comanda. Intenta de nuevo.");
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [table, selectedItems, notes]);

  return {
    menuLoading,
    menuError,
    reloadMenu: loadMenu,

    activeCategory,
    setActiveCategory,
    products,
    changeQuantity,

    notes,
    setNotes,

    summary,
    submitting,
    submit,
  };
}
