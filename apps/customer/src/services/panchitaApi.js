import apiClient from '@syscor/shared/src/services/apiClient';

// Chef Panchita (/panchita). La conversación se guarda en el servidor: la app
// solo manda el mensaje nuevo y recibe la respuesta con sus "tarjetas"
// (estimación, reclamo, lo de siempre, mensaje al repartidor).

const call = async (fn) => {
  try {
    const { data } = await fn();
    return { success: true, data };
  } catch (error) {
    const status = error.response?.status;
    return {
      success: false,
      status,
      // 404: el backend al que apunta la app todavía no tiene a Panchita
      // (p. ej. Render sin desplegar). Se dice tal cual para no confundirlo
      // con un problema de conexión.
      error:
        status === 404
          ? 'Panchita todavía no está disponible en este servidor.'
          : error.response?.data?.message || 'No se pudo conectar con Panchita. Inténtalo de nuevo.',
    };
  }
};

export const getConversation = () => call(() => apiClient.get('/panchita/chat'));

// Gemini puede tardar: se le da más margen que al resto de la API.
export const sendMessage = (message) =>
  call(() => apiClient.post('/panchita/chat', { message }, { timeout: 45000 }));

export const resetConversation = () => call(() => apiClient.delete('/panchita/chat'));

// Pedidos en curso con su estimación, avisos, saldo y reclamos.
export const getOverview = () => call(() => apiClient.get('/panchita/overview'));

export const getUsualOrder = () => call(() => apiClient.get('/panchita/usual'));

export const sendDriverMessage = (orderId, text, preset = false) =>
  call(() => apiClient.post(`/panchita/orders/${orderId}/driver-messages`, { text, preset }));
