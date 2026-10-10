import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import SymbolIcon from "../commons/SymbolIcon";
import styles from "../../styles/deliveryRouteScreenStyles";

const EDGE_PADDING = { top: 48, right: 40, bottom: 40, left: 40 };

function Pin({ icon, background }) {
  return (
    <View style={[styles.mapPin, { backgroundColor: background }]}>
      <SymbolIcon name={icon} size={16} color="#FFFFFF" />
    </View>
  );
}

export default function DeliveryMap({ origin, destination, coordinates, loading, error, onRetry }) {
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const points = coordinates?.length ? coordinates : [origin, destination].filter(Boolean);
    if (!mapReady || !mapRef.current || points.length < 2) return;
    mapRef.current.fitToCoordinates(points, { edgePadding: EDGE_PADDING, animated: true });
  }, [mapReady, coordinates, origin, destination]);

  const center = destination || origin;

  return (
    <View style={styles.mapCard}>
      {center ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{ ...center, latitudeDelta: 0.04, longitudeDelta: 0.04 }}
          onMapReady={() => setMapReady(true)}
          toolbarEnabled={false}
          showsPointsOfInterest={false}
          showsBuildings={false}
        >
          {coordinates?.length ? (
            <Polyline coordinates={coordinates} strokeColor={employeePalette.accent} strokeWidth={5} />
          ) : null}
          {origin ? (
            <Marker coordinate={origin} anchor={{ x: 0.5, y: 0.5 }}>
              <Pin icon="two_wheeler" background={employeePalette.ink} />
            </Marker>
          ) : null}
          {destination ? (
            <Marker coordinate={destination} anchor={{ x: 0.5, y: 0.5 }}>
              <Pin icon="home_pin" background={employeePalette.accent} />
            </Marker>
          ) : null}
        </MapView>
      ) : null}

      {loading ? (
        <View style={styles.mapOverlay}>
          <ActivityIndicator size="small" color={employeePalette.accent} />
          <Text style={styles.mapOverlayText}>Calculando ruta</Text>
        </View>
      ) : error ? (
        <View style={styles.mapOverlay}>
          <SymbolIcon name="map" size={22} color={employeePalette.muted} />
          <Text style={styles.mapOverlayText}>{error}</Text>
          {onRetry ? (
            <TouchableOpacity style={styles.mapRetry} onPress={onRetry} activeOpacity={0.8}>
              <SymbolIcon name="refresh" size={15} color={employeePalette.accent} />
              <Text style={styles.mapRetryLabel}>Reintentar</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
