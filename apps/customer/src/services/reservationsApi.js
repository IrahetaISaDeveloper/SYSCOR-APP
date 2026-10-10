import apiClient from '@syscor/shared/src/services/apiClient';

// Reservas de mesa para "Comer en el local" (/reservations).
//
// - getAvailability: antes de pagar, si hay mesa para esa hora y personas.
// - getReservationByOrder / getReservationOptions / assignTable: el chat de
//   Panchita que elige la mesa después de pagar.
// - checkIn: el cliente escaneó el QR de su mesa al llegar.

const call = async (fn) => {
  try {
    const { data } = await fn();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status,
      title: error.response?.data?.title,
      error: error.response?.data?.message || 'No se pudo conectar. Inténtalo de nuevo.',
    };
  }
};

export const getAvailability = ({ reservedFor, partySize }) =>
  call(() => apiClient.get('/reservations/availability', { params: { reservedFor, partySize } }));

export const getReservationByOrder = (orderId) => call(() => apiClient.get(`/reservations/by-order/${orderId}`));

export const getReservationOptions = (reservationId) => call(() => apiClient.get(`/reservations/${reservationId}/options`));

export const assignTable = (reservationId, tableId) =>
  call(() => apiClient.post(`/reservations/${reservationId}/assign`, { tableId }));

export const checkIn = (code) => call(() => apiClient.post('/reservations/check-in', { code }));
