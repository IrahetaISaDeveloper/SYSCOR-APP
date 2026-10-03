const { withAndroidManifest, AndroidConfig } = require('expo/config-plugins');

// El escáner de tarjetas usa expo-text-extractor, que en Android trae la
// versión de ML Kit que NO incluye el modelo de lectura: Google Play Services
// lo descarga la primera vez que se usa, y mientras tanto cada lectura falla.
//
// Con este meta-data Play Services descarga los modelos al instalar la app.
// expo-camera ya declara el mismo meta-data con "barcode_ui" (el lector de
// QR de la mesa), así que se piden los dos y se reemplaza el suyo al unir los
// manifiestos; si no, el build falla por el conflicto.
// https://developers.google.com/ml-kit/vision/text-recognition/v2/android
const META_NAME = 'com.google.mlkit.vision.DEPENDENCIES';
const MODELS = 'barcode_ui,ocr';

const withMlKitOcr = (config) =>
  withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults;
    manifest.manifest.$['xmlns:tools'] = manifest.manifest.$['xmlns:tools'] || 'http://schemas.android.com/tools';

    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
    application['meta-data'] = (application['meta-data'] || []).filter(
      (item) => item.$['android:name'] !== META_NAME,
    );
    application['meta-data'].push({
      $: { 'android:name': META_NAME, 'android:value': MODELS, 'tools:replace': 'android:value' },
    });
    return cfg;
  });

module.exports = withMlKitOcr;
