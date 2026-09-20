// Configuración de entorno compartida por la app de clientes y la de empleados.
//
// Se puede sobrescribir sin tocar código exportando EXPO_PUBLIC_API_URL
// (por ejemplo en un .env.local) para apuntar a un backend local:
//   EXPO_PUBLIC_API_URL=http://10.0.2.2:4000/api   → emulador de Android
//   EXPO_PUBLIC_API_URL=http://localhost:4000/api  → iOS / web
const DEFAULT_API_URL = 'https://syscor-mll9.onrender.com/api';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;

// Timeout por defecto de las peticiones, en milisegundos.
export const API_TIMEOUT = 15000;
