// Detecta la marca de una tarjeta por su prefijo (BIN) y define
// cuántos dígitos de CVV le corresponden a cada una.
export const detectCardBrand = (cardNumber) => {
  const digits = (cardNumber || '').replace(/\s/g, '');

  if (/^4/.test(digits)) return { brand: 'Visa', icon: '💳', cvvLength: 3 };
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(digits)) {
    return { brand: 'Mastercard', icon: '💳', cvvLength: 3 };
  }
  if (/^3[47]/.test(digits)) return { brand: 'American Express', icon: '💳', cvvLength: 4 };
  if (/^6(011|5)/.test(digits)) return { brand: 'Discover', icon: '💳', cvvLength: 3 };
  if (/^3(0[0-5]|[68])/.test(digits)) return { brand: 'Diners Club', icon: '💳', cvvLength: 3 };

  return { brand: null, icon: '💳', cvvLength: 3 };
};

// Algoritmo de Luhn: valida que el número de tarjeta sea matemáticamente
// consistente (detecta errores de digitación, no si la tarjeta existe).
export const isValidLuhn = (cardNumber) => {
  const digits = (cardNumber || '').replace(/\s/g, '');
  if (!/^\d+$/.test(digits)) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

// Deja solo dígitos (bloquea letras/símbolos aunque el teclado los permita)
export const sanitizeDigits = (text) => (text || '').replace(/\D/g, '');

// Formatea el número de tarjeta en grupos de 4: "1234 5678 9012 3456"
export const formatCardNumber = (text) => {
  const digits = sanitizeDigits(text).slice(0, 19);
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

// Formatea la fecha de vencimiento como "MM/YY" insertando el "/" solo
export const formatExpiry = (text) => {
  const digits = sanitizeDigits(text).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};
