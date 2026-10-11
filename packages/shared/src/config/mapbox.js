// Token público de Mapbox (pk.*), compartido por la app de clientes y la de
// empleados. Se define como EXPO_PUBLIC_MAPBOX_TOKEN en el .env.local de cada
// app y en el ambiente de EAS de cada proyecto para los builds.
export const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '';

// Montar el MapView nativo sin token válido cierra la app en Android.
export const hasMapboxToken = () => MAPBOX_TOKEN.startsWith('pk.');

// Imagen fija del mapa con un pin (Static Images API). Sirve de vista previa
// sin montar un mapa nativo.
export const getStaticMapUrl = ({ latitude, longitude }, { width = 600, height = 240, dark = false, color = 'E23D28' } = {}) => {
  const style = dark ? 'dark-v11' : 'streets-v12';
  const lng = longitude.toFixed(6);
  const lat = latitude.toFixed(6);
  return (
    `https://api.mapbox.com/styles/v1/mapbox/${style}/static/` +
    `pin-l+${color}(${lng},${lat})/${lng},${lat},16,0/${width}x${height}@2x` +
    `?access_token=${MAPBOX_TOKEN}&attribution=false&logo=false`
  );
};
