import * as Location from 'expo-location';

const isCoord = (value) => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));

// { latitude, longitude } con números válidos, o null.
export const toPoint = (value) =>
  value && isCoord(value.latitude) && isCoord(value.longitude)
    ? { latitude: Number(value.latitude), longitude: Number(value.longitude) }
    : null;

// Texto legible de un resultado de reverseGeocodeAsync, sin partes repetidas.
export const describePlace = (place) =>
  place
    ? [place.name, place.street, place.district, place.city, place.region]
        .filter(Boolean)
        .filter((part, i, arr) => arr.indexOf(part) === i)
        .join(', ')
    : '';

// Dirección aproximada de un punto. Usa el geocodificador del teléfono (no
// necesita clave). Devuelve { text, place } o null si no se encontró nada.
export const reverseGeocode = async (point) => {
  const [place] = await Location.reverseGeocodeAsync(point);
  const text = describePlace(place);
  return text ? { text, place } : null;
};
