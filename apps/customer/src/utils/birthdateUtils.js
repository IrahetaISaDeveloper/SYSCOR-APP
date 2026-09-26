// Fecha de nacimiento del cliente. En pantalla se escribe DD/MM/AAAA y al
// backend se manda AAAA-MM-DD.
//
// Se trabaja con el texto de la fecha y no con `new Date()`: el backend la
// guarda a medianoche UTC y, convertida a la hora local de El Salvador
// (UTC-6), se mostraría un día antes.

const MIN_AGE = 14;

// "1998-05-20T00:00:00.000Z" -> "20/05/1998"
export const isoToDisplay = (iso) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''));
  return match ? `${match[3]}/${match[2]}/${match[1]}` : '';
};

// Inserta las barras mientras se escribe: "20051998" -> "20/05/1998".
export const formatBirthdateInput = (text) => {
  const digits = String(text || '').replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

// Valida lo escrito y lo lleva a AAAA-MM-DD. Vacío es válido: la fecha es opcional.
export const parseBirthdate = (display) => {
  const text = String(display || '').trim();
  if (!text) return { valid: true, iso: '' };

  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  if (!match) return { valid: false, message: 'Escribe la fecha completa: DD/MM/AAAA.' };

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  const isReal =
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  if (!isReal) return { valid: false, message: 'Esa fecha no existe.' };

  const age = getAge(year, month, day);
  if (age < MIN_AGE) return { valid: false, message: `Debes tener al menos ${MIN_AGE} años.` };
  if (age > 120) return { valid: false, message: 'Revisa el año de nacimiento.' };

  return { valid: true, iso: `${match[3]}-${match[2]}-${match[1]}` };
};

export const getAge = (year, month, day) => {
  const today = new Date();
  let age = today.getFullYear() - year;
  const hadBirthday =
    today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day);
  if (!hadBirthday) age -= 1;
  return age;
};

// Edad a partir de la fecha que manda el backend, o null si no hay.
export const ageFromIso = (iso) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''));
  return match ? getAge(Number(match[1]), Number(match[2]), Number(match[3])) : null;
};
