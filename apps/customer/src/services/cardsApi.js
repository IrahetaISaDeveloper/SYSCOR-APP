import apiClient from '@syscor/shared/src/services/apiClient';

// Tarjetas guardadas del cliente (/users/customers/:id/cards).
//
// El número se manda una sola vez, al guardarla; el backend lo guarda cifrado
// y de vuelta solo llegan { index, brand, lastFour, cardHolder, expiryMonth,
// expiryYear, isDefault }. El CVV nunca se manda aquí: se pide en cada compra.
// Igual que las direcciones, cada tarjeta se identifica por su `index`.
export const MAX_CARDS = 5;

// Nombre para mostrar de cada marca que guarda el backend.
export const BRAND_LABELS = {
  VISA: 'Visa',
  MASTERCARD: 'Mastercard',
  AMEX: 'American Express',
  DINERS: 'Diners Club',
  OTHER: 'Tarjeta',
};

// Largo del CVV que se pide al pagar con una tarjeta guardada.
export const cvvLengthOf = (brand) => (brand === 'AMEX' ? 4 : 3);

export const formatCardExpiry = (card) =>
  card?.expiryMonth
    ? `${String(card.expiryMonth).padStart(2, '0')}/${String(card.expiryYear).padStart(2, '0')}`
    : '';

const base = (customerId) => `/users/customers/${customerId}/cards`;

const call = async (fn) => {
  try {
    const { data } = await fn();
    return { success: true, cards: data?.cards || [] };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status,
      error: error.response?.data?.message || 'No se pudo conectar. Inténtalo de nuevo.',
    };
  }
};

export const getCards = (customerId) => call(() => apiClient.get(base(customerId)));

export const addCard = (customerId, { cardHolder, cardNumber, expiryMonth, expiryYear, isDefault }) =>
  call(() =>
    apiClient.post(base(customerId), {
      cardHolder,
      cardNumber: String(cardNumber).replace(/\s/g, ''),
      expiryMonth: Number(expiryMonth),
      expiryYear: Number(expiryYear),
      isDefault: !!isDefault,
    }),
  );

// Solo nombre y vencimiento: el número no se edita (sería otra tarjeta).
export const updateCard = (customerId, index, { cardHolder, expiryMonth, expiryYear }) =>
  call(() =>
    apiClient.patch(`${base(customerId)}/${index}`, {
      cardHolder,
      expiryMonth: Number(expiryMonth),
      expiryYear: Number(expiryYear),
    }),
  );

export const setDefaultCard = (customerId, index) =>
  call(() => apiClient.patch(`${base(customerId)}/${index}/default`));

export const deleteCard = (customerId, index) => call(() => apiClient.delete(`${base(customerId)}/${index}`));
