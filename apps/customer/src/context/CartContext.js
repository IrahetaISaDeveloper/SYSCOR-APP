import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Alert } from 'react-native';

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

  // "Agregar más productos" a un pedido ya pagado: { orderId, code, until }.
  // Mientras dura, el carrito solo tiene lo nuevo; lo que el cliente tenía
  // se guarda aparte y vuelve al terminar. Si pasan los 10 minutos sin pagar,
  // lo agregado se borra (el servidor nunca lo recibió).
  const [addMode, setAddMode] = useState(null);
  const stashRef = useRef(null);
  // Mientras se paga lo agregado no se borra nada aunque se acabe el tiempo:
  // decide el resultado del pago.
  const payingAddRef = useRef(false);

  // Copia del modo para leerlo sin esperar al render (evita guardar el
  // carrito dos veces si se llama seguido).
  const addModeRef = useRef(null);

  const startAddMode = useCallback((mode) => {
    const current = addModeRef.current;
    const next = current?.orderId === mode.orderId ? { ...current, until: mode.until } : mode;
    if (!current) {
      // React puede correr esta función dos veces: solo la primera guarda.
      setItems((prev) => {
        if (stashRef.current === null) stashRef.current = prev;
        return [];
      });
    }
    addModeRef.current = next;
    setAddMode(next);
  }, []);

  // Termina el modo: lo agregado se descarta (ya se pagó, o se acabó el
  // tiempo) y vuelve el carrito de antes.
  const endAddMode = useCallback(() => {
    const stashed = stashRef.current || [];
    stashRef.current = null;
    payingAddRef.current = false;
    addModeRef.current = null;
    setItems(stashed);
    setAddMode(null);
  }, []);

  const setPayingAdd = useCallback((value) => {
    payingAddRef.current = value;
  }, []);

  useEffect(() => {
    if (!addMode?.until) return undefined;
    const expire = () => {
      if (payingAddRef.current) return;
      endAddMode();
      Alert.alert(
        'Se acabó el tiempo para agregar',
        `Quitamos lo que habías agregado al pedido ${addMode.code}, que ya volvió a la cola. Si deseas algo más, por favor realiza otro pedido.`,
      );
    };
    const ms = new Date(addMode.until).getTime() - Date.now();
    if (ms <= 0) {
      expire();
      return undefined;
    }
    const timer = setTimeout(expire, ms);
    return () => clearTimeout(timer);
  }, [addMode, endAddMode]);

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
    addMode,
    startAddMode,
    endAddMode,
    setPayingAdd,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
