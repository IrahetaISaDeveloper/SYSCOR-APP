import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import apiClient from '@syscor/shared/src/services/apiClient';
import { createOrder, updateTableStatus } from '../services/waiterDashboardApi';
import { HOUSE_DRINK_CATEGORY, isCustomizable } from '../utils/productOptions';

// Menú del mesero: el mismo que ve el cliente (platillos, combos y bebidas)
// más los extras, con sus precios. El backend los vuelve a calcular al crear
// la comanda, así que los de aquí son solo para mostrar.

const asList = (payload) =>
  Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];

// Mismo criterio que la app de clientes: el status es texto libre en el backend.
const isActive = (item) =>
  !item.status || ['disponible', 'activo', 'active'].includes(String(item.status).toLowerCase());

const COMBO_SIZES = { individual: 'Individual', duo: 'Dúo', familiar: 'Familiar' };
const DRINK_KINDS = { casa: 'De la casa', tercero: 'Embotelladas' };

// `raw` guarda el producto tal cual llega (receta, platillos del combo,
// bebidas incluidas...), que es lo que necesita la personalización.
const base = (item, itemType) => ({
  key: `${itemType}:${item._id}`,
  itemType,
  itemId: String(item._id),
  name: item.name || 'Producto',
  description: item.description || '',
  imageUrl: item.image || item.imageUrl || null,
  price: Number(item.price) || 0,
  raw: item,
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

// Lo que sale en el 1er tiempo si el mesero separa la orden: bebidas y
// entradas. Lo demás (plato fuerte) va al 2º tiempo. Es solo la sugerencia:
// el mesero cambia cualquier producto de tiempo con un toque.
const STARTER_CATEGORIES = ['Antojitos', 'Nachos', 'Sopas'];
const defaultCourse = (product) =>
  product.itemType === 'drink' || STARTER_CATEGORIES.includes(product.category) ? 1 : 2;

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
  const [extras, setExtras] = useState([]);
  const [houseDrinks, setHouseDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Orden en curso: clave del renglón → renglón. Un producto sin opciones
  // usa su clave (y se va sumando); cada personalización es un renglón aparte.
  const [lines, setLines] = useState({});
  const [notes, setNotes] = useState('');
  // Por tiempos: el 1er tiempo sale ya; el 2º, junto o cuando el mesero lo
  // marche. `waitSecond` null = lo que se sugiere (esperar si en el 1er
  // tiempo hay comida; si solo son bebidas, el plato fuerte se prepara ya).
  const [splitCourses, setSplitCourses] = useState(false);
  const [waitSecond, setWaitSecond] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const lineSeq = useRef(0);
  const occupiedRef = useRef(false);

  const loadMenu = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    // Si falla un tipo (por ejemplo extras), el resto del menú sigue.
    const results = await Promise.allSettled(SOURCES.map((s) => apiClient.get(s.path)));
    const raw = {};
    let failed = 0;
    results.forEach((result, i) => {
      const { itemType } = SOURCES[i];
      if (result.status !== 'fulfilled') {
        failed += 1;
        raw[itemType] = [];
        return;
      }
      raw[itemType] = asList(result.value.data).filter(isActive);
    });

    const house = raw.drink.filter((d) => d.category === HOUSE_DRINK_CATEGORY);
    const list = SOURCES.flatMap(({ itemType }) =>
      raw[itemType].map((item) => {
        const product = normalizers[itemType](item);
        return { ...product, customizable: isCustomizable(itemType, item, raw.extra, house) };
      })
    );

    setExtras(raw.extra);
    setHouseDrinks(house);
    setProducts(list);
    setError(failed === SOURCES.length ? 'No se pudo cargar el menú.' : null);
    if (!silent) setLoading(false);
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  // Producto sin opciones: suma o resta en su renglón.
  const changeQuantity = useCallback((product, delta) => {
    const key = product.lineKey || product.key;
    setLines((prev) => {
      const current = prev[key];
      const quantity = Math.max(0, (current?.quantity || 0) + delta);
      if (quantity === 0) {
        const { [key]: _removed, ...rest } = prev;
        return rest;
      }
      if (current) return { ...prev, [key]: { ...current, quantity } };
      return {
        ...prev,
        [key]: {
          lineKey: key,
          productKey: product.key,
          course: defaultCourse(product),
          itemType: product.itemType,
          itemId: product.itemId,
          name: product.name,
          subcategory: product.subcategory,
          unitPrice: product.price,
          notes: '',
          custom: null,
          quantity,
        },
      };
    });
  }, []);

  // Producto personalizado: siempre un renglón nuevo.
  const addCustomized = useCallback((product, { quantity, custom, unitPrice, notes: lineNotes }) => {
    lineSeq.current += 1;
    const key = `${product.key}#${lineSeq.current}`;
    setLines((prev) => ({
      ...prev,
      [key]: {
        lineKey: key,
        productKey: product.key,
        course: defaultCourse(product),
        itemType: product.itemType,
        itemId: product.itemId,
        name: product.name,
        subcategory: product.subcategory,
        unitPrice,
        notes: lineNotes || '',
        custom,
        quantity,
      },
    }));
  }, []);

  const setLineCourse = useCallback((key, course) => {
    setLines((prev) => (prev[key] ? { ...prev, [key]: { ...prev[key], course } } : prev));
  }, []);

  const setLineNotes = useCallback((key, text) => {
    setLines((prev) => (prev[key] ? { ...prev, [key]: { ...prev[key], notes: text } } : prev));
  }, []);

  const orderLines = useMemo(() => Object.values(lines), [lines]);
  const itemCount = useMemo(() => orderLines.reduce((sum, l) => sum + l.quantity, 0), [orderLines]);
  const total = useMemo(() => orderLines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0), [orderLines]);
  // Cuántos lleva de un producto, sumando todas sus personalizaciones.
  const quantityOf = useCallback(
    (productKey) => orderLines.filter((l) => l.productKey === productKey).reduce((sum, l) => sum + l.quantity, 0),
    [orderLines]
  );

  // Manda la comanda a cocina. Si la mesa estaba libre o reservada, primero se
  // ocupa: las personas salen de la reserva o de la capacidad de la mesa, y
  // el nombre, de la reserva. El backend marca la comanda como "para comer en
  // el restaurante", guarda al mesero que la tomó (su sesión) y deja el pago
  // pendiente con el método por definir.
  // ¿Hay de verdad dos tiempos? (por tiempos, y con productos en los dos)
  const firstLines = orderLines.filter((l) => l.course === 1);
  const secondLines = orderLines.filter((l) => l.course !== 1);
  const coursesActive = splitCourses && firstLines.length > 0 && secondLines.length > 0;
  const suggestedWait = firstLines.some((l) => l.itemType !== 'drink');
  const waitSecondEffective = waitSecond ?? suggestedWait;

  const toPayload = (l) =>
    l.itemType === 'extra'
      ? { itemType: 'extra', itemId: l.itemId, quantity: l.quantity, notes: l.notes.trim() || undefined }
      : {
          // Mismo formato que el carrito de la app de clientes.
          productType: l.itemType,
          productId: l.itemId,
          name: l.name,
          quantity: l.quantity,
          ...(l.custom || {}),
          comment: l.notes.trim() || undefined,
        };

  // Manda la orden a cocina. Si la mesa estaba libre o reservada, primero se
  // ocupa: las personas salen de la reserva o de la capacidad de la mesa, y
  // el nombre, de la reserva. El backend la guarda como "para comer en el
  // restaurante", con el mesero que la tomó (su sesión), la ronda de la
  // cuenta de la mesa, y el pago pendiente con el método por definir.
  //
  // Por tiempos se crean dos comandas de la misma ronda: la del 1er tiempo
  // y, después, la del 2º (en espera si así se eligió).
  // Devuelve { ok, waiting } para el aviso de la pantalla.
  const sendToKitchen = useCallback(async () => {
    if (!table?._id || orderLines.length === 0) return { ok: false };
    setSubmitting(true);
    let firstSent = false;
    try {
      if (!occupiedRef.current && (table.status === 'libre' || table.status === 'reservada')) {
        await updateTableStatus(table._id, 'ocupada', {
          customerName: table.customerName || '',
          peopleCount: table.peopleCount || table.capacity || undefined,
        });
      }
      // Si la comanda falla, al reintentar ya no se vuelve a ocupar.
      occupiedRef.current = true;

      const base = { table: table._id, customerName: table.customerName || undefined };

      if (!coursesActive) {
        await createOrder({ ...base, notes: notes.trim(), items: orderLines.map(toPayload) });
        return { ok: true, waiting: false };
      }

      const first = await createOrder({ ...base, notes: notes.trim(), course: 1, items: firstLines.map(toPayload) });
      firstSent = true;
      await createOrder({
        ...base,
        course: 2,
        waitForWaiter: waitSecondEffective,
        roundOf: first?.data?._id,
        items: secondLines.map(toPayload),
      });
      return { ok: true, waiting: waitSecondEffective };
    } catch (err) {
      console.error('useWaiterMenu.sendToKitchen:', err);
      const data = err?.response?.data;
      if (firstSent) {
        // El 1er tiempo ya está en cocina: en la orden queda solo el 2º para
        // reintentarlo sin duplicar lo que ya se mandó.
        setLines((prev) => Object.fromEntries(Object.entries(prev).filter(([, l]) => l.course !== 1)));
        setSplitCourses(false);
        Alert.alert(
          'Falta el 2º tiempo',
          `El 1er tiempo ya está en cocina, pero el 2º no se envió${data?.message ? `: ${data.message}` : '.'} En la orden quedó solo el 2º tiempo; envíalo de nuevo.`
        );
      } else {
        Alert.alert(data?.title || 'No se envió la comanda', data?.message || 'Intenta de nuevo.');
      }
      return { ok: false };
    } finally {
      setSubmitting(false);
    }
  }, [table, orderLines, notes, coursesActive, firstLines, secondLines, waitSecondEffective]);

  return {
    products,
    extras,
    houseDrinks,
    loading,
    error,
    reload: loadMenu,

    orderLines,
    itemCount,
    total,
    quantityOf,
    changeQuantity,
    addCustomized,
    setLineNotes,
    notes,
    setNotes,

    splitCourses,
    setSplitCourses,
    coursesActive,
    setLineCourse,
    waitSecond: waitSecondEffective,
    setWaitSecond,

    submitting,
    sendToKitchen,
  };
}
