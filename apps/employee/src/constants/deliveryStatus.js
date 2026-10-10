export const PAYMENT_LABELS = {
  cash: "EFECTIVO",
  card: "TARJETA",
  card_on_delivery: "TARJETA",
  online: "PAGADO",
};

export const PAYMENT_SHORT = {
  cash: "efectivo",
  card: "tarjeta",
  card_on_delivery: "tarjeta",
  online: "pagado en línea",
};

export const DELIVERY_BADGE = {
  assigned: { label: "ASIGNADA", color: "#3A3A3A" },
  on_route: { label: "EN RUTA", color: "#F39C12" },
  delivered: { label: "ENTREGADA", color: "#2ECC71" },
};

export const HANDOFF_METHODS = [
  { key: "hand", label: "En mano", icon: "person" },
  { key: "reception", label: "Recepción", icon: "meeting_room" },
];

export const formatMoney = (amount) => `$${Number(amount || 0).toFixed(2)}`;

export const formatKm = (km) => {
  const value = Number(km || 0);
  return `${Number.isInteger(value) ? value : value.toFixed(1)} km`;
};

export const countItems = (items = []) => items.reduce((sum, item) => sum + (item.quantity || 1), 0);

export const platillosLabel = (items) => {
  const count = countItems(items);
  return `${count} ${count === 1 ? "platillo" : "platillos"}`;
};
