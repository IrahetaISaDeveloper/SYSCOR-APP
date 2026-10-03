// Permisos del sistema, con el nombre que entiende el empleado. Mismos ids que
// el backend (backEnd/src/constants/permissions.js) y el panel web
// (FrontEndWebTaqueria/src/constants/permissions.js).
//
// Los de tipo "screen" abren una pantalla del panel web; los de tipo
// "action" dejan hacer algo puntual. La app solo los muestra: quien los da o
// los quita es un administrador desde el panel.
export const PERMISSIONS = {
  dashboard: { label: 'Actividad y análisis', icon: 'stats-chart-outline', type: 'screen' },
  combos: { label: 'Combos', icon: 'fast-food-outline', type: 'screen' },
  drinks: { label: 'Bebidas', icon: 'cafe-outline', type: 'screen' },
  drink_sets: { label: 'Conjuntos de bebidas', icon: 'albums-outline', type: 'screen' },
  dishes: { label: 'Platillos', icon: 'restaurant-outline', type: 'screen' },
  extras: { label: 'Extras', icon: 'add-circle-outline', type: 'screen' },
  promotions: { label: 'Promociones de hoy', icon: 'pricetag-outline', type: 'screen' },
  recipes: { label: 'Recetas', icon: 'book-outline', type: 'screen' },
  orders: { label: 'Pedidos y órdenes', icon: 'receipt-outline', type: 'screen' },
  tables: { label: 'Mesas', icon: 'grid-outline', type: 'screen' },
  inventory: { label: 'Inventario', icon: 'cube-outline', type: 'screen' },
  clients: { label: 'Clientes', icon: 'people-outline', type: 'screen' },
  employees: { label: 'Empleados', icon: 'id-card-outline', type: 'screen' },
  invite_staff: { label: 'Invitar personal', icon: 'person-add-outline', type: 'screen' },
  payroll: { label: 'Planilla', icon: 'wallet-outline', type: 'screen' },
  reports: { label: 'Reportes contables (IVA)', icon: 'document-text-outline', type: 'screen' },
  notifications: { label: 'Notificaciones', icon: 'notifications-outline', type: 'screen' },
  settings: { label: 'Ajustes', icon: 'settings-outline', type: 'screen' },

  orders_cancel: { label: 'Cancelar pedidos', icon: 'close-circle-outline', type: 'action' },
  employees_manage_status: { label: 'Dar de alta o baja a empleados', icon: 'person-remove-outline', type: 'action' },
  clients_manage_status: { label: 'Activar o desactivar clientes', icon: 'person-circle-outline', type: 'action' },
  inventory_adjust_stock: { label: 'Ajustar existencias del inventario', icon: 'swap-vertical-outline', type: 'action' },
  tables_change_status: { label: 'Cambiar el estado de una mesa', icon: 'repeat-outline', type: 'action' },
};

// Permisos del empleado agrupados: lo que puede ver en el panel y lo que
// puede hacer. Los que el sistema ya no conoce no se muestran.
export const groupPermissions = (ids = []) => {
  const known = ids.filter((id) => PERMISSIONS[id]).map((id) => ({ id, ...PERMISSIONS[id] }));
  return {
    screens: known.filter((p) => p.type === 'screen'),
    actions: known.filter((p) => p.type === 'action'),
  };
};

export default PERMISSIONS;
