export const DHAKA_CENTER = { lat: 23.8103, lng: 90.4125 };

export function getZoneLabel(zoneId, zones = []) {
  const z = zones.find((x) => x.id === zoneId);
  return z?.name || zoneId || "Unknown zone";
}

function isInsideBounds(lat, lng, bounds) {
  return lat >= bounds.minLat && lat <= bounds.maxLat && lng >= bounds.minLng && lng <= bounds.maxLng;
}

export function detectZoneFromCoordinates(lat, lng, zones) {
  if (!zones?.length) return null;
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;

  const match = zones.find((z) => isInsideBounds(latitude, longitude, z.bounds));
  if (match) return match;

  let nearest = zones[0];
  let minDist = Infinity;
  for (const z of zones) {
    const d = (latitude - z.center.lat) ** 2 + (longitude - z.center.lng) ** 2;
    if (d < minDist) {
      minDist = d;
      nearest = z;
    }
  }
  return nearest;
}
