import { useEffect } from "react";
import { useMap } from "react-leaflet";

/** Fixes Leaflet sizing when map mounts inside tabs/steps. */
export function MapResizeOnMount() {
  const map = useMap();
  useEffect(() => {
    const t1 = setTimeout(() => map.invalidateSize(), 0);
    const t2 = setTimeout(() => map.invalidateSize(), 200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map]);
  return null;
}

/**
 * Isolates Leaflet stacking context so panes/controls do not overlap page sections.
 */
export default function MapShell({ children, height = "280px", className = "" }) {
  return (
    <div
      className={`map-shell relative w-full overflow-hidden rounded-xl bg-slate-100 ${className}`}
      style={{ height, minHeight: height, zIndex: 0 }}
    >
      <div className="absolute inset-0 [&_.leaflet-container]:!z-0">{children}</div>
    </div>
  );
}
