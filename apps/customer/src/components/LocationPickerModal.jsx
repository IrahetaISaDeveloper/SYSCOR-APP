import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Platform,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';
import * as Location from 'expo-location';
import Mapbox, { MapView, Camera } from '@rnmapbox/maps';
import { AppAlert } from '@syscor/shared/src/components/commons/AppAlert';
import { textStyles } from '@syscor/shared/src/styles/typography';
import { useAuthMetrics } from '@syscor/shared/src/styles/authTheme';
import { getMenuColors } from '../styles/CustomerMenu';
import { BRANCH } from '../constants/branch';
import { MAPBOX_TOKEN, hasMapboxToken } from '@syscor/shared/src/config/mapbox';
import { reverseGeocode, toPoint } from '../utils/geocode';

Mapbox.setAccessToken(MAPBOX_TOKEN);

const toLngLat = ({ latitude, longitude }) => [longitude, latitude];

// Pide permiso y devuelve la posición actual, o null si no hay permiso.
const currentPosition = async () => {
  const perm = await Location.requestForegroundPermissionsAsync();
  if (!perm.granted) return null;
  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  return toPoint(pos.coords);
};

// Mapa a pantalla completa para marcar la dirección de entrega. El pin queda
// fijo en el centro y el cliente mueve el mapa debajo; al soltarlo se busca la
// dirección aproximada de ese punto.
//
// `initial`: { latitude, longitude } ya guardado, o null (entonces arranca en
// la ubicación del teléfono, o en el local si no hay permiso).
// `onConfirm` recibe { latitude, longitude, text, place }.
const LocationPickerModal = ({ visible, initial, onClose, onConfirm }) => {
  const isDark = useColorScheme() === 'dark';
  const c = getMenuColors(isDark);
  const { ms } = useAuthMetrics();
  const insets = useSafeAreaInsets();

  const cameraRef = useRef(null);
  const lookupId = useRef(0);
  const lift = useRef(new Animated.Value(0)).current;

  const [start, setStart] = useState(null);
  const [center, setCenter] = useState(null);
  const [address, setAddress] = useState(null);
  const [resolving, setResolving] = useState(false);
  const [moving, setMoving] = useState(false);
  const [locating, setLocating] = useState(false);

  const canRenderMap = hasMapboxToken();

  // Si el mapa todavía no se montó, el punto pasa a ser donde arranca.
  const flyTo = (point) => {
    if (!cameraRef.current) return setStart(point);
    cameraRef.current.setCamera({ centerCoordinate: toLngLat(point), zoomLevel: 17, animationDuration: 700 });
  };

  const goToMyLocation = useCallback(async ({ silent = false } = {}) => {
    setLocating(true);
    try {
      const point = await currentPosition();
      if (!point) {
        if (!silent) AppAlert.alert('Sin permiso', 'Activa la ubicación para ir a donde estás, o mueve el mapa a mano.');
        return null;
      }
      flyTo(point);
      return point;
    } catch {
      if (!silent) AppAlert.alert('No se pudo ubicar', 'Mueve el mapa hasta tu dirección.');
      return null;
    } finally {
      setLocating(false);
    }
  }, []);

  // Cada vez que se abre arranca desde lo guardado; si no hay nada, desde la
  // ubicación del teléfono. `initial` se lee al abrir y no en cada render
  // (el padre puede pasar un objeto nuevo cada vez).
  const initialRef = useRef(initial);
  initialRef.current = initial;
  useEffect(() => {
    if (!visible) return;
    const saved = toPoint(initialRef.current);
    setStart(saved || { latitude: BRANCH.latitude, longitude: BRANCH.longitude, zoom: 13 });
    setCenter(saved);
    setAddress(null);
    setMoving(false);
    if (!saved && canRenderMap) goToMyLocation({ silent: true });
  }, [visible, canRenderMap, goToMyLocation]);

  useEffect(() => {
    Animated.spring(lift, { toValue: moving ? 1 : 0, useNativeDriver: true, friction: 6 }).start();
  }, [moving, lift]);

  const lookup = async (point) => {
    const id = ++lookupId.current;
    setResolving(true);
    try {
      const found = await reverseGeocode(point);
      if (id === lookupId.current) setAddress(found);
    } catch {
      if (id === lookupId.current) setAddress(null);
    } finally {
      if (id === lookupId.current) setResolving(false);
    }
  };

  const onCameraChanged = (state) => {
    if (state?.gestures?.isGestureActive && !moving) setMoving(true);
  };

  const onMapIdle = (state) => {
    const [longitude, latitude] = state?.properties?.center || [];
    const point = toPoint({ latitude, longitude });
    setMoving(false);
    if (!point) return;
    setCenter(point);
    lookup(point);
  };

  // Sin token no se puede montar el mapa (en Android cierra la app): se
  // ofrece al menos guardar la ubicación actual del teléfono.
  const confirmCurrentPosition = async () => {
    setLocating(true);
    try {
      const point = await currentPosition();
      if (!point) {
        AppAlert.alert('Sin permiso', 'Activa la ubicación para marcar dónde estás.');
        return;
      }
      const found = await reverseGeocode(point).catch(() => null);
      onConfirm({ ...point, text: found?.text || '', place: found?.place || null });
    } catch {
      AppAlert.alert('No se pudo ubicar', 'Inténtalo de nuevo en un momento.');
    } finally {
      setLocating(false);
    }
  };

  const confirm = () => {
    if (!center) return;
    onConfirm({ ...center, text: address?.text || '', place: address?.place || null });
  };

  const pinSize = ms(48);
  const pinLift = lift.interpolate({ inputRange: [0, 1], outputRange: [0, -ms(14)] });
  const roundButton = {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(22),
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      {visible ? (
        <View style={{ flex: 1, backgroundColor: c.background }}>
          {canRenderMap && start ? (
            <View style={{ flex: 1 }}>
              <MapView
                style={{ flex: 1 }}
                styleURL={isDark ? Mapbox.StyleURL.Dark : Mapbox.StyleURL.Street}
                localizeLabels={{ locale: 'es' }}
                // Dentro de un Modal, el SurfaceView de Android puede quedar en negro.
                surfaceView={Platform.OS !== 'android'}
                scaleBarEnabled={false}
                compassEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
                logoPosition={{ bottom: 8, left: 8 }}
                attributionPosition={{ bottom: 8, right: 8 }}
                onCameraChanged={onCameraChanged}
                onMapIdle={onMapIdle}
              >
                <Camera
                  ref={cameraRef}
                  defaultSettings={{ centerCoordinate: toLngLat(start), zoomLevel: start.zoom || 17 }}
                />
              </MapView>

              {/* Pin fijo: la punta queda justo en el centro del mapa. */}
              <View
                pointerEvents="none"
                style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center' }}
              >
                <View
                  style={{
                    position: 'absolute',
                    width: ms(12),
                    height: ms(5),
                    borderRadius: ms(6),
                    backgroundColor: 'rgba(0,0,0,0.3)',
                  }}
                />
                <Animated.View style={{ marginBottom: pinSize, transform: [{ translateY: pinLift }] }}>
                  <Icon name="location-sharp" size={pinSize} color={c.primary} />
                </Animated.View>
              </View>

              <TouchableOpacity
                onPress={() => goToMyLocation()}
                disabled={locating}
                style={[roundButton, { position: 'absolute', right: ms(16), bottom: ms(36) }]}
                accessibilityRole="button"
                accessibilityLabel="Ir a mi ubicación"
              >
                {locating ? (
                  <ActivityIndicator size="small" color={c.primary} />
                ) : (
                  <Icon name="locate" size={ms(20)} color={c.primary} />
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: ms(32), gap: ms(10) }}>
              <Icon name="map-outline" size={ms(40)} color={c.textLight} />
              <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(16), textAlign: 'center' }]}>
                El mapa no está disponible
              </Text>
              <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13.5), textAlign: 'center' }]}>
                Puedes guardar la ubicación actual de tu teléfono como punto de entrega.
              </Text>
            </View>
          )}

          {/* Encabezado */}
          <View
            style={{
              position: 'absolute',
              top: insets.top + ms(10),
              left: ms(16),
              right: ms(16),
              flexDirection: 'row',
              alignItems: 'center',
              gap: ms(10),
            }}
          >
            <TouchableOpacity onPress={onClose} style={roundButton} accessibilityRole="button" accessibilityLabel="Cerrar mapa">
              <Icon name="close" size={ms(22)} color={c.textDark} />
            </TouchableOpacity>
            <View
              style={[
                roundButton,
                { flex: 1, width: undefined, alignItems: 'flex-start', paddingHorizontal: ms(16), borderRadius: ms(22) },
              ]}
            >
              <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(14) }]} numberOfLines={1}>
                Mueve el mapa hasta tu dirección
              </Text>
            </View>
          </View>

          {/* Tarjeta inferior */}
          <View
            style={{
              backgroundColor: c.background,
              borderTopLeftRadius: ms(22),
              borderTopRightRadius: ms(22),
              paddingHorizontal: ms(20),
              paddingTop: ms(18),
              paddingBottom: Math.max(insets.bottom, ms(16)),
              marginTop: canRenderMap ? -ms(22) : 0,
            }}
          >
            {canRenderMap ? (
              <>
                <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10), marginBottom: ms(6) }]}>
                  PUNTO DE ENTREGA
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: ms(10), minHeight: ms(40) }}>
                  <Icon name="location-outline" size={ms(18)} color={c.primary} style={{ marginTop: ms(1) }} />
                  {moving || resolving || !center ? (
                    <Text style={[textStyles.body, { flex: 1, color: c.textLight, fontSize: ms(14) }]}>
                      {moving ? 'Suelta el mapa para elegir este punto' : 'Buscando la dirección…'}
                    </Text>
                  ) : (
                    <Text style={[textStyles.body, { flex: 1, color: c.textDark, fontSize: ms(14) }]} numberOfLines={2}>
                      {address?.text || 'Punto sin nombre en el mapa'}
                    </Text>
                  )}
                </View>
                <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12), marginTop: ms(6) }]}>
                  Luego podrás agregar el número de casa y un punto de referencia.
                </Text>
              </>
            ) : null}

            <TouchableOpacity
              onPress={canRenderMap ? confirm : confirmCurrentPosition}
              disabled={canRenderMap ? !center || moving : locating}
              activeOpacity={0.9}
              style={{
                backgroundColor: c.primary,
                borderRadius: ms(14),
                height: ms(50),
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: ms(16),
                opacity: (canRenderMap ? !center || moving : locating) ? 0.5 : 1,
              }}
              accessibilityRole="button"
            >
              {!canRenderMap && locating ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={[textStyles.title, { color: '#FFFFFF', fontSize: ms(15) }]}>
                  {canRenderMap ? 'Confirmar ubicación' : 'Usar mi ubicación actual'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </Modal>
  );
};

export default LocationPickerModal;
