import { useCallback, useEffect, useMemo, useState } from 'react';

// En emulador Android, 10.0.2.2 apunta al localhost del PC host
const baseUrl = 'https://syscor.onrender.com/api';

// ── ESTADOS ──────────────────────────────────────────────────────────
// Normaliza los distintos nombres de estado que puede devolver el backend de carts
const STATUS_MAP = {
  pending:     'pending',
  pendientes:  'pending',
  cooking:     'preparing',
  preparing:   'preparing',
  inProgress:  'preparing',
  in_progress: 'preparing',
  en_proceso:  'preparing',
  ready:       'ready',
  lista:       'ready',
  delivered:   'ready',
  paid:        'ready',
};

// Solo mostramos órdenes activas en cocina (excluimos canceladas, pagadas ya procesadas, etc.)
const KITCHEN_RELEVANT_STATUSES = [
  'pending', 'pendientes',
  'cooking', 'preparing', 'inProgress', 'in_progress', 'en_proceso',
  'ready', 'lista',
];

// Una orden se marca retrasada si lleva ≥15 min sin estar lista
const LATE_THRESHOLD_MINUTES = 15;

// Etiquetas y config visual por estado
const statusConfig = {
  pending:   { label: 'PENDIENTE' },
  preparing: { label: 'EN PREPARACIÓN' },
  ready:     { label: 'LISTA' },
  late:      { label: 'RETRASADA' },
};

// ── HELPERS ──────────────────────────────────────────────────────────

const getMinutesAgo = (date) => {
  if (!date) return 0;
  const t = new Date(date).getTime();
  if (isNaN(t)) return 0;
  return Math.floor((Date.now() - t) / 60000);
};

const formatTimeAgo = (minutes) => {
  if (minutes < 1) return 'NUEVO';
  if (minutes < 60) return `HACE ${minutes} MIN`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `HACE ${h}H` : `HACE ${h}H ${m}MIN`;
};

// Extrae el nombre del cliente desde customerId (objeto poblado o string ID)
const buildCustomerName = (cart) => {
  const customer = cart?.customerId || cart?.idCustomer;
  if (!customer) return 'Cliente';

  if (typeof customer === 'object') {
    const name     = customer.personalInfo?.name     || customer.name      || customer.firstName || '';
    const lastname = customer.personalInfo?.lastname || customer.lastname  || customer.lastName  || '';
    const full = `${name} ${lastname}`.trim();
    return full || 'Cliente';
  }

  if (typeof customer === 'string') {
    return customer.length > 6 ? `Cliente #${customer.slice(-4)}` : customer;
  }

  return 'Cliente';
};

// Extrae el número de mesa desde el campo table (objeto poblado, número o string)
const getTableLabel = (cart) => {
  if (!cart?.table) return null;
  if (typeof cart.table === 'object' && cart.table.number) return `Mesa ${cart.table.number}`;
  if (typeof cart.table === 'number' || typeof cart.table === 'string') return `Mesa ${cart.table}`;
  return null;
};

// ── MAPPERS DE ÍTEMS ──────────────────────────────────────────────────
// Cada función convierte el subdocumento del cart en un objeto plano para mostrar en cocina

const mapCombosToItems = (combos = []) =>
  combos.map((combo, idx) => {
    const quantity = combo.quantity ?? 1;
    let name = '';

    if (combo.comboId && typeof combo.comboId === 'object') {
      name = combo.comboId.name || combo.comboId.title || '';
    }
    name = name || combo.name || `Combo #${idx + 1}`;

    const notes = combo.note || combo.notes || combo.observation ||
      (typeof combo.comboId === 'object' ? (combo.comboId?.note || combo.comboId?.notes) : null) || null;

    const id = String(combo._id ||
      (typeof combo.comboId === 'object' ? combo.comboId?._id : combo.comboId) ||
      `combo-${idx}`);

    return {
      id,
      name:     `${quantity}x ${name}`,
      notes,
      itemType: 'combo',
      hasNotes: !!notes,
    };
  });

const mapExtrasToItems = (extras = []) =>
  extras.map((extra, idx) => {
    const quantity = extra.quantity ?? 1;
    let name = '';

    if (extra.extraId && typeof extra.extraId === 'object') {
      name = extra.extraId.name || extra.extraId.title || '';
    }
    name = name || extra.name || `Extra #${idx + 1}`;

    const notes = extra.note || extra.notes || extra.observation ||
      (typeof extra.extraId === 'object' ? (extra.extraId?.note || extra.extraId?.notes) : null) || null;

    const id = String(extra._id ||
      (typeof extra.extraId === 'object' ? extra.extraId?._id : extra.extraId) ||
      `extra-${idx}`);

    return {
      id,
      name:     `${quantity}x ${name}`,
      notes,
      itemType: 'extra',
      hasNotes: !!notes,
    };
  });

