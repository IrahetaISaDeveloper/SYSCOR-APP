// Token público de Mapbox (pk.*). Se define en apps/employee/.env.local como
// EXPO_PUBLIC_MAPBOX_TOKEN; ver .env.example.
export const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || "";

export const hasMapboxToken = () => MAPBOX_TOKEN.startsWith("pk.");

// Cada cuánto se vuelve a pedir la ruta mientras el repartidor avanza. Mantiene
// el consumo dentro del free tier de la Directions API.
export const ROUTE_REFRESH_MS = 25000;
