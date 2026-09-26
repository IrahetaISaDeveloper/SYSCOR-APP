import apiClient from '@syscor/shared/src/services/apiClient';

// Teléfonos del cliente (/users/customers/:id/phones). Hasta 3, cada uno con
// { number, type, isDefault }. El PUT reemplaza la lista completa y responde
// la lista ya normalizada (con exactamente un predeterminado).
export const MAX_PHONES = 3;

export const PHONE_TYPES = [
  { value: 'mobile', label: 'Celular', icon: 'phone-portrait-outline' },
  { value: 'landline', label: 'Fijo', icon: 'call-outline' },
  { value: 'work', label: 'Trabajo', icon: 'briefcase-outline' },
  { value: 'other', label: 'Otro', icon: 'ellipsis-horizontal' },
];

export const phoneTypeOf = (value) => PHONE_TYPES.find((t) => t.value === value) || PHONE_TYPES[0];

const base = (customerId) => `/users/customers/${customerId}/phones`;

const call = async (fn) => {
  try {
    const { data } = await fn();
    return { success: true, phones: data?.phones || [] };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status,
      error: error.response?.data?.message || 'No se pudo conectar. Inténtalo de nuevo.',
    };
  }
};

export const getPhones = (customerId) => call(() => apiClient.get(base(customerId)));

export const savePhones = (customerId, phones) =>
  call(() =>
    apiClient.put(base(customerId), {
      phones: phones.map(({ number, type, isDefault }) => ({ number, type, isDefault: !!isDefault })),
    }),
  );
