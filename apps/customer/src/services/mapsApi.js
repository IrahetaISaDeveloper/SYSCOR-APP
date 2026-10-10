import axios from 'axios';
import { Platform } from 'react-native';
import { BRANCH } from '../constants/branch';

// Integración con Google Maps.
//
// - "Cómo llegar" usa las Maps URLs de Google: no necesitan clave y abren la
//   app de Google Maps (o el navegador) con la ruta ya trazada.
// - La distancia y el tiempo en carro usan la Routes API, que sí necesita una
//   clave con facturación activa en Google Cloud. Se lee de
//   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY (en el .env.local de la app). Sin clave,
//   se calcula en línea recta y se estima el tiempo.
//
// No va por `apiClient` porque no es nuestro backend.
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

const ROUTES_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';

export const hasGoogleMapsKey = GOOGLE_MAPS_API_KEY.length > 0;

// URL para abrir la ruta al local en Google Maps.
export const getDirectionsUrl = () => {
  const params = new URLSearchParams({
    api: '1',
    destination: `${BRANCH.latitude},${BRANCH.longitude}`,
    destination_place_id: BRANCH.googlePlaceId,
    travelmode: 'driving',
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
};

// URL para abrir la dirección de un cliente en Google Maps.
export const getSearchUrl = (query) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

// Distancia y tiempo en carro desde `origin` ({ latitude, longitude }) hasta
// el local. Devuelve { meters, minutes, source: 'google' | 'estimate' }.
export const getRouteToBranch = async (origin) => {
  if (hasGoogleMapsKey) {
    try {
      const { data } = await axios.post(
        ROUTES_URL,
        {
          origin: { location: { latLng: origin } },
          destination: { placeId: BRANCH.googlePlaceId },
          travelMode: 'DRIVE',
          routingPreference: 'TRAFFIC_AWARE',
          languageCode: 'es',
        },
        {
          timeout: 10000,
          headers: {
            'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
            'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration',
            // Si la clave está restringida a la app, Google pide saber cuál es.
            ...(Platform.OS === 'android' ? { 'X-Android-Package': 'com.syscor.clientes' } : {}),
            ...(Platform.OS === 'ios' ? { 'X-Ios-Bundle-Identifier': 'com.syscor.clientes' } : {}),
          },
        },
      );
      const route = data?.routes?.[0];
      if (route) {
        return {
          meters: Number(route.distanceMeters) || 0,
          // Viene como texto: "812s".
          minutes: Math.max(1, Math.round(parseInt(route.duration, 10) / 60)),
          source: 'google',
        };
      }
    } catch (error) {
      // Si Google falla (clave inválida, sin internet...) se sigue con el
      // estimado: es preferible a no mostrar nada.
      console.warn('Google Routes API:', error.response?.data?.error?.message || error.message);
    }
  }

  // Estimado: línea recta × 1.3 (las calles no van rectas) a 30 km/h.
  const straight = haversineMeters(origin, BRANCH);
  const meters = Math.round(straight * 1.3);
  return { meters, minutes: Math.max(1, Math.round(meters / 500)), source: 'estimate' };
};

const toRad = (deg) => (deg * Math.PI) / 180;

const haversineMeters = (a, b) => {
  const R = 6371000;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

// "600 m" o "4.2 km".
export const formatDistance = (meters) =>
  meters < 1000 ? `${Math.round(meters / 10) * 10} m` : `${(meters / 1000).toFixed(1)} km`;
