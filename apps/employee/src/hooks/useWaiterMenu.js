import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import apiClient from '@syscor/shared/src/services/apiClient';
import { createOrder, updateTableStatus } from '../services/waiterDashboardApi';

// Menú del mesero: el mismo que ve el cliente (platillos, combos y bebidas)
// más los extras, pero SIN precios. El precio no se guarda en el estado a
// propósito: la pantalla no tiene de dónde mostrarlo. El backend congela el
// precio real al crear la comanda.

const asList = (payload) =>
  Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];

// Mismo criterio que la app de clientes: el status es texto libre en el backend.
const isActive = (item) =>
  !item.status || ['disponible', 'activo', 'active'].includes(String(item.status).toLowerCase());

const COMBO_SIZES = { individual: 'Individual', duo: 'Dúo', familiar: 'Familiar' };
const DRINK_KINDS = { casa: 'De la casa', tercero: 'Embotelladas' };

const base = (item, itemType) => ({
  key: `${itemType}:${item._id}`,
  itemType,
  itemId: String(item._id),
  name: item.name || 'Producto',
  description: item.description || '',
  imageUrl: item.image || item.imageUrl || null,
});

const normalizers = {
  saucer: (item) => ({
    ...base(item, 'saucer'),
    category: item.category || null,
    subcategory: item.subcategory || null,
    // En los tacos `quantity` es cuántos trae la orden (3, 4 o 5).
    tacosPerOrder: Number(item.quantity) || null,
  }),
  combo: (item) => ({ ...base(item, 'combo'), category: 'Combos', subcategory: COMBO_SIZES[item.category] || null }),
  drink: (item) => ({ ...base(item, 'drink'), category: 'Bebidas', subcategory: DRINK_KINDS[item.category] || null }),
  extra: (item) => ({ ...base(item, 'extra'), category: 'Extras', subcategory: null }),
};

const SOURCES = [
  { itemType: 'saucer', path: '/menu/saucers/active' },
  { itemType: 'combo', path: '/menu/combos/active' },
  { itemType: 'drink', path: '/menu/drinks/active' },
  { itemType: 'extra', path: '/menu/extras/active' },
];

// Sin tildes y en minúsculas: "jamaica" encuentra "Jamáica" y viceversa.
export const normalizeText = (text) =>
  (text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export default function useWaiterMenu(table) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Orden en curso: clave del producto → { ...producto, quantity, notes }.
  const [lines, setLines] = useState({});
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadMenu = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    // Si falla un tipo (por ejemplo extras), el resto del menú sigue.
    const results = await Promise.allSettled(SOURCES.map((s) => apiClient.get(s.path)));
    const list = [];
    let failed = 0;
    results.forEach((result, i) => {
      if (result.status !== 'fulfilled') {
        failed += 1;
        return;
      }
      const { itemType } = SOURCES[i];
      for (const item of asList(result.value.data)) {
        if (isActive(item)) list.push(normalizers[itemType](item));
      }
    });
    setProducts(list);
    setError(failed === SOURCES.length ? 'No se pudo cargar el menú.' : null);
    if (!silent) setLoading(false);
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const changeQuantity = useCallback((product, delta) => {
    setLines((prev) => {
      const current = prev[product.key];
      const quantity = Math.max(0, (current?.quantity || 0) + delta);
      if (quantity === 0) {
        const { [product.key]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [product.key]: { ...product, notes: current?.notes || '', quantity } };
    });
  }, []);

  const setLineNotes = useCallback((key, text) => {
    setLines((prev) => (prev[key] ? { ...prev, [key]: { ...prev[key], notes: text } } : prev));
  }, []);

  const orderLines = useMemo(() => Object.values(lines), [lines]);
  const itemCount = useMemo(() => orderLines.reduce((sum, l) => sum + l.quantity, 0), [orderLines]);
  const quantityOf = useCallback((key) => lines[key]?.quantity || 0, [lines]);

  // Manda la comanda a cocina. Si la mesa estaba libre o reservada, primero se
  // ocupa: las personas salen de la reserva o de la capacidad de la mesa, y
  // el nombre, de la reserva. El pago queda pendiente y sin método ("por
  // definir"): se fija al cobrar la cuenta.
  const sendToKitchen = useCallback(async () => {
    if (!table?._id || orderLines.length === 0) return false;
    setSubmitting(true);
    try {
      if (table.status === 'libre' || table.status === 'reservada') {
        await updateTableStatus(table._id, 'ocupada', {
          customerName: table.customerName || '',
          peopleCount: table.peopleCount || table.capacity || undefined,
        });
      }
      await createOrder({
        table: table._id,
        customerName: table.customerName || undefined,
        notes: notes.trim(),
        items: orderLines.map((l) => ({
          itemId: l.itemId,
          itemType: l.itemType,
          quantity: l.quantity,
          notes: l.notes.trim() || undefined,
        })),
      });
      return true;
    } catch (err) {
      console.error('useWaiterMenu.sendToKitchen:', err);
      Alert.alert('No se envió la comanda', err?.response?.data?.message || 'Intenta de nuevo.');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [table, orderLines, notes]);

  return {
    products,
    loading,
    error,
    reload: loadMenu,

    orderLines,
    itemCount,
    quantityOf,
    changeQuantity,
    setLineNotes,
    notes,
    setNotes,

    submitting,
    sendToKitchen,
  };
}
