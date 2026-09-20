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
    console.error('Error al conectar con la API:', error.message);
    const timedOut = error.code === 'ECONNABORTED';
    return {
      success: false,
      error: timedOut
        ? 'Tiempo de espera agotado. Revisa tu IP o conexión.'
        : `No se pudo conectar: ${error.message}`,
    };
  }
};

// Busca un item por ID dentro de una lista; si no se pasa ID, toma el primero
// disponible (útil mientras no tengas un ID real a mano para probar).
const pickById = (list, id, availableStatuses) => {
  if (!id) {
    const available = availableStatuses
      ? list.find((item) => availableStatuses.includes(item.status))
      : null;
    return available || list[0] || null;
  }
  return list.find((item) => idOf(item) === id) || null;
};

// Listas para la pantalla de Menú: solo los productos activos de cada tipo.
export const getCombosList = async () => {
  const res = await request('/menu/combos');
  if (!res.success) return res;
  return { success: true, data: (res.data || []).filter(isActiveStatus) };
};

export const getDrinksList = async () => {
  const res = await request('/menu/drinks');
  if (!res.success) return res;
  return { success: true, data: (res.data || []).filter(isActiveStatus) };
};

export const getSaucersList = async () => {
  const res = await request('/menu/saucers');
  if (!res.success) return res;
  return { success: true, data: (res.data || []).filter(isActiveStatus) };
};

// El backend no expone GET /menu/combos/:id (solo PATCH y DELETE),
// así que traemos la lista completa y buscamos el combo por su ID.
export const getComboById = async (id) => {
  const res = await request('/menu/combos');
  if (!res.success) return res;

  const combo = pickById(res.data || [], id, ['disponible']);
  if (!combo) {
    return { success: false, error: 'No se encontró ningún combo. Crea uno desde el panel de administración.' };
  }
  return { success: true, data: combo };
};

// Igual que combos: /menu/drinks solo expone la lista completa (sin filtro por ID).
export const getDrinkById = async (id) => {
  const res = await request('/menu/drinks');
  if (!res.success) return res;

  const drink = pickById(res.data || [], id, ['disponible']);
  if (!drink) {
    return { success: false, error: 'No se encontró ninguna bebida. Crea una desde el panel de administración.' };
  }
  return { success: true, data: drink };
};

// Igual que combos: /menu/saucers solo expone la lista completa (sin filtro por ID).
export const getSaucerById = async (id) => {
  const res = await request('/menu/saucers');
  if (!res.success) return res;

  const saucer = pickById(res.data || [], id, ['Activo']);
  if (!saucer) {
    return { success: false, error: 'No se encontró ningún platillo. Crea uno desde el panel de administración.' };
  }
  return { success: true, data: saucer };
};

// /menu/extras/active requiere sesión (cookie de auth), así que usamos la
// lista general (pública) y filtramos nosotros mismos por status activo.
export const getActiveExtras = async () => {
  const res = await request('/menu/extras');
  if (!res.success) return res;
  return { success: true, data: (res.data || []).filter(isActiveStatus) };
};