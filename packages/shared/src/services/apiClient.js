import axios from 'axios';
import { Platform } from 'react-native';
import { API_BASE_URL, API_TIMEOUT } from '../config/env';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: API_TIMEOUT,
});

// Android guarda en caché las respuestas GET (OkHttp, con el ETag que manda
// Express) y en ocasiones la app seguía leyendo la copia vieja: el plano de
// mesas del mesero mostraba una mesa libre que en el servidor ya estaba
// ocupada. Todo lo que se pide aquí son datos vivos, así que nunca se usa
// la caché.
//
// Solo en el teléfono: en un navegador (Expo web) estas cabeceras pasarían
// por CORS y el backend solo admite Content-Type y Authorization.
apiClient.interceptors.request.use((request) => {
  if (Platform.OS !== 'web' && (request.method || 'get').toLowerCase() === 'get') {
    request.headers = request.headers || {};
    request.headers['Cache-Control'] = 'no-cache, no-store';
    request.headers.Pragma = 'no-cache';
  }
  return request;
});

export default apiClient;
