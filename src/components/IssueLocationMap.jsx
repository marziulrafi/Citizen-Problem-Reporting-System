import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MapShell, { MapResizeOnMount } from "./MapShell";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).href,
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).href,
});

export default function IssueLocationMap({ issue, height = "240px" }) {
  const coords = issue?.location?.coordinates;
  if (!coords || coords.length < 2) {
    return (
      <div
        className="rounded-xl bg-slate-100 border border-slate-200 p-6 text-center text-sm text-slate-500 flex items-center justify-center"
        style={{ height }}
      >
        No map coordinates for this issue
      </div>
    );
  }

  const lat = coords[1];
  const lng = coords[0];

  return (
    <div className="relative z-0 w-full">
      <MapShell height={height} className="border border-slate-200 shadow-sm">
        <MapContainer
          center={[lat, lng]}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
          dragging
          className="h-full w-full"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapResizeOnMount />
          <Marker position={[lat, lng]} />
        </MapContainer>
      </MapShell>
    </div>
  );
}
