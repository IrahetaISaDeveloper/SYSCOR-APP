import apiClient from '@syscor/shared/src/services/apiClient';

// Pago en línea con Wompi 3D Secure (/payments/checkout).
//
// 1. createCheckout: el backend recalcula precios y crea el cobro. Devuelve
//    `paymentUrl` (la verificación del banco) y `returnUrlPrefix` (la URL a la
//    que vuelve Wompi al terminar; al verla, la app cierra la verificación).
// 2. getCheckout: cómo terminó. `status` es pending | approved | rejected | error.
//    El pedido solo existe cuando está `approved` (trae `orderId`).
// 3. cancelCheckout: el cliente cerró la verificación sin terminar.

const call = async (fn) => {
  try {
    const { data } = await fn();
    return { success: true, checkout: data };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status,
      error: error.response?.data?.message || 'No se pudo conectar. Inténtalo de nuevo.',
      // Montos que el servidor calculó, cuando el saldo no alcanzó.
      chargeAmount: error.response?.data?.chargeAmount,
    };
  }
};

// Lo que el backend necesita de cada producto del carrito. Los precios no se
// mandan: el servidor usa los de la base de datos.
const toCheckoutItem = (item) => ({
  productType: item.productType,
  productId: item.productId,
  name: item.name,
  quantity: item.quantity,
  selectedDrinkId: item.selectedDrinkId || null,
  selectedSauces: item.selectedSauces || [],
  removedIngredients: item.removedIngredients || [],
  selectedSelectiveItems: (item.selectedSelectiveItems || []).map((pick) =>
    typeof pick === 'string' ? pick : { name: pick?.name },
  ),
  selectedExtras: (item.selectedExtras || []).map((extra) => ({
    extraId: extra.extraId,
    name: extra.name,
    // En un combo, el platillo al que va el extra (para cocina).
    forSaucer: extra.forSaucer || null,
  })),
});

export const createCheckout = ({ items, isDelivery, deliveryAddress, card, saveCard, useCredit }) =>
  call(() =>
    apiClient.post('/payments/checkout', {
      items: items.map(toCheckoutItem),
      isDelivery,
      deliveryAddress,
      card,
      saveCard,
      useCredit,
    }),
  );

export const getCheckout = (id) => call(() => apiClient.get(`/payments/checkout/${id}`));

export const cancelCheckout = (id) => call(() => apiClient.post(`/payments/checkout/${id}/cancel`));

// Pregunta hasta que el pago deje de estar pendiente (Wompi puede tardar unos
// segundos en reflejar el resultado después del 3DS).
export const waitForCheckout = async (id, { attempts = 8, delayMs = 1500 } = {}) => {
  let last = null;
  for (let i = 0; i < attempts; i += 1) {
    last = await getCheckout(id);
    if (last.success && last.checkout.status !== 'pending') return last;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return last;
};
