import apiClient from '@syscor/shared/src/services/apiClient';

// Saldo a favor del cliente (/wallet/mine): saldo actual, sus movimientos
// (entra por reclamos o cancelaciones, sale al pagar) y los reembolsos a
// tarjeta, que no pasan por el saldo pero se siguen en la misma pantalla.
export const getMyWallet = async () => {
  try {
    const { data } = await apiClient.get('/wallet/mine');
    return {
      success: true,
      balance: Number(data?.balance) || 0,
      movements: data?.movements || [],
      cardRefunds: data?.cardRefunds || [],
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status,
      error:
        error.response?.status === 404
          ? 'El servidor todavía no tiene esta función.'
          : error.response?.data?.message || 'No se pudo consultar tu saldo.',
    };
  }
};