const mapDrinksToItems = (drinks = []) =>
  drinks.map((drink, idx) => {
    const quantity = drink.quantity ?? 1;
    let name = '';

    if (drink.drinkId && typeof drink.drinkId === 'object') {
      name = drink.drinkId.name || drink.drinkId.title || '';
    }
    name = name || drink.name || `Bebida #${idx + 1}`;

    const notes = drink.note || drink.notes || drink.observation || null;

    const id = String(drink._id ||
      (typeof drink.drinkId === 'object' ? drink.drinkId?._id : drink.drinkId) ||
      `drink-${idx}`);

    return {
      id,
      name:     `${quantity}x ${name}`,
      notes,
      itemType: 'drink',
      hasNotes: !!notes,
    };
  });

// ── MAPPER PRINCIPAL (Cart /orders/carts) ────────────────────────────
// Convierte un documento Cart del backend al formato que usa la UI de cocina
const mapCartToKitchen = (cart) => {
  const minutesAgo = getMinutesAgo(cart.createdAt);
  let status = STATUS_MAP[cart.status] || 'pending';

  // Si la orden lleva demasiado tiempo activa sin terminar → retrasada
  if ((status === 'pending' || status === 'preparing') && minutesAgo >= LATE_THRESHOLD_MINUTES) {
    status = 'late';
  }

  // Aplanamos todos los ítems de cocina desde details[].combos, extras y drinks
  const items = (cart.details || []).flatMap((detail, dIdx) => {
    const comboItems   = mapCombosToItems(detail.combos  || []);
    const extraItems   = mapExtrasToItems(detail.extras  || []);
    const directDrinks = mapDrinksToItems(detail.drinks || []);
    // Bebidas anidadas dentro de cada extra
    const nestedDrinks = (detail.extras || []).flatMap((e) => mapDrinksToItems(e.drinks || []));

    const all = [...comboItems, ...extraItems, ...directDrinks, ...nestedDrinks];

    // Fallback: si no hay subdocumentos pero existe un nombre directo en el detail
    if (all.length === 0 && (detail.name || detail.productName)) {
      return [{
        id:       String(detail._id || `detail-${dIdx}`),
        name:     `${detail.quantity || 1}x ${detail.name || detail.productName}`,
        notes:    detail.note || detail.notes || null,
        itemType: 'extra',
        hasNotes: !!(detail.note || detail.notes),
      }];
    }

    return all;
  });

  const rawId = String(cart._id || Math.random());
  const displayId = cart.orderNumber
    ? String(cart.orderNumber)
    : rawId.length > 6
      ? rawId.slice(-4).toUpperCase()
      : rawId;

  const dateObj = cart.createdAt ? new Date(cart.createdAt) : new Date();
  const timeFormatted = isNaN(dateObj.getTime())
    ? '--:--'
    : dateObj.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' });

  return {
    id:           rawId,
    displayId,
    customerName: buildCustomerName(cart),
    tableLabel:   getTableLabel(cart),
    waiterName:   null, // El modelo Cart no tiene campo waiter
    status,
    time:         timeFormatted,
    timeAgo:      formatTimeAgo(minutesAgo),
    items,
    total:        cart.total ?? null,
  };
};

// ── MAPPER NUEVO (/api/orders) ────────────────────────────────────────
// Convierte el formato del nuevo endpoint Order al shape que usa OrderCard
const mapOrderToKitchen = (order) => {
  const minutesAgo = getMinutesAgo(order.createdAt);
  let status = STATUS_MAP[order.status] || 'pending';

  if ((status === 'pending' || status === 'preparing') && minutesAgo >= LATE_THRESHOLD_MINUTES) {
    status = 'late';
  }

  // Los items ya vienen planos: { itemType, name, price, quantity, notes }
  const items = (order.items || []).map((item, idx) => ({
    id:       String(item._id || `item-${idx}`),
    name:     `${item.quantity || 1}x ${item.name || 'Item'}`,
    notes:    item.notes || null,
    itemType: item.itemType || 'extra',
    hasNotes: !!(item.notes && item.notes.trim()),
  }));

  const rawId    = String(order._id || Math.random());
  const displayId = rawId.length > 6 ? rawId.slice(-4).toUpperCase() : rawId;

  const dateObj = order.createdAt ? new Date(order.createdAt) : new Date();
  const timeFormatted = isNaN(dateObj.getTime())
    ? '--:--'
    : dateObj.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' });

  // Nombre del mesero (puede ser objeto poblado o sólo _id)
  let waiterName = null;
  if (order.waiter && typeof order.waiter === 'object') {
    const n = order.waiter.name || '';
    const l = order.waiter.lastname || '';
    waiterName = `${n} ${l}`.trim() || null;
  }

  // Mesa
  let tableLabel = null;
  if (order.table && typeof order.table === 'object' && order.table.number) {
    tableLabel = `Mesa ${order.table.number}`;
  } else if (order.table) {
    tableLabel = `Mesa ${order.table}`;
  }

  return {
    id:           rawId,
    displayId,
    customerName: waiterName || 'Mesero',
    tableLabel,
    waiterName,
    status,
    time:         timeFormatted,
    timeAgo:      formatTimeAgo(minutesAgo),
    items,
    total:        order.total ?? null,
  };
};

