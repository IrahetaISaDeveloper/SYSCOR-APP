import React, { useRef, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { File } from 'expo-file-system';
import { extractTextFromImage, isSupported as ocrSupported } from 'expo-text-extractor';
import { parseCardText } from '../utils/cardUtils';

// Escanear el FRENTE de la tarjeta para no teclear número, vencimiento y
// nombre. Todo pasa en el teléfono: el texto lo lee ML Kit (Android) o
// Vision (iOS) sin mandar la imagen a ningún servidor, y la foto se borra
// apenas se lee. El CVV (atrás) nunca se escanea: se escribe a mano.
//
// `onResult({ cardNumber?, expiry?, cardHolder? })` recibe solo lo que se
// leyó con confianza; el cliente revisa y completa el resto.
export default function CardScanner({ visible, onClose, onResult, colors: c }) {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [reading, setReading] = useState(false);
  const [hint, setHint] = useState(null);

  const close = () => {
    setHint(null);
    setReading(false);
    onClose();
  };

  const capture = async () => {
    if (reading || !cameraRef.current) return;
    setReading(true);
    setHint(null);
    let uri = null;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      uri = photo?.uri;
      const lines = uri ? await readText(uri) : [];
      const data = parseCardText(lines);
      if (!data.cardNumber) {
        // Se leyó texto pero no un número válido, o no se leyó nada: son
        // consejos distintos.
        setHint(
          lines.length === 0
            ? 'No se ve texto en la foto. Acerca la tarjeta al marco, con buena luz, y vuelve a intentar.'
            : 'No pude leer el número completo. Inclina un poco la tarjeta para que se marquen los números, sin reflejos, y vuelve a intentar.',
        );
        return;
      }
      onResult(data);
      close();
    } catch (error) {
      console.warn('CardScanner:', error?.message);
      setHint(
        isModelDownloading(error)
          ? 'Estamos preparando el lector de tarjetas en tu teléfono (necesita internet la primera vez). Intenta de nuevo en unos segundos.'
          : 'No se pudo leer la tarjeta. Intenta de nuevo o escribe los datos a mano.',
      );
    } finally {
      // La foto de la tarjeta no se queda en el teléfono.
      if (uri) {
        try {
          new File(uri).delete();
        } catch {
          // Ya no existía: nada que borrar.
        }
      }
      setReading(false);
    }
  };

  const renderBody = () => {
    if (!ocrSupported) {
      return (
        <Centered>
          <Text style={{ color: '#FFFFFF', fontSize: 15, textAlign: 'center' }}>
            Este teléfono no puede leer tarjetas. Escribe los datos a mano.
          </Text>
        </Centered>
      );
    }
    if (!permission) return <Centered><ActivityIndicator color="#FFFFFF" /></Centered>;
    if (!permission.granted) {
      return (
        <Centered>
          <Icon name="camera-outline" size={42} color="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', fontSize: 15, textAlign: 'center', marginVertical: 14 }}>
            Necesitamos la cámara para leer tu tarjeta.
          </Text>
          <TouchableOpacity
            onPress={permission.canAskAgain ? requestPermission : () => Linking.openSettings()}
            style={{ paddingHorizontal: 22, paddingVertical: 12, borderRadius: 12, backgroundColor: c.primary }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
              {permission.canAskAgain ? 'Permitir la cámara' : 'Abrir ajustes'}
            </Text>
          </TouchableOpacity>
        </Centered>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
        {/* Marco con la proporción de una tarjeta */}
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: '86%', aspectRatio: 1.586, borderRadius: 16, borderWidth: 3, borderColor: '#FFFFFF' }} />
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginTop: 16, textAlign: 'center', paddingHorizontal: 32 }}>
            Pon el frente de la tarjeta dentro del marco
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <View style={{ flex: 1, backgroundColor: '#000000' }}>
        <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={close} hitSlop={10} accessibilityRole="button" accessibilityLabel="Cerrar">
            <Icon name="close" size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '700' }}>Escanear tarjeta</Text>
        </View>

        {renderBody()}

        <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: Math.max(insets.bottom, 16) + 8, gap: 12 }}>
          {hint ? <Text style={{ color: '#FFD18A', fontSize: 13, textAlign: 'center' }}>{hint}</Text> : null}
          <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, textAlign: 'center' }}>
            La tarjeta se lee en tu teléfono y la foto se borra. Nunca escaneamos el CVV.
          </Text>
          {ocrSupported && permission?.granted ? (
            <TouchableOpacity
              onPress={capture}
              disabled={reading}
              style={{
                height: 52,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 8,
                backgroundColor: c.primary,
                opacity: reading ? 0.7 : 1,
              }}
              accessibilityRole="button"
            >
              {reading ? <ActivityIndicator color="#FFFFFF" /> : <Icon name="scan" size={18} color="#FFFFFF" />}
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>{reading ? 'Leyendo…' : 'Leer tarjeta'}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

// En Android el modelo de ML Kit lo descarga Play Services; mientras baja,
// la lectura falla con "Waiting for the text recognition model...".
const isModelDownloading = (error) => /download|waiting for the/i.test(String(error?.message || ''));

// Lee el texto de la foto. Si el modelo aún se está descargando, espera un
// poco y reintenta un par de veces antes de rendirse.
const readText = async (uri, attempts = 3) => {
  for (let i = 1; ; i += 1) {
    try {
      return await extractTextFromImage(uri);
    } catch (error) {
      if (i >= attempts || !isModelDownloading(error)) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2500));
    }
  }
};

const Centered = ({ children }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 }}>{children}</View>
);
