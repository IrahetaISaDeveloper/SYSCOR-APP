import { employeePalette as palette } from "@syscor/shared/src/styles/employeePalette";

export const TABLE_STATUS = {
  libre: { label: "LIBRE", icon: "check", color: "#2ECC71", border: "#25A25A" },
  ocupada: { label: "OCUPADA", icon: "restaurant", color: "#C62828", border: "#8E1C1C" },
  limpieza: { label: "LIMPIEZA", icon: "cleaning_services", color: "#F39C12", border: "#B9740A" },
  reservada: { label: "RESERVADA", icon: "bookmark", color: "#9B59B6", border: "#74408A" },
};

export const TABLE_STATUS_ORDER = ["libre", "ocupada", "limpieza", "reservada"];

export const ORDER_STATUS = {
  pending: { label: "PENDIENTE", icon: "schedule", color: palette.muted },
  preparing: { label: "EN PREP.", icon: "local_fire_department", color: palette.warnInk },
  atrasado: { label: "ATRASADA", icon: "warning", color: palette.accent },
  ready: { label: "LISTA", icon: "check_circle", color: palette.okInk },
  delivered: { label: "SERVIDA", icon: "done_all", color: palette.muted },
};

export const IN_KITCHEN_STATUSES = ["pending", "preparing", "atrasado"];

export const getOrderStatusMeta = (status) => ORDER_STATUS[status] || ORDER_STATUS.pending;

export const formatOrderId = (orderId) => `#${String(orderId || "").slice(-4).toUpperCase()}`;

export const formatMoney = (amount) => `$${Number(amount || 0).toFixed(2)}`;

export const minutesSince = (date) => {
  if (!date) return null;
  const time = new Date(date).getTime();
  if (Number.isNaN(time)) return null;
  return Math.max(0, Math.floor((Date.now() - time) / 60000));
};

export const formatElapsed = (minutes) => {
  if (minutes === null || minutes === undefined) return null;
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
};

export const pluralize = (count, singular, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;
