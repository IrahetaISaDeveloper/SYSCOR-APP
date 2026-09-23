import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@syscor/shared/src/context/AuthContext';

// Favoritos y combinaciones guardadas del cliente.
//
// - Favorito: un producto suelto (platillo, combo o bebida) marcado con el
//   corazón.
// - Combinación: varios productos del carrito guardados juntos con un nombre
//   ("Mi martes de pastor") para pedirlos otra vez de un toque.
//
// Se guardan en el teléfono (AsyncStorage), separados por cuenta. El backend
// todavía no tiene dónde guardarlos; cuando lo tenga, basta con cambiar
// `load`/`persist` por llamadas a la API sin tocar las pantallas.
const FavoritesContext = createContext(null);

const storageKey = (userId) => `syscor:favorites:${userId}`;

const EMPTY = { favorites: [], combinations: [] };

export const favoriteKey = (type, id) => `${type}:${id}`;

export const FavoritesProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?._id || user?.id || 'anon';

  const [data, setData] = useState(EMPTY);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoaded(false);
    AsyncStorage.getItem(storageKey(userId))
      .then((raw) => {
        if (cancelled) return;
        const parsed = raw ? JSON.parse(raw) : EMPTY;
        setData({
          favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
          combinations: Array.isArray(parsed.combinations) ? parsed.combinations : [],
        });
      })
      .catch(() => !cancelled && setData(EMPTY))
      .finally(() => !cancelled && setIsLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Cambia el estado y lo guarda. Si guardar falla, el cambio sigue en
  // memoria: es preferible a perder lo que el cliente acaba de marcar.
  const update = useCallback(
    (fn) => {
      setData((prev) => {
        const next = fn(prev);
        AsyncStorage.setItem(storageKey(userId), JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    [userId],
  );

  const isFavorite = useCallback(
    (type, id) => data.favorites.some((f) => f.key === favoriteKey(type, id)),
    [data.favorites],
  );

  // `product`: { type: 'saucer' | 'combo' | 'drink', id, name, price, imageUrl }
  const toggleFavorite = useCallback(
    (product) => {
      const key = favoriteKey(product.type, product.id);
      update((prev) => {
        const exists = prev.favorites.some((f) => f.key === key);
        return {
          ...prev,
          favorites: exists
            ? prev.favorites.filter((f) => f.key !== key)
            : [
                {
                  key,
                  type: product.type,
                  id: String(product.id),
                  name: product.name || 'Producto',
                  price: Number(product.price) || 0,
                  imageUrl: product.imageUrl || null,
                  addedAt: Date.now(),
                },
                ...prev.favorites,
              ],
        };
      });
    },
    [update],
  );

  // `items`: los productos tal como están en el carrito (con sus salsas,
  // extras, etc.), para que al pedir de nuevo salgan idénticos.
  const saveCombination = useCallback(
    (name, items) => {
      const clean = items.map(({ cartItemId, ...item }) => item);
      update((prev) => ({
        ...prev,
        combinations: [
          {
            id: `combo-${Date.now()}`,
            name: name.trim() || 'Mi combinación',
            items: clean,
            total: clean.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0),
            createdAt: Date.now(),
          },
          ...prev.combinations,
        ],
      }));
    },
    [update],
  );

  const removeCombination = useCallback(
    (id) => update((prev) => ({ ...prev, combinations: prev.combinations.filter((c) => c.id !== id) })),
    [update],
  );

  const value = useMemo(
    () => ({
      favorites: data.favorites,
      combinations: data.combinations,
      isLoaded,
      isFavorite,
      toggleFavorite,
      saveCombination,
      removeCombination,
    }),
    [data, isLoaded, isFavorite, toggleFavorite, saveCombination, removeCombination],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

// Devuelve null si no hay proveedor (por ejemplo, en el menú de invitado):
// ahí simplemente no se muestra el corazón.
export const useFavorites = () => useContext(FavoritesContext);

export default FavoritesContext;
