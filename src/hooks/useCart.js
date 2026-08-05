import { useMemo, useState } from 'react';

// Toda la lógica del Carrito: agregar/actualizar/limpiar items y calcular
// subtotal, propina y total. Vive acá y no en App.js ni en otras pantallas.
export const useCart = () => {
  const [cartItems, setCartItems] = useState([]);

  const { subtotal, tip, total } = useMemo(() => {
    const sub = cartItems.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );
    const propina = sub * 0.05;
    return { subtotal: sub, tip: propina, total: sub + propina };
  }, [cartItems]);

  const addToCart = (payload) => {
    setCartItems((prev) => [
      ...prev,
      {
        id: `${payload.productId}-${prev.length}`,
        name: payload.name,
        description: payload.name,
        price: payload.unitPrice,
        quantity: payload.quantity,
        imageUrl: payload.imageUrl,
      },
    ]);
  };

  const updateQuantity = (id, quantity) => {
    setCartItems((prev) =>
      quantity <= 0
        ? prev.filter((item) => item.id !== id)
        : prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCartItems([]);

  return {
    cartItems,
    subtotal,
    tip,
    total,
    addToCart,
    updateQuantity,
    clearCart,
  };
};

export default useCart;