// ── HOOK PRINCIPAL ────────────────────────────────────────────────────
const useOrders = () => {
  const [orders, setOrders]               = useState([]);
  const [activeFilter, setActiveFilter]   = useState('all');
  const [isLoading, setIsLoading]         = useState(true);
  const [error, setError]                 = useState(null);

  // ── ESTADO NUEVO: comandas desde /api/orders ──────────────────────
  const [apiOrders, setApiOrders]               = useState([]);
  const [apiOrdersMapped, setApiOrdersMapped]   = useState([]);
  const [apiOrdersLoading, setApiOrdersLoading] = useState(false);
  const [apiOrdersError, setApiOrdersError]     = useState(null);

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Endpoint correcto del backend de carts
      const response = await fetch(`${baseUrl}/orders/carts`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // El backend devuelve el array directo o envuelto en {data:[...]} / {carts:[...]}
      const raw = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.carts)
            ? data.carts
            : [];

      const kitchenOrders = raw
        .filter((c) => KITCHEN_RELEVANT_STATUSES.includes(c.status))
        .map(mapCartToKitchen)
        .filter((o) => o.items.length > 0);

      setOrders(kitchenOrders);
    } catch (err) {
      console.error('[useOrders] Error cargando comandas:', err);
      setError('No se pudieron cargar las comandas. Verifica tu conexión.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // ── GET /api/orders ───────────────────────────────────────────────
  // Nuevo fetch independiente. No modifica nada del flujo anterior.
  const loadOrdersFromAPI = useCallback(async () => {
    try {
      setApiOrdersLoading(true);
      setApiOrdersError(null);

      const response = await fetch(`${baseUrl}/orders`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // El backend puede devolver array directo o envuelto en {data:[...]}
      const raw = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];

      // Guardamos el raw Y el mapeado listo para UI
      setApiOrders(raw);
      setApiOrdersMapped(raw.map(mapOrderToKitchen));
    } catch (err) {
      console.error('[useOrders] Error cargando /api/orders:', err);
      setApiOrdersError('No se pudieron cargar las órdenes. Verifica tu conexión.');
    } finally {
      setApiOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrdersFromAPI();
  }, [loadOrdersFromAPI]);

  const counts = useMemo(() => ({
    all:       orders.length,
    pending:   orders.filter((o) => o.status === 'pending').length,
    preparing: orders.filter((o) => o.status === 'preparing').length,
    late:      orders.filter((o) => o.status === 'late').length,
  }), [orders]);

  const filteredOrders = useMemo(() => {
    if (activeFilter === 'all') return orders;
    return orders.filter((o) => o.status === activeFilter);
  }, [orders, activeFilter]);

  // Actualización optimista: cambia el estado en UI y luego sincroniza con el backend
  const updateOrderStatus = async (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      // Traducimos el estado interno al que espera el backend de carts
      const backendStatusMap = {
        pending:   'pending',
        preparing: 'cooking',
        ready:     'ready',
        late:      'cooking',
      };

      await fetch(`${baseUrl}/orders/carts/${orderId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: backendStatusMap[newStatus] || newStatus }),
      });
    } catch (err) {
      console.log('[useOrders] No se pudo sincronizar estado:', err.message);
    }
  };

  // Actualización optimista para órdenes de /api/orders
  // El nuevo endpoint acepta los estados nativos directamente: pending, preparing, ready, delivered, cancelled
  const updateApiOrderStatus = async (orderId, newStatus) => {
    // Actualiza el estado en UI de forma inmediata
    setApiOrdersMapped((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      const res = await fetch(`${baseUrl}/orders/${orderId}/status`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: newStatus }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.warn('[updateApiOrderStatus] HTTP', res.status, JSON.stringify(body));
      } else {
        console.log('[updateApiOrderStatus] OK ->', newStatus, JSON.stringify(body));
      }
    } catch (err) {
      console.log('[updateApiOrderStatus] Error de red:', err.message);
    }
  };

  return {
    orders:           filteredOrders,
    counts,
    activeFilter,
    setActiveFilter,
    updateOrderStatus,
    updateApiOrderStatus,
    statusConfig,
    isLoading,
    error,
    refetch:          loadOrders,
    apiOrders,
    apiOrdersMapped,
    apiOrdersLoading,
    apiOrdersError,
    refetchApiOrders: loadOrdersFromAPI,
  };
};

export default useOrders;
