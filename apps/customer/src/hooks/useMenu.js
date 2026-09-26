import { useCallback, useEffect, useMemo, useState } from 'react';
import { getSaucersList, getCombosList, getDrinksList } from '../services/api';

// Consulta el menú y lo entrega ya formateado para la pantalla.
//
// Antes solo devolvía el "top 4" de platillos, así que no había con qué
// llenar el filtro por categorías. Ahora trae la lista completa y la pantalla
// decide qué enseñar: los más pedidos van a la sección destacada y el resto
// se filtra por la categoría activa.
const useMenu = () => {
  const [dishes, setDishes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // El backend respondió 401/403: el menú pide sesión.
  const [needsAuth, setNeedsAuth] = useState(false);

  const fetchDishes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setNeedsAuth(false);

    // Se usa `getSaucersList` (apiClient) y no `fetch` directo: manda la
    // cookie de sesión, que el backend exige en /menu/saucers.
    // Platillos, combos y bebidas se piden juntos; combos y bebidas van a su
    // propia categoría ("Combos", "Bebidas"). Si solo fallan esos, el menú sigue.
    const [res, combosRes, drinksRes] = await Promise.all([
      getSaucersList(),
      getCombosList(),
      getDrinksList(),
    ]);

    if (!res.success) {
      setError(res.error || 'No se pudieron cargar los platillos.');
      setNeedsAuth(res.status === 401 || res.status === 403);
      setDishes([]);
      setIsLoading(false);
      return;
    }

    setDishes([
      ...(res.data || []).map(normalizeDish),
      ...(combosRes.success ? (combosRes.data || []).map(normalizeCombo) : []),
      ...(drinksRes.success ? (drinksRes.data || []).map(normalizeDrink) : []),
    ]);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchDishes();
  }, [fetchDishes]);

  // Solo las categorías que de verdad tienen platillos: no tiene sentido
  // ofrecer un filtro que devuelve una lista vacía.
  const availableCategories = useMemo(
    () => [...new Set(dishes.map((d) => d.category).filter(Boolean))],
    [dishes],
  );

  return {
    dishes,
    availableCategories,
    isLoading,
    error,
    needsAuth,
    refetch: fetchDishes,
  };
};

// ── Helpers ───────────────────────────────────────────────────────

// El backend no es consistente en los nombres de campo, así que se aceptan
// las variantes conocidas y se normaliza a una sola forma.
const normalizeDish = (item) => {
  const rawPrice = item.price ?? item.precio ?? item.cost ?? 0;

  return {
    itemType: 'saucer',
    id: String(item._id?.$oid || item._id || item.id || Math.random()),
    name: item.name || item.nombre || item.title || 'Platillo',
    description:
      item.description || item.descripcion || item.desc || 'Delicioso platillo de nuestra cocina.',
    // Se guardan los dos: el número para ordenar y comparar, el texto para pintar.
    price: toNumber(rawPrice),
    priceLabel: formatPrice(rawPrice),
    // En el backend `quantity` NO son ventas: es cuántos tacos trae la orden
    // (3, 4 o 5) y solo aplica a la categoría Tacos.
    tacosPerOrder: toNumber(item.quantity) || null,
    // Tal cual lo guarda el panel de administración ("Tacos", "Burritos"...).
    category: item.category || item.categoria || null,
    subcategory: item.subcategory || item.subcategoria || null,
    imageUrl: item.image || item.imageUrl || item.img || item.foto || null,
  };
};

// Los combos usan su tamaño como subcategoría, así los chips de la categoría
// Combos filtran por Individual / Dúo / Familiar.
const COMBO_SIZES = { individual: 'Individual', duo: 'Dúo', familiar: 'Familiar' };

const normalizeCombo = (item) => ({
  ...normalizeDish({ ...item, category: null, subcategory: null, quantity: null }),
  itemType: 'combo',
  category: 'Combos',
  subcategory: COMBO_SIZES[item.category] || null,
});

// Las bebidas se separan en las que se preparan aquí y las embotelladas.
const DRINK_KINDS = { casa: 'De la casa', tercero: 'Embotelladas' };

const normalizeDrink = (item) => ({
  ...normalizeDish({ ...item, category: null, subcategory: null, quantity: null }),
  itemType: 'drink',
  category: 'Bebidas',
  subcategory: DRINK_KINDS[item.category] || null,
  description: item.description || (item.category === 'casa' ? 'Preparada en casa.' : 'Bien fría.'),
});

const toNumber = (raw) => {
  const num = parseFloat(raw);
  return Number.isNaN(num) ? 0 : num;
};

const formatPrice = (raw) => `$${toNumber(raw).toFixed(2)}`;

export default useMenu;
