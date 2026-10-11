// Nombres de los eventos de tiempo real. Deben coincidir con SOCKET_EVENTS del
// backend (src/config/socket.js) y con los emit sueltos del reparto.
export const EVENTS = {
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  ORDER_DELETED: 'order:deleted',
  // Al cliente: uno de SUS pedidos cambió (estado, repartidor, etc.)
  ORDER_CHANGED: 'order:changed',
  ORDER_CHAT_MESSAGE: 'order:chat_message',
  ORDER_CHAT_READ: 'order:chat_read',
  ORDER_DRIVER_MESSAGE: 'order:driver_message',

  TABLE_CREATED: 'table:created',
  TABLE_UPDATED: 'table:updated',
  TABLE_DELETED: 'table:deleted',
  TABLES_BULK_UPDATED: 'table:bulk_updated',

  KITCHEN_STATUS_CHANGED: 'kitchen:status_changed',
  CASHIER_STATUS_CHANGED: 'cashier:status_changed',
  NOTIFICATION_CREATED: 'notification:created',
  // Aviso personal para el empleado conectado (su bandeja en la app).
  EMPLOYEE_NOTIFICATION: 'employee:notification',
  // A los meseros: cambió una solicitud de la página de la mesa
  // (pedir la cuenta / llamar al mesero).
  TABLE_REQUEST_CHANGED: 'table_request:changed',

  // Reparto
  DELIVERY_PACKAGE_ASSIGNED: 'delivery:package_assigned',
  DELIVERY_QUEUE_CHANGED: 'delivery:queue_changed',
  DELIVERY_QUEUED: 'delivery:queued',
  DELIVERY_STARTED: 'delivery:started',
  DELIVERY_ON_ROUTE: 'delivery:on_route',
  DELIVERY_DELIVERED: 'delivery:delivered',
};

// Grupos de uso frecuente
export const ORDER_EVENTS = [EVENTS.ORDER_CREATED, EVENTS.ORDER_UPDATED, EVENTS.ORDER_DELETED];
export const TABLE_EVENTS = [EVENTS.TABLE_CREATED, EVENTS.TABLE_UPDATED, EVENTS.TABLE_DELETED, EVENTS.TABLES_BULK_UPDATED];

export default EVENTS;
