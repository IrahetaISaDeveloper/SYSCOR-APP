import apiClient from '@syscor/shared/src/services/apiClient';

// Libreta de direcciones del cliente (/users/customers/:id/addresses).
// Todas las rutas responden la libreta completa: { addresses, defaultAddress },
// donde cada dirección trae su `index`, que es con lo que se edita o borra.
const base = (customerId) => `/users/customers/${customerId}/addresses`;

const call = async (fn) => {
  try {
    const { data } = await fn();
    return { success: true, addresses: data?.addresses || [] };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'No se pudo conectar. Inténtalo de nuevo.',
    };
  }
};

export const getAddresses = (customerId) => call(() => apiClient.get(base(customerId)));

export const addAddress = (customerId, { tag, details, isDefault }) =>
  call(() => apiClient.post(base(customerId), { tag, details, isDefault }));

export const updateAddress = (customerId, index, { tag, details, isDefault }) =>
  call(() => apiClient.put(`${base(customerId)}/${index}`, { tag, details, isDefault }));

export const setDefaultAddress = (customerId, index) =>
  call(() => apiClient.patch(`${base(customerId)}/${index}/default`));

export const deleteAddress = (customerId, index) =>
  call(() => apiClient.delete(`${base(customerId)}/${index}`));
