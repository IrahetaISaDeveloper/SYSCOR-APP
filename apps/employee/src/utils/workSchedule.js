// El panel web guarda el horario del empleado como horas en formato 24h
// (workInfo.scheduleStart / scheduleEnd) y no llena `shift` ni `schedule`,
// que son textos libres. Aquí se arma lo que se muestra a partir de ambos.

const toMinutes = (value) => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value || ''));
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
};

const clock12 = (value) => {
  const minutes = toMinutes(value);
  if (minutes === null) return null;
  const hours = Math.floor(minutes / 60);
  const suffix = hours < 12 ? 'AM' : 'PM';
  return `${hours % 12 || 12}:${String(minutes % 60).padStart(2, '0')} ${suffix}`;
};

// "8:00 AM - 4:00 PM"
export const getScheduleText = (workInfo = {}) => {
  const start = clock12(workInfo.scheduleStart);
  const end = clock12(workInfo.scheduleEnd);
  if (start && end) return `${start} - ${end}`;
  return workInfo.schedule || null;
};

// "Mañana", "Tarde" o "Noche" según a qué hora entra.
export const getShiftText = (workInfo = {}) => {
  if (workInfo.shift) return workInfo.shift;
  const start = toMinutes(workInfo.scheduleStart);
  if (start === null) return null;
  if (start < 12 * 60) return 'Mañana';
  if (start < 18 * 60) return 'Tarde';
  return 'Noche';
};
