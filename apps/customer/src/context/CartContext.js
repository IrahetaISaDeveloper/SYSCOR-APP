import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de un CartProvider');
  return context;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  // Aviso de "se agregó a tu bolsa" (ver components/CartAddedToast). Si se
  // agregan varios seguidos (repetir un pedido, una combinación), se juntan
  // en un solo aviso.
  const [addedNotice, setAddedNotice] = useState(null);

  // Devuelve el id de la línea, para poder cambiarle la cantidad después.
  const addItem = useCallback((payload) => {
    const cartItemId = `${payload.productId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setItems((prev) => [...prev, { ...payload, cartItemId }]);
    const quantity = Number(payload.quantity) || 1;
    setAddedNotice((prev) => {
      const now = Date.now();
      if (prev && now - prev.at < 800) return { ...prev, count: prev.count + quantity, lines: prev.lines + 1, at: now };
      return { key: `${now}`, name: payload.name, imageUrl: payload.imageUrl || null, count: quantity, lines: 1, at: now };
    });
    return cartItemId;
  }, []);

  const dismissAddedNotice = useCallback(
    (key) => setAddedNotice((prev) => (prev && prev.key === key ? null : prev)),
    []
  );

  const updateQuantity = useCallback((cartItemId, newQuantity) => {
    setItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: newQuantity, totalPrice: (Number(item.unitPrice) || 0) * newQuantity }
          : item
      )
    );
  }, []);

  const removeItem = useCallback((cartItemId) => {
    setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0),
    [items]
  );
  // No hay propina: el total es lo consumido.
  const total = subtotal;
  const itemCount = useMemo(
    () => items.reduce((count, item) => count + (Number(item.quantity) || 1), 0),
    [items]
  );

  const value = {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    total,
    itemCount,
    addedNotice,
    dismissAddedNotice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
