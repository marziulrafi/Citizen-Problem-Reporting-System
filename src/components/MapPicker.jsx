import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { DHAKA_CENTER } from "../constants/dhakaZones";
import { MapPin, LocateFixed } from "lucide-react";
import MapShell, { MapResizeOnMount } from "./MapShell";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).href,
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).href,
});

function MapClickHandler({ onPositionChange }) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapPicker({
  latitude,
  longitude,
  onChange,
  zoneLabel = "",
  height = "300px",
}) {
  const [locating, setLocating] = useState(false);
  const lat = latitude ?? DHAKA_CENTER.lat;
  const lng = longitude ?? DHAKA_CENTER.lng;
  const hasPin = latitude != null && longitude != null;

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  return (
    <div className="relative z-0 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-800 text-white text-xs relative z-10">
        <span className="flex items-center gap-1 font-medium">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          Tap map to pin {zoneLabel && <span className="text-emerald-300">· {zoneLabel}</span>}
        </span>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 shrink-0"
        >
          <LocateFixed className={`w-3.5 h-3.5 ${locating ? "animate-pulse" : ""}`} />
          {locating ? "Locating…" : "My location"}
        </button>
      </div>
      <MapShell height={height}>
        <MapContainer
          center={[lat, lng]}
          zoom={hasPin ? 15 : 12}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapResizeOnMount />
          <MapClickHandler onPositionChange={onChange} />
          {hasPin && <Marker position={[latitude, longitude]} />}
        </MapContainer>
      </MapShell>
      {hasPin && (
        <p className="relative z-10 text-xs text-slate-500 px-3 py-2 bg-slate-50 border-t border-slate-100">
          {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </p>
      )}
    </div>
  );
}
