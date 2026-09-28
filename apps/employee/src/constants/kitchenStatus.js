export const LATE_THRESHOLD_MINUTES = 15;

export const KITCHEN_STATUS = {
  pending: { label: "PENDIENTE", badge: "#3A3A3A" },
  preparing: { label: "EN PREPARACIÓN", badge: "#E38B29" },
  late: { label: "RETRASADA", badge: "#C62828" },
  ready: { label: "LISTA", badge: "#2E8B57" },
  delivered: { label: "ENTREGADA", badge: "#6E665C" },
  cancelled: { label: "CANCELADA", badge: "#9E958A" },
};

export const ITEM_TYPE_DOT = {
  combo: "#8E2222",
  saucer: "#8E2222",
  extra: "#E38B29",
  drink: "#2E8B57",
};

export const KITCHEN_FILTERS = [
  { key: "all", label: "Todas" },
  { key: "pending", label: "Pendientes" },
  { key: "preparing", label: "En Prep." },
  { key: "late", label: "Retrasadas" },
  { key: "ready", label: "Listas" },
  { key: "delivered", label: "Entregadas" },
  { key: "cancelled", label: "Canceladas" },
];

export const ACTIVE_KITCHEN_STATUSES = ["pending", "preparing", "late"];
