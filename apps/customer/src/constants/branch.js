import { SUPPORT_PHONE, SUPPORT_TEL_URL } from '@syscor/shared/src/constants/support';

// Datos del local. Las coordenadas y el ID de lugar salen de la ficha de
// Google Maps (https://maps.app.goo.gl/CLcGN3UtA6qMYEYf9); la dirección y el
// horario, de la página de Facebook del restaurante.
export const BRANCH = {
  name: 'Taquería El Corral',
  shortName: 'El Corral · Apopa',
  address: 'Km 14½, Carretera Troncal del Norte, Apopa',
  latitude: 13.8068232,
  longitude: -89.1705956,
  // ID de la ficha en Google Maps: hace que "Cómo llegar" abra el negocio
  // y no solo un punto en el mapa.
  googlePlaceId: 'ChIJIdIDMfc7Y48Rgd0tDnif8Xg',
  googleMapsUrl: 'https://maps.app.goo.gl/CLcGN3UtA6qMYEYf9',
  phone: SUPPORT_PHONE,
  telUrl: SUPPORT_TEL_URL,
  // Todos los días, hora de El Salvador (UTC-6, sin horario de verano).
  opensAt: 10 * 60,
  closesAt: 21 * 60,
  utcOffsetMinutes: -6 * 60,
};

// Abierto o cerrado según la hora de El Salvador, sin importar la zona
// horaria del teléfono.
export const getBranchSchedule = (now = new Date()) => {
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const local = (utcMinutes + BRANCH.utcOffsetMinutes + 24 * 60) % (24 * 60);
  const isOpen = local >= BRANCH.opensAt && local < BRANCH.closesAt;
  return {
    isOpen,
    label: isOpen ? `CIERRA ${formatHour(BRANCH.closesAt)}` : `ABRE ${formatHour(BRANCH.opensAt)}`,
  };
};

const formatHour = (minutes) => {
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${h24 < 12 ? 'AM' : 'PM'}`;
};

export default BRANCH;
