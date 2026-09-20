import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de un CartProvider');
  return context;
};

const TIP_PERCENTAGE = 0.05;

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const addItem = useCallback((payload) => {
    setItems((prev) => [
      ...prev,
      { ...payload, cartItemId: `${payload.productId}-${Date.now()}-${Math.random().toString(36).slice(2)}` },
    ]);
  }, []);

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
  const tip = useMemo(() => subtotal * TIP_PERCENTAGE, [subtotal]);
  const total = useMemo(() => subtotal + tip, [subtotal, tip]);
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
    tip,
    total,
    itemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
