import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import Mapbox, { MapView, Camera, ShapeSource, LineLayer, MarkerView } from "@rnmapbox/maps";
import { MAPBOX_TOKEN } from "../../config/mapbox";
import SymbolIcon from "../commons/SymbolIcon";
import useDeliveryRouteScreenStyles from "../../styles/deliveryRouteScreenStyles";
import { useTheme } from "../../theme/ThemeContext";

Mapbox.setAccessToken(MAPBOX_TOKEN);

const EDGE_PADDING = { paddingTop: 48, paddingRight: 40, paddingBottom: 40, paddingLeft: 40 };

const toLngLat = ({ latitude, longitude }) => [longitude, latitude];

function Pin({ icon, background }) {
  const styles = useDeliveryRouteScreenStyles();
  return (
    <View style={[styles.mapPin, { backgroundColor: background }]}>
      <SymbolIcon name={icon} size={16} color="#FFFFFF" />
    </View>
  );
}

export default function DeliveryMap({ origin, destination, coordinates, loading, error, onRetry }) {
  const { p } = useTheme();
  const styles = useDeliveryRouteScreenStyles();
  const routeShape = useMemo(
    () =>
      coordinates?.length
        ? { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: coordinates.map(toLngLat) } }
        : null,
    [coordinates]
  );

  // Encuadra la ruta completa; si aún no hay ruta, origen y destino.
  const bounds = useMemo(() => {
    const points = coordinates?.length ? coordinates : [origin, destination].filter(Boolean);
    if (points.length < 2) return null;
    const lats = points.map((p) => p.latitude);
    const lngs = points.map((p) => p.longitude);
    return {
      ne: [Math.max(...lngs), Math.max(...lats)],
      sw: [Math.min(...lngs), Math.min(...lats)],
      ...EDGE_PADDING,
    };
  }, [coordinates, origin, destination]);

  const center = destination || origin;

  return (
    <View style={styles.mapCard}>
      {center ? (
        <MapView
          style={styles.map}
          styleURL={Mapbox.StyleURL.Street}
          scaleBarEnabled={false}
          logoPosition={{ bottom: 6, left: 6 }}
          attributionPosition={{ bottom: 6, right: 6 }}
        >
          <Camera
            defaultSettings={{ centerCoordinate: toLngLat(center), zoomLevel: 13 }}
            bounds={bounds || undefined}
            animationDuration={600}
          />
          {routeShape ? (
            <ShapeSource id="delivery-route" shape={routeShape}>
              <LineLayer
                id="delivery-route-line"
                style={{
                  lineColor: p.accent,
                  lineWidth: 5,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
            </ShapeSource>
          ) : null}
          {origin ? (
            <MarkerView coordinate={toLngLat(origin)} anchor={{ x: 0.5, y: 0.5 }} allowOverlap>
              <Pin icon="two_wheeler" background={p.inverseBg} />
            </MarkerView>
          ) : null}
          {destination ? (
            <MarkerView coordinate={toLngLat(destination)} anchor={{ x: 0.5, y: 0.5 }} allowOverlap>
              <Pin icon="home_pin" background={p.accent} />
            </MarkerView>
          ) : null}
        </MapView>
      ) : null}

      {loading ? (
        <View style={styles.mapOverlay}>
          <ActivityIndicator size="small" color={p.accent} />
          <Text style={styles.mapOverlayText}>Calculando ruta</Text>
        </View>
      ) : error ? (
        <View style={styles.mapOverlay}>
          <SymbolIcon name="map" size={22} color={p.muted} />
          <Text style={styles.mapOverlayText}>{error}</Text>
          {onRetry ? (
            <TouchableOpacity style={styles.mapRetry} onPress={onRetry} activeOpacity={0.8}>
              <SymbolIcon name="refresh" size={15} color={p.accent} />
              <Text style={styles.mapRetryLabel}>Reintentar</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
