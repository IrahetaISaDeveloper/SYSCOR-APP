import { BRANCH } from '../constants/branch';

export const CUSTOMER_LOCATION_RADIUS_METERS = 20000;

const EARTH_RADIUS_METERS = 6371008.8;

export const distanceToBranchMeters = (point) => {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const branchLatitude = toRadians(BRANCH.latitude);
  const latitudeDelta = toRadians(point.latitude - BRANCH.latitude);
  const longitudeDelta = toRadians(point.longitude - BRANCH.longitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(branchLatitude) *
      Math.cos(toRadians(point.latitude)) *
      Math.sin(longitudeDelta / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(haversine));
};

export const isWithinBranchRadius = (point) =>
  distanceToBranchMeters(point) <= CUSTOMER_LOCATION_RADIUS_METERS;

const createBranchRadiusShape = () => {
  const segments = 64;
  const angularDistance = CUSTOMER_LOCATION_RADIUS_METERS / EARTH_RADIUS_METERS;
  const branchLatitude = (BRANCH.latitude * Math.PI) / 180;
  const branchLongitude = (BRANCH.longitude * Math.PI) / 180;
  const coordinates = Array.from({ length: segments }, (_, index) => {
    const bearing = (-2 * Math.PI * index) / segments;
    const latitude = Math.asin(
      Math.sin(branchLatitude) * Math.cos(angularDistance) +
        Math.cos(branchLatitude) * Math.sin(angularDistance) * Math.cos(bearing),
    );
    const longitude =
      branchLongitude +
      Math.atan2(
        Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(branchLatitude),
        Math.cos(angularDistance) - Math.sin(branchLatitude) * Math.sin(latitude),
      );

    return [(longitude * 180) / Math.PI, (latitude * 180) / Math.PI];
  });
  coordinates.push(coordinates[0]);

  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [coordinates],
    },
  };
};

export const BRANCH_RADIUS_SHAPE = createBranchRadiusShape();
