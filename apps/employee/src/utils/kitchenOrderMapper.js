import { LATE_THRESHOLD_MINUTES } from "../constants/kitchenStatus";

const ORDER_STATUS_MAP = {
  pending: "pending",
  preparing: "preparing",
  atrasado: "late",
  ready: "ready",
  delivered: "delivered",
  cancelled: "cancelled",
};

const CART_STATUS_MAP = {
  pending: "pending",
  pendientes: "pending",
  cooking: "preparing",
  preparing: "preparing",
  inProgress: "preparing",
  in_progress: "preparing",
  en_proceso: "preparing",
  ready: "ready",
  lista: "ready",
  delivered: "delivered",
  paid: "delivered",
  cancelled: "cancelled",
  cancelado: "cancelled",
};

export const CART_BACKEND_STATUS = {
  pending: "pending",
  preparing: "cooking",
  ready: "ready",
};

const toTime = (date) => {
  const time = date ? new Date(date).getTime() : NaN;
  return Number.isNaN(time) ? null : time;
};

export const minutesBetween = (from, to = Date.now()) => {
  const start = toTime(from);
  const end = typeof to === "number" ? to : toTime(to);
  if (start === null || end === null) return null;
  return Math.max(0, Math.floor((end - start) / 60000));
};

export const formatClock = (date) => {
  const time = toTime(date);
  if (time === null) return "--:--";
  const d = new Date(time);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export const formatDuration = (minutes) => {
  if (minutes === null || minutes === undefined) return "";
  if (minutes < 60) return `${minutes} MIN`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} H` : `${hours} H ${rest} MIN`;
};

export const formatAgo = (minutes) => (minutes < 1 ? "AHORA" : `HACE ${formatDuration(minutes)}`);

const shortName = (name, lastname) => {
  const first = String(name || "").trim().split(/\s+/)[0] || "";
  const initial = String(lastname || "").trim().charAt(0);
  if (!first) return "";
  return initial ? `${first} ${initial.toUpperCase()}.` : first;
};

const lastHistoryAt = (history, status, before = Infinity) => {
  const entry = [...(history || [])]
    .reverse()
    .find((h) => h.status === status && (toTime(h.changedAt) ?? 0) <= before);
  return entry ? entry.changedAt : null;
};

const statusSince = (item) =>
  lastHistoryAt(item.statusHistory, item.status) || item.updatedAt || item.createdAt;

const resolveKitchenStatus = (mapped, item) => {
  if ((mapped === "pending" || mapped === "preparing") && minutesBetween(statusSince(item)) >= LATE_THRESHOLD_MINUTES) {
    return "late";
  }
  return mapped;
};

const resolveTiming = (item, kitchenStatus, readyStatuses, prepStatuses) => {
  if (!["ready", "delivered"].includes(kitchenStatus)) return { readyAt: null, prepMinutes: null };

  const readyAt = readyStatuses.map((s) => lastHistoryAt(item.statusHistory, s)).find(Boolean) || item.updatedAt;
  const readyTime = toTime(readyAt);
  const prepStart =
    prepStatuses.map((s) => lastHistoryAt(item.statusHistory, s, readyTime ?? Infinity)).find(Boolean) ||
    item.createdAt;

  return { readyAt, prepMinutes: readyTime === null ? null : minutesBetween(prepStart, readyTime) };
};

const pluralPeople = (count) => `${count} ${count === 1 ? "persona" : "personas"}`;

const baseFields = (id, createdAt) => {
  const minutesAgo = minutesBetween(createdAt) ?? 0;
  return {
    id: String(id),
    displayId: `#${String(id).slice(-4).toUpperCase()}`,
    createdAt,
    clock: formatClock(createdAt),
    minutesAgo,
    agoLabel: formatAgo(minutesAgo),
  };
};

export const mapApiOrder = (order) => {
  const mapped = ORDER_STATUS_MAP[order.status];
  if (!mapped) return null;
  const status = resolveKitchenStatus(mapped, order);
  const isLocal = order.orderType !== "online";

  let context;
  let assignee;
  if (isLocal) {
    const number = order.table?.number;
    const people = order.table?.peopleCount;
    context = {
      icon: "grid_view",
      text: [number ? `Mesa ${number}` : "Mesa sin asignar", people ? pluralPeople(people) : null]
        .filter(Boolean)
        .join(" · "),
    };
    assignee = {
      label: "ASIGNADO A",
      name: shortName(order.waiter?.name, order.waiter?.lastname) || "Sin mesero",
    };
  } else {
    context = {
      icon: order.isDelivery ? "delivery_dining" : "shopping_bag",
      text: order.isDelivery ? "Pedido en línea · a domicilio" : "Pedido en línea · para recoger",
    };
    const contact = order.contact?.name ? order.contact : order.customer?.personalInfo;
    assignee = { label: "CLIENTE", name: shortName(contact?.name, contact?.lastname) || "Cliente" };
  }

  return {
    ...baseFields(order._id, order.createdAt),
    source: "order",
    status,
    context,
    assignee,
    items: (order.items || []).map((item, index) => ({
      id: String(item._id || `${order._id}-${index}`),
      label: `${item.quantity || 1}× ${item.name || "Producto"}`,
      itemType: item.itemType || "extra",
      notes: (item.notes || "").trim(),
    })),
    notes: (order.notes || "").trim(),
    ...resolveTiming(order, mapped, ["ready"], ["preparing"]),
  };
};

const productName = (entry, key, fallback) => {
  const ref = entry[key];
  const populated = ref && typeof ref === "object" ? ref.name || ref.title : "";
  return populated || entry.name || fallback;
};

const mapCartEntries = (entries = [], key, itemType, fallback) =>
  entries.map((entry, index) => ({
    id: String(entry._id || `${itemType}-${index}`),
    label: `${entry.quantity ?? 1}× ${productName(entry, key, fallback)}`,
    itemType,
    notes: String(entry.note || entry.notes || entry.observation || "").trim(),
  }));

export const mapCart = (cart) => {
  const mapped = CART_STATUS_MAP[cart.status];
  if (!mapped) return null;
  const status = resolveKitchenStatus(mapped, cart);

  const items = (cart.details || []).flatMap((detail) => [
    ...mapCartEntries(detail.combos, "comboId", "combo", "Combo"),
    ...mapCartEntries(detail.extras, "extraId", "extra", "Extra"),
    ...mapCartEntries(detail.drinks, "drinkId", "drink", "Bebida"),
    ...(detail.extras || []).flatMap((extra) => mapCartEntries(extra.drinks, "drinkId", "drink", "Bebida")),
  ]);

  const customer = cart.customerId || cart.idCustomer;
  const customerName =
    customer && typeof customer === "object"
      ? shortName(customer.personalInfo?.name || customer.name, customer.personalInfo?.lastname || customer.lastname)
      : "";

  const tableNumber = cart.table && typeof cart.table === "object" ? cart.table.number : null;

  return {
    ...baseFields(cart._id, cart.createdAt),
    source: "cart",
    status,
    context: {
      icon: tableNumber ? "grid_view" : "shopping_bag",
      text: tableNumber ? `Mesa ${tableNumber}` : "Pedido en línea",
    },
    assignee: { label: "CLIENTE", name: customerName || "Cliente" },
    items,
    notes: "",
    ...resolveTiming(cart, mapped, ["ready", "lista"], ["cooking", "preparing", "en_proceso"]),
  };
};
