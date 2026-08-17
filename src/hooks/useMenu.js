import { useCallback, useEffect, useState } from 'react';

// URL base de la API backend (10.0.2.2 es la dirección IP especial para acceder a localhost desde un emulador Android)
const BASE_URL = 'https://syscor.onrender.com/api';

/**
 * Hook personalizado 'useMenu'
 * Se encarga de consultar los platillos disponibles en el menú desde el servidor backend,
 * ordenar los platillos más vendidos/pedidos y entregarlos formateados a la interfaz.
 */
const useMenu = () => {
  // Estado para guardar la lista de los platillos más populares
  const [popularDishes, setPopularDishes] = useState([]);
  // Estado para controlar el indicador de carga (spinner / skeleton)
  const [isLoading, setIsLoading] = useState(true);
  // Estado para registrar si hubo un fallo en la conexión con la API
  const [error, setError] = useState(null);

  // Función asíncrona para obtener los platillos del menú desde la API
  const fetchPopularDishes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Realizamos la petición HTTP GET al endpoint de platillos
      const response = await fetch(`${BASE_URL}/menu/saucers`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Normalizamos la respuesta por si viene en diferentes formatos ({ data: [...] } o array directo)
      const saucers = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.saucers)
            ? data.saucers
            : [];

      // Ordenamos los platillos por cantidad de pedidos (mayor a menor) y seleccionamos el Top 4
      const top4 = [...saucers]
        .sort((a, b) => {
          const qA = Number(a.quantity ?? a.qty ?? a.sold ?? a.orders ?? 0);
          const qB = Number(b.quantity ?? b.qty ?? b.sold ?? b.orders ?? 0);
          return qB - qA;
        })
        .slice(0, 4)
        .map((item) => ({
          id: String(item._id || item.id || Math.random()),
          name: item.name || item.nombre || item.title || 'Platillo',
          description:
            item.description ||
            item.descripcion ||
            item.desc ||
            'Delicioso platillo de nuestra cocina.',
          price: formatPrice(item.price ?? item.precio ?? item.cost ?? 0),
          quantity: Number(item.quantity ?? item.qty ?? item.sold ?? item.orders ?? 0),
          imageUrl: item.image || item.imageUrl || item.img || item.foto || null,
        }));

      setPopularDishes(top4);
    } catch (err) {
      console.error('[useMenu] Error al cargar platillos:', err);
      setError('No se pudieron cargar los platillos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Efecto secundario: carga los platillos automáticamente al iniciar la pantalla
  useEffect(() => {
    fetchPopularDishes();
  }, [fetchPopularDishes]);

  // Retorna los datos y funciones que usará la pantalla de Menú del Cliente (CustomerMenu.jsx)
  return { popularDishes, isLoading, error, refetch: fetchPopularDishes };
};

// ── Helpers ───────────────────────────────────────────────────────
// Función auxiliar para formatear valores numéricos a moneda en formato de dólares ($0.00)
const formatPrice = (raw) => {
  const num = parseFloat(raw);
  if (isNaN(num)) return '$0.00';
  return `$${num.toFixed(2)}`;
};

export default useMenu;
