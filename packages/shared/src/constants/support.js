// Canales de soporte de la taquería. Son los mismos que muestra el sistema
// web (ver LoginHelpChat del frontend): el teléfono sirve para llamar y para
// WhatsApp.
export const SUPPORT_EMAIL = 'taqueriaelcorralsyscor@gmail.com';

// Como se escribe a la vista del cliente.
export const SUPPORT_PHONE = '7168-6876';

// Formato internacional, sin signos: es el que aceptan `tel:` y `wa.me`.
export const SUPPORT_PHONE_INTL = '50371686876';

export const SUPPORT_TEL_URL = `tel:+${SUPPORT_PHONE_INTL}`;
export const SUPPORT_WHATSAPP_URL = `https://wa.me/${SUPPORT_PHONE_INTL}`;
export const SUPPORT_EMAIL_URL = `mailto:${SUPPORT_EMAIL}`;

export default {
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  SUPPORT_PHONE_INTL,
  SUPPORT_TEL_URL,
  SUPPORT_WHATSAPP_URL,
  SUPPORT_EMAIL_URL,
};
