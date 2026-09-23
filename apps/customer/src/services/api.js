import apiClient from '@syscor/shared/src/services/apiClient';

const idOf = (item) => item?._id?.$oid || item?._id || item?.id;

// El status es texto libre en el backend (no hay un enum fijo), así que
// aceptamos las variantes comunes de "disponible" sin importar mayúsculas.
const ACTIVE_STATUS_WORDS = ['disponible', 'activo', 'active'];
const isActiveStatus = (item) => ACTIVE_STATUS_WORDS.includes(String(item?.status || '').toLowerCase());

// Envuelve las peticiones de menú en el mismo contrato { success, data, error }
// que ya esperan los hooks de esta app.
const request = async (path) => {
  try {
    const { data: json } = await apiClient.get(path);
    // Soporta backends que responden { data: ... } o el objeto directo
    const data = json && json.data !== undefined ? json.data : json;
    return { success: true, data };
  } catch (error) {
    const status = error.response?.status;

    // 401/403 no es una falla: el endpoint pide sesión (p. ej. el menú de
    // invitado). La pantalla ya lo explica, así que no se registra como
    // error (console.error abre la pantalla roja de LogBox en desarrollo).
    if (status === 401 || status === 403) {
      return { success: false, status, error: 'Necesitas iniciar sesión para ver esto.' };
    }

    // 404: la ruta no existe en el servidor al que apunta la app (p. ej. un
    // backend desplegado que aún no tiene la ruta nueva). No es un fallo de
    // conexión, así que tampoco se registra como aviso.
    if (status === 404) {
      return { success: false, status, error: 'El servidor todavía no tiene esta función.' };
    }

    console.warn('Error al conectar con la API:', error.message);
    const timedOut = error.code === 'ECONNABORTED';
    return {
      success: false,
      status,
      error: timedOut
        ? 'Tiempo de espera agotado. Revisa tu IP o conexión.'
        : `No se pudo conectar: ${error.message}`,
    };
  }
};

// Busca un item por ID dentro de una lista; si no se pasa ID, toma el primero
// (útil mientras no tengas un ID real a mano para probar).
const pickById = (list, id) => {
  if (!id) return list[0] || null;
  return list.find((item) => String(idOf(item)) === String(id)) || null;
};

// Rutas del menú que el backend abre al rol "customer". Las listas generales
// (/menu/saucers, /menu/combos, /menu/drinks, /menu/extras) son solo para
// admin/empleados y a un cliente le responden 401; las `/active` sí le
// responden y ya vienen filtradas por status activo.
const ACTIVE_PATHS = {
  saucers: '/menu/saucers/active',
  combos: '/menu/combos/active',
  drinks: '/menu/drinks/active',
  extras: '/menu/extras/active',
};

// Se sigue filtrando por status en la app por si el backend cambia qué
// considera "activo" en alguna de las rutas.
const getActiveList = async (path) => {
  const res = await request(path);
  if (!res.success) return res;
  return { success: true, data: (res.data || []).filter(isActiveStatus) };
};

// Listas para la pantalla de Menú: solo los productos activos de cada tipo.
export const getCombosList = () => getActiveList(ACTIVE_PATHS.combos);
export const getDrinksList = () => getActiveList(ACTIVE_PATHS.drinks);
export const getSaucersList = () => getActiveList(ACTIVE_PATHS.saucers);
export const getActiveExtras = () => getActiveList(ACTIVE_PATHS.extras);

// El backend no expone GET por ID para el cliente, así que se trae la lista
// activa y se busca el producto dentro de ella.
const getActiveById = async (path, id, notFound) => {
  const res = await getActiveList(path);
  if (!res.success) return res;

  const item = pickById(res.data || [], id);
  if (!item) return { success: false, error: notFound };
  return { success: true, data: item };
};

export const getComboById = (id) =>
  getActiveById(ACTIVE_PATHS.combos, id, 'Este combo ya no está disponible.');

export const getDrinkById = (id) =>
  getActiveById(ACTIVE_PATHS.drinks, id, 'Esta bebida ya no está disponible.');

export const getSaucerById = (id) =>
  getActiveById(ACTIVE_PATHS.saucers, id, 'Este platillo ya no está disponible.');

// ── PEDIDOS ──────────────────────────────────────────────────────────────

// Pedidos del cliente con sesión, del más reciente al más antiguo. El backend
// toma el cliente del token (cookie), así que no hace falta mandar su ID.
export const getMyOrders = () => request('/orders/mine');
