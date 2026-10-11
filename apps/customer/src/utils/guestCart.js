// Producto que un invitado quiso agregar antes de dar su nombre. La pantalla
// de invitado lo guarda aquí y CartProvider lo mete a la bolsa al montarse
// (ya con la sesión de invitado abierta).
let pendingItem = null;

export const setPendingCartItem = (item) => {
  pendingItem = item || null;
};

export const takePendingCartItem = () => {
  const item = pendingItem;
  pendingItem = null;
  return item;
};
