import { BRANCH } from '../constants/branch';

// Días y horas que se pueden reservar para "Comer en el local". Son las
// mismas reglas que valida el backend (utils/tables/reservationUtils.js):
// de 10:00 a. m. a 8:00 p. m. (una hora antes de cerrar), cada 30 minutos,
// con al menos 30 minutos de anticipación y hasta 3 días adelante. Todo en
// hora de El Salvador, sin importar la zona del teléfono.
export const SLOT_STEP = 30;
export const LAST_SLOT = BRANCH.closesAt - 60;
export const MAX_DAYS_AHEAD = 3;
const MIN_LEAD_MINUTES = 30;

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;
const OFFSET_MS = BRANCH.utcOffsetMinutes * MINUTE;

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// Medianoche (en UTC) del día local de El Salvador que contiene `date`.
const localMidnight = (date) => Math.floor((date.getTime() + OFFSET_MS) / DAY) * DAY - OFFSET_MS;

// Fecha real (Date) de un día + minuto del día en hora de El Salvador.
export const slotDate = (dayStart, minutes) => new Date(dayStart + minutes * MINUTE);

export const formatSlotTime = (minutes) => {
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${h24 < 12 ? 'a. m.' : 'p. m.'}`;
};

// Minutos del día (hora de El Salvador) de una fecha.
const localMinutes = (date) => Math.round((date.getTime() - localMidnight(date)) / MINUTE);

// "Hoy · 7:30 p. m.", "Mañana · 1:00 p. m." o "Vie 3 oct · 12:00 p. m.".
export const formatReservation = (value, now = new Date()) => {
  const date = new Date(value);
  const diff = Math.round((localMidnight(date) - localMidnight(now)) / DAY);
  const shifted = new Date(date.getTime() + OFFSET_MS);
  const day =
    diff === 0
      ? 'Hoy'
      : diff === 1
        ? 'Mañana'
        : `${WEEKDAYS[shifted.getUTCDay()]} ${shifted.getUTCDate()} ${MONTHS[shifted.getUTCMonth()]}`;
  return `${day} · ${formatSlotTime(localMinutes(date))}`;
};

// Solo la hora: "7:30 p. m.".
export const formatClock = (value) => formatSlotTime(localMinutes(new Date(value)));

// Días que se pueden elegir, cada uno con sus horas. Un día sin horas
// libres (hoy ya tarde) no aparece.
export const getReservationDays = (now = new Date()) => {
  const today = localMidnight(now);
  const earliest = now.getTime() + MIN_LEAD_MINUTES * MINUTE;
  const days = [];
  for (let offset = 0; offset <= MAX_DAYS_AHEAD; offset += 1) {
    const start = today + offset * DAY;
    const slots = [];
    for (let minutes = BRANCH.opensAt; minutes <= LAST_SLOT; minutes += SLOT_STEP) {
      if (slotDate(start, minutes).getTime() >= earliest) slots.push(minutes);
    }
    if (slots.length === 0) continue;
    const shifted = new Date(start + OFFSET_MS);
    days.push({
      key: String(start),
      start,
      label: offset === 0 ? 'Hoy' : offset === 1 ? 'Mañana' : WEEKDAYS[shifted.getUTCDay()],
      caption: `${shifted.getUTCDate()} ${MONTHS[shifted.getUTCMonth()]}`,
      slots,
    });
  }
  return days;
};
