// Reglas de las tarjetas de crédito y débito: marca por su prefijo (BIN),
// cuántos dígitos tiene cada una, cómo se agrupan al escribirlas y el largo
// del CVV. Las usan el formulario de pago y el de guardar tarjeta, y el
// escáner de tarjetas (parseCardText).
//
// Antes el número aceptaba hasta 19 dígitos para cualquier marca y se
// agrupaba siempre de 4 en 4: una Visa dejaba seguir escribiendo después de
// sus 16 dígitos y una Amex (15) parecía incompleta. Ahora el campo se
// detiene en el largo de la marca y el error dice qué falta.
const BRANDS = [
  // Las Visa de 13 y 19 dígitos casi no existen en el país: aceptarlas
  // dejaba seguir escribiendo después de los 16 de una Visa normal.
  { brand: 'Visa', test: /^4/, lengths: [16], groups: [4, 4, 4, 4], cvvLength: 3 },
  { brand: 'Mastercard', test: /^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/, lengths: [16], groups: [4, 4, 4, 4], cvvLength: 3 },
  { brand: 'American Express', test: /^3[47]/, lengths: [15], groups: [4, 6, 5], cvvLength: 4 },
  { brand: 'Diners Club', test: /^3(0[0-5]|[689])/, lengths: [14, 16], groups: [4, 6, 4, 2], cvvLength: 3 },
  { brand: 'Discover', test: /^6(011|4[4-9]|5)/, lengths: [16], groups: [4, 4, 4, 4], cvvLength: 3 },
];

const UNKNOWN = { brand: null, lengths: [16], groups: [4, 4, 4, 4], cvvLength: 3 };

// Deja solo dígitos (bloquea letras/símbolos aunque el teclado los permita)
export const sanitizeDigits = (text) => (text || '').replace(/\D/g, '');

const specOf = (digits) => BRANDS.find((b) => b.test.test(digits)) || UNKNOWN;

// Marca de la tarjeta y sus reglas. `maxLength` es el largo mayor que acepta.
export const detectCardBrand = (cardNumber) => {
  const digits = sanitizeDigits(cardNumber);
  const spec = specOf(digits);
  return {
    brand: spec.brand,
    icon: 'card-outline',
    cvvLength: spec.cvvLength,
    lengths: spec.lengths,
    maxLength: Math.max(...spec.lengths),
  };
};

// Algoritmo de Luhn: valida que el número de tarjeta sea matemáticamente
// consistente (detecta errores de digitación, no si la tarjeta existe).
export const isValidLuhn = (cardNumber) => {
  const digits = sanitizeDigits(cardNumber);
  if (!digits) return false;

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

// Formatea el número según la marca ("4111 1111 1111 1111", Amex
// "3782 822463 10005") y no deja escribir más dígitos de los que tiene.
export const formatCardNumber = (text) => {
  const spec = specOf(sanitizeDigits(text));
  const digits = sanitizeDigits(text).slice(0, Math.max(...spec.lengths));
  const parts = [];
  let index = 0;
  for (const size of spec.groups) {
    if (index >= digits.length) break;
    parts.push(digits.slice(index, index + size));
    index += size;
  }
  return parts.join(' ');
};

// Largo que se le pone al campo (dígitos + espacios) para la marca escrita.
export const cardNumberInputLength = (text) => {
  const spec = specOf(sanitizeDigits(text));
  const max = Math.max(...spec.lengths);
  let count = 0;
  let groups = 0;
  for (const size of spec.groups) {
    if (count >= max) break;
    count += size;
    groups += 1;
  }
  return max + groups - 1;
};

// Qué le pasa al número, en palabras del cliente. null si está bien.
export const cardNumberProblem = (cardNumber) => {
  const digits = sanitizeDigits(cardNumber);
  const spec = specOf(digits);
  if (digits.length === 0) return 'Escribe el número de tu tarjeta.';
  if (!spec.brand) return 'No reconocemos esa tarjeta. Aceptamos Visa, Mastercard, American Express, Diners Club y Discover (crédito o débito).';
  if (!spec.lengths.includes(digits.length)) {
    // Diners tiene dos largos: se compara con el más cercano.
    const expected = spec.lengths.reduce((best, n) => (Math.abs(n - digits.length) < Math.abs(best - digits.length) ? n : best));
    const missing = expected - digits.length;
    return missing > 0
      ? `Las tarjetas ${spec.brand} tienen ${expected} dígitos: te ${missing === 1 ? 'falta 1' : `faltan ${missing}`}.`
      : `Las tarjetas ${spec.brand} tienen ${expected} dígitos: sobran ${-missing}.`;
  }
  if (!isValidLuhn(digits)) return 'El número no es correcto: revisa que no se haya cambiado algún dígito.';
  return null;
};

// Formatea el vencimiento como "MM/AA". Si el primer dígito del mes no puede
// ser decena (2 a 9), se completa con cero: "5" → "05". Un mes imposible
// (00, 13…) no se deja escribir. La "/" aparece al escribir el año (si se
// pusiera sola al completar el mes, no se podría borrar).
export const formatExpiry = (text) => {
  let digits = sanitizeDigits(text).slice(0, 4);
  if (digits.length >= 1 && Number(digits[0]) > 1) digits = `0${digits}`.slice(0, 4);
  if (digits.length >= 2 && (Number(digits.slice(0, 2)) === 0 || Number(digits.slice(0, 2)) > 12)) {
    digits = digits.slice(0, 1);
  }
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

// Qué le pasa al vencimiento. null si está bien.
export const expiryProblem = (expiry, now = new Date()) => {
  const [mm, yy] = String(expiry || '').split('/');
  if (!/^\d{2}$/.test(mm || '') || !/^\d{2}$/.test(yy || '')) return 'Escribe el vencimiento como MM/AA (por ejemplo 08/29).';
  const month = Number(mm);
  const year = Number(yy);
  if (month < 1 || month > 12) return 'El mes del vencimiento no es válido.';
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  if (year < currentYear || (year === currentYear && month < currentMonth)) return 'La tarjeta está vencida.';
  if (year > currentYear + 20) return 'Revisa el año del vencimiento.';
  return null;
};

// Nombre como viene en la tarjeta: solo letras, espacios y apóstrofos.
export const sanitizeCardHolder = (text) => (text || '').replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .-]/g, '').replace(/\s{2,}/g, ' ');

