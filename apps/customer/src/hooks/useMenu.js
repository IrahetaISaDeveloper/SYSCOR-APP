import { useCallback, useEffect, useMemo, useState } from 'react';
import { getSaucersList } from '../services/api';

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

  const fetchDishes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Se usa `getSaucersList` (apiClient) y no `fetch` directo: manda la
    // cookie de sesión, que el backend exige en /menu/saucers.
    const res = await getSaucersList();

    if (!res.success) {
      setError(res.error || 'No se pudieron cargar los platillos.');
      setDishes([]);
      setIsLoading(false);
      return;
    }

    setDishes((res.data || []).map(normalizeDish));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchDishes();
  }, [fetchDishes]);

  // Los más pedidos, para la sección destacada.
  const popularDishes = useMemo(
    () => [...dishes].sort((a, b) => b.quantity - a.quantity).slice(0, 4),
    [dishes],
  );

  // Solo las categorías que de verdad tienen platillos: no tiene sentido
  // ofrecer un filtro que devuelve una lista vacía.
  const availableCategories = useMemo(
    () => [...new Set(dishes.map((d) => d.category).filter(Boolean))],
    [dishes],
  );

  return {
    dishes,
    popularDishes,
    availableCategories,
    isLoading,
    error,
    refetch: fetchDishes,
  };
};

// ── Helpers ───────────────────────────────────────────────────────

// El backend no es consistente en los nombres de campo, así que se aceptan
// las variantes conocidas y se normaliza a una sola forma.
const normalizeDish = (item) => {
  const rawPrice = item.price ?? item.precio ?? item.cost ?? 0;

  return {
    id: String(item._id?.$oid || item._id || item.id || Math.random()),
    name: item.name || item.nombre || item.title || 'Platillo',
    description:
      item.description || item.descripcion || item.desc || 'Delicioso platillo de nuestra cocina.',
    // Se guardan los dos: el número para ordenar y comparar, el texto para pintar.
    price: toNumber(rawPrice),
    priceLabel: formatPrice(rawPrice),
    quantity: toNumber(item.quantity ?? item.qty ?? item.sold ?? item.orders ?? 0),
    // Tal cual lo guarda el panel de administración ("Tacos", "Burritos"...).
    category: item.category || item.categoria || null,
    subcategory: item.subcategory || item.subcategoria || null,
    imageUrl: item.image || item.imageUrl || item.img || item.foto || null,
  };
};

const toNumber = (raw) => {
  const num = parseFloat(raw);
  return Number.isNaN(num) ? 0 : num;
};

const formatPrice = (raw) => `$${toNumber(raw).toFixed(2)}`;

export default useMenu;
