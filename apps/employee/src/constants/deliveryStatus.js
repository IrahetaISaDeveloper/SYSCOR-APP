export const DELIVERY_BADGE = {
  available: { label: "POR SALIR", color: "#3A3A3A" },
  on_route: { label: "EN RUTA", color: "#F39C12" },
  delivered: { label: "ENTREGADA", color: "#2ECC71" },
};

export const PAYMENT_LABELS = {
  cash: "EFECTIVO",
  card_on_delivery: "TARJETA POS",
  online: "PAGADO",
};

export const COLLECT_DETAIL = {
  cash: "Pago en efectivo · cobrar al entregar",
  card_on_delivery: "Tarjeta al recibir · cobrar con POS",
};

export const collectsOnDelivery = (delivery) => Number(delivery?.amountToCollect) > 0;

export const paymentLabel = (delivery) =>
  collectsOnDelivery(delivery) ? PAYMENT_LABELS[delivery.paymentMethod] || "COBRAR" : PAYMENT_LABELS.online;

export const formatMoney = (amount) => `$${Number(amount || 0).toFixed(2)}`;

export const HANDOFF_METHODS = [
  { key: "hand", label: "En mano", icon: "person" },
  { key: "reception", label: "Recepción", icon: "meeting_room" },
];

const hasNumber = (value) => value !== null && value !== undefined && Number.isFinite(Number(value));

export const formatKm = (km) => {
  if (!hasNumber(km)) return "-- km";
  const value = Number(km);
  return `${Number.isInteger(value) ? value : value.toFixed(1)} km`;
};

export const formatMinutes = (minutes) => `${hasNumber(minutes) ? Math.round(Number(minutes)) : "--"} min`;

export const formatClock = (date) => {
  if (!date) return "--:--";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "--:--";
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export const minutesSince = (date) => {
  if (!date) return null;
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  return Number.isFinite(diff) ? Math.max(diff, 0) : null;
};

export const waitingLabel = (date) => {
  const minutes = minutesSince(date);
  if (minutes === null) return "Listo";
  return minutes < 1 ? "Listo ahora" : `Listo hace ${minutes} min`;
};

export const isToday = (date) => {
  if (!date) return false;
  const d = new Date(date);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
};

export const countItems = (items = []) => items.reduce((sum, item) => sum + (item.quantity || 1), 0);

export const platillosLabel = (items) => {
  const count = countItems(items);
  return `${count} ${count === 1 ? "platillo" : "platillos"}`;
};
