/** Human-readable location when only map pin was used. */
export function buildMapPinAddress({ latitude, longitude, zoneLabel, district = "Dhaka" } = {}) {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return "";

  const coords = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  if (zoneLabel) return `Map pin — ${zoneLabel}, ${district} (${coords})`;
  return `Map pin — ${district} (${coords})`;
}

export function formatIssueDisplayAddress(issue) {
  const addr = String(issue?.address || "").trim();
  if (addr) return addr;

  const coords = issue?.location?.coordinates;
  if (coords?.length >= 2) {
    return buildMapPinAddress({
      latitude: coords[1],
      longitude: coords[0],
      zoneLabel: issue.zoneLabel || "",
      district: issue.district || "Dhaka",
    });
  }

  if (issue?.zoneLabel) return issue.zoneLabel;
  return "";
}

export async function reverseGeocodeAddress(lat, lng) {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return "";

  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "json");
    url.searchParams.set("lat", String(latitude));
    url.searchParams.set("lon", String(longitude));
    url.searchParams.set("zoom", "18");
    url.searchParams.set("addressdetails", "1");

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return "";
    const data = await res.json();
    const a = data?.address;
    if (!a) return data?.display_name || "";

    const parts = [
      a.road || a.pedestrian || a.footway,
      a.neighbourhood || a.suburb || a.quarter,
      a.city || a.town || a.municipality || "Dhaka",
    ].filter(Boolean);
    return parts.join(", ") || data.display_name || "";
  } catch {
    return "";
  }
}
