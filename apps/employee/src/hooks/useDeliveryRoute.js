import { useCallback, useEffect, useMemo, useState } from "react";
import * as Location from "expo-location";
import { fetchRoute, formatMeters } from "../services/mapboxDirections";
import { hasMapboxToken } from "../config/mapbox";

const isCoord = (value) => value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));

const validPoint = (point) =>
  point && isCoord(point.latitude) && isCoord(point.longitude)
    ? { latitude: Number(point.latitude), longitude: Number(point.longitude) }
    : null;

// Ruta desde la posición actual del repartidor hasta el domicilio. Si no hay
// permiso de ubicación se traza desde el local.
export default function useDeliveryRoute(delivery) {
  const { latitude: destLat, longitude: destLng } = delivery?.dropoff || {};
  const { latitude: pickLat, longitude: pickLng } = delivery?.pickup || {};
  const destination = useMemo(
    () => validPoint({ latitude: destLat, longitude: destLng }),
    [destLat, destLng]
  );
  const pickup = useMemo(() => validPoint({ latitude: pickLat, longitude: pickLng }), [pickLat, pickLng]);

  const [origin, setOrigin] = useState(null);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [calculatedAt, setCalculatedAt] = useState(null);

  const currentPosition = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setPermissionDenied(true);
      return null;
    }
    setPermissionDenied(false);
    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return validPoint(position.coords);
  }, []);

  const calculate = useCallback(async () => {
    if (!destination) {
      setLoading(false);
      setError("No tenemos la ubicación exacta de este domicilio.");
      return;
    }
    if (!hasMapboxToken()) {
      setLoading(false);
      setError("Falta configurar el token de Mapbox.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const start = (await currentPosition().catch(() => null)) || pickup;
      if (!start) throw new Error("Sin punto de partida");
      setOrigin(start);
      setRoute(await fetchRoute(start, destination));
      setCalculatedAt(Date.now());
    } catch (err) {
      console.error("useDeliveryRoute.calculate error:", err?.message || err);
      setError("No se pudo calcular la ruta. Revisa tu conexión.");
    } finally {
      setLoading(false);
    }
  }, [currentPosition, destination, pickup]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const navigation = useMemo(() => {
    if (!route?.steps?.length) return null;
    const [first, next] = route.steps;
    const upcoming = next || first;
    return {
      icon: upcoming.icon,
      instruction: upcoming.instruction,
      street: upcoming.street ? `sobre ${upcoming.street}` : null,
      distance: formatMeters(next ? first.distanceMeters : upcoming.distanceMeters),
    };
  }, [route]);

  const distanceKm = route ? Math.round((route.distanceMeters / 1000) * 10) / 10 : null;
  const etaMinutes = route ? Math.max(Math.ceil(route.durationSeconds / 60), 1) : null;
  const arrivalAt = route && calculatedAt ? calculatedAt + route.durationSeconds * 1000 : null;

  return {
    origin,
    destination,
    route,
    navigation,
    distanceKm,
    etaMinutes,
    arrivalAt,
    loading,
    error,
    permissionDenied,
    recalculate: calculate,
  };
}
