import { MAPBOX_TOKEN } from "../config/mapbox";

const BASE_URL = "https://api.mapbox.com/directions/v5/mapbox/driving-traffic";
const TIMEOUT_MS = 12000;

const MODIFIER_ICONS = {
  left: "turn_left",
  right: "turn_right",
  "slight left": "turn_slight_left",
  "slight right": "turn_slight_right",
  "sharp left": "turn_sharp_left",
  "sharp right": "turn_sharp_right",
  straight: "straight",
  uturn: "u_turn_left",
};

const maneuverIcon = ({ type, modifier } = {}) => {
  if (type === "arrive") return "flag";
  if (type === "depart") return "navigation";
  if (type === "roundabout" || type === "rotary" || type === "roundabout turn") {
    return modifier?.includes("left") ? "roundabout_left" : "roundabout_right";
  }
  if (type === "fork") return modifier?.includes("left") ? "fork_left" : "fork_right";
  if (type === "merge") return "merge";
  return MODIFIER_ICONS[modifier] || "straight";
};

const toLatLng = ([longitude, latitude]) => ({ latitude, longitude });

const toStep = (step) => ({
  instruction: step.maneuver?.instruction || "Continúa",
  street: step.name || null,
  distanceMeters: Number(step.distance) || 0,
  icon: maneuverIcon(step.maneuver),
  location: step.maneuver?.location ? toLatLng(step.maneuver.location) : null,
});

export const fetchRoute = async (origin, destination) => {
  const coords = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
  const params = new URLSearchParams({
    geometries: "geojson",
    overview: "full",
    steps: "true",
    language: "es",
    alternatives: "false",
    access_token: MAPBOX_TOKEN,
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${BASE_URL}/${coords}?${params}`, { signal: controller.signal });
    const data = await response.json();
    if (!response.ok || data.code !== "Ok" || !data.routes?.length) {
      throw new Error(data.message || `Mapbox respondió ${data.code || response.status}`);
    }

    const route = data.routes[0];
    return {
      coordinates: (route.geometry?.coordinates || []).map(toLatLng),
      distanceMeters: Number(route.distance) || 0,
      durationSeconds: Number(route.duration) || 0,
      steps: (route.legs?.[0]?.steps || []).map(toStep),
    };
  } finally {
    clearTimeout(timer);
  }
};

export const formatMeters = (meters) => {
  const value = Number(meters) || 0;
  if (value < 1000) return `${Math.max(Math.round(value / 10) * 10, 0)} m`;
  return `${(value / 1000).toFixed(1)} km`;
};
