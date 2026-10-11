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

// `latitude`/`longitude`: el punto marcado en el mapa, o null si no hay.
// Al editar, mandar null borra el punto guardado.
const toBody = ({ tag, details, isDefault, latitude = null, longitude = null }) => ({
  tag,
  details,
  isDefault,
  latitude,
  longitude,
});

export const addAddress = (customerId, address) =>
  call(() => apiClient.post(base(customerId), toBody(address)));

export const updateAddress = (customerId, index, address) =>
  call(() => apiClient.put(`${base(customerId)}/${index}`, toBody(address)));

export const setDefaultAddress = (customerId, index) =>
  call(() => apiClient.patch(`${base(customerId)}/${index}/default`));

export const deleteAddress = (customerId, index) =>
  call(() => apiClient.delete(`${base(customerId)}/${index}`));