// ── Escáner ──────────────────────────────────────────────────────────────

// Palabras impresas en una tarjeta que no son el nombre del titular.
const NOT_A_NAME = /\b(VISA|MASTER|MASTERCARD|DEBIT|DEBITO|DÉBITO|CREDIT|CREDITO|CRÉDITO|CLASSIC|GOLD|PLATINUM|SIGNATURE|INFINITE|BLACK|BUSINESS|BANCO|BANK|AGRICOLA|CUSCATLAN|DAVIVIENDA|PROMERICA|BAC|CREDOMATIC|HIPOTECARIO|INDUSTRIAL|AZUL|ATLANTIDA|VALID|THRU|VALIDA|HASTA|VENCE|EXPIRES|EXP|MONTH|YEAR|MES|AÑO|MEMBER|SINCE|ELECTRON|INTERNATIONAL|INTERNACIONAL|CONTACTLESS|AMERICAN|EXPRESS|DINERS|CLUB|DISCOVER|CARD|TARJETA)\b/;

// Letras que el OCR confunde con dígitos en el relieve de la tarjeta.
const OCR_DIGIT_FIXES = { O: '0', o: '0', Q: '0', D: '0', I: '1', l: '1', i: '1', '|': '1', S: '5', s: '5', B: '8', Z: '2', z: '2', G: '6', b: '6', g: '9' };

// Corrige esas letras solo en "palabras" que son casi todo números (un
// bloque "1lll" o "O8/29"), para no tocar el nombre ni el banco.
const fixOcrDigits = (line) =>
  line
    .split(/(\s+)/)
    .map((token) => {
      // Solo si trae al menos un dígito y todo lo demás son letras
      // confundibles o separadores de fecha.
      const onlyDigitLike = [...token].every((ch) => /[\d/.-]/.test(ch) || OCR_DIGIT_FIXES[ch]);
      if (!/\d/.test(token) || !onlyDigitLike) return token;
      return [...token].map((ch) => OCR_DIGIT_FIXES[ch] || ch).join('');
    })
    .join('');

// Un número que sirve: largo de su marca y pasa Luhn.
const acceptCardNumber = (digits) => {
  const spec = specOf(digits);
  return spec.brand && spec.lengths.includes(digits.length) && isValidLuhn(digits);
};

// Saca número, vencimiento y nombre del texto que leyó el OCR en el frente
// de la tarjeta. Devuelve solo lo que encontró con confianza.
export const parseCardText = (lines, now = new Date()) => {
  const fixedLines = (lines || []).map((line) => fixOcrDigits(String(line || '')));
  const text = fixedLines.join('\n');
  const result = {};

  // Número: una secuencia de 13 a 19 dígitos (con o sin espacios) que pase
  // Luhn y cuyo largo corresponda a su marca.
  const candidates = text.match(/(?:\d[ -]?){12,18}\d/g) || [];
  const found = candidates.map(sanitizeDigits).find(acceptCardNumber);

  // ML Kit suele devolver el número partido: cada bloque de 4 dígitos (o dos
  // mitades) en su propia línea. Se juntan bloques seguidos hasta formar un
  // número válido.
  let joined = null;
  if (!found) {
    const groups = fixedLines
      .flatMap((line) => line.split(/[\s-]+/))
      .map((token) => (/^\d{2,8}$/.test(token) ? token : null));
    for (let start = 0; start < groups.length && !joined; start += 1) {
      let digits = '';
      for (let end = start; end < groups.length && groups[end] && digits.length < 19; end += 1) {
        digits += groups[end];
        if (digits.length >= 13 && acceptCardNumber(digits)) {
          joined = digits;
          break;
        }
      }
    }
  }
  if (found || joined) result.cardNumber = formatCardNumber(found || joined);

  // Vencimiento: la fecha MM/AA más lejana que no esté vencida (algunas
  // tarjetas imprimen también "miembro desde").
  const dates = [...text.matchAll(/\b(0[1-9]|1[0-2])\s?[/\-.]\s?(\d{4}|\d{2})\b/g)]
    .map((m) => ({ mm: m[1], yy: m[2].slice(-2) }))
    .filter(({ mm, yy }) => !expiryProblem(`${mm}/${yy}`, now))
    .sort((a, b) => Number(b.yy) - Number(a.yy) || Number(b.mm) - Number(a.mm));
  if (dates[0]) result.expiry = `${dates[0].mm}/${dates[0].yy}`;

  // Nombre: una línea de 2 a 5 palabras solo con letras, en mayúsculas como
  // se imprime, que no sea el banco, la marca ni un rótulo.
  const name = (lines || [])
    .map((line) => line.trim())
    .find((line) => {
      const upper = line.toUpperCase();
      const words = upper.split(/\s+/);
      return (
        line === upper &&
        /^[A-ZÁÉÍÓÚÜÑ' .-]+$/.test(upper) &&
        words.length >= 2 &&
        words.length <= 5 &&
        upper.replace(/[^A-Z]/g, '').length >= 5 &&
        !NOT_A_NAME.test(upper)
      );
    });
  if (name) result.cardHolder = name.replace(/\s{2,}/g, ' ');

  return result;
};
