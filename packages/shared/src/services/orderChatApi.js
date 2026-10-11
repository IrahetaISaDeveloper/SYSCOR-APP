import apiClient from './apiClient';

// Chat de un pedido a domicilio entre el cliente y su repartidor
// (/orders/chat). Lo usan las dos apps: el backend sabe de qué lado está cada
// quien por la sesión.

const errorMessage = (error, fallback) =>
  error?.response?.data?.message || (error?.response ? fallback : 'Sin conexión. Revisa tu internet.');

export const getOrderChat = async (orderId) => {
  try {
    const { data } = await apiClient.get(`/orders/chat/${orderId}`);
    return { success: true, data };
  } catch (error) {
    return { success: false, status: error?.response?.status, error: errorMessage(error, 'No se pudo cargar el chat.') };
  }
};

export const sendOrderChatMessage = async (orderId, text, preset = false) => {
  try {
    const { data } = await apiClient.post(`/orders/chat/${orderId}`, { text, preset });
    return { success: true, data: data.message };
  } catch (error) {
    return { success: false, error: errorMessage(error, 'No se pudo enviar el mensaje.') };
  }
};

export default { getOrderChat, sendOrderChatMessage };
