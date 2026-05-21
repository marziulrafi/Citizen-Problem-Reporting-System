import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { DHAKA_CENTER } from "../constants/dhakaZones";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).href,
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).href,
});

function getCoords(issue) {
  const c = issue?.location?.coordinates;
  if (!c || c.length < 2) return null;
  return { lat: c[1], lng: c[0] };
}

export default function IssuesMap({ issues = [], height = "420px" }) {
  const markers = issues.map((issue) => ({ issue, ...getCoords(issue) })).filter((m) => m.lat != null);

  const center =
    markers.length > 0
      ? [markers.reduce((s, m) => s + m.lat, 0) / markers.length, markers.reduce((s, m) => s + m.lng, 0) / markers.length]
      : [DHAKA_CENTER.lat, DHAKA_CENTER.lng];

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md">
      <MapContainer center={center} zoom={markers.length ? 12 : 11} style={{ height, width: "100%" }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map(({ issue, lat, lng }) => (
          <Marker key={issue._id || issue.id} position={[lat, lng]}>
            <Popup>
              <div className="text-sm min-w-[160px]">
                <p className="font-semibold text-slate-900">{issue.title}</p>
                {issue.zoneLabel && <p className="text-xs text-emerald-700">{issue.zoneLabel}</p>}
                <p className="text-xs text-slate-500 mt-1">{issue.address || "Dhaka"}</p>
                <Link to={`/problem/${issue._id || issue.id}`} className="text-xs text-emerald-600 font-semibold mt-2 inline-block">
                  View details →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
