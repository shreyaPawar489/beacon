"use client";

// Leaflet touches `window`, so load this with next/dynamic({ ssr: false }).
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { BERKELEY } from "./report-meta";

export const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

export const pinIcon = (className = "") =>
  L.divIcon({
    className: "",
    html: `<div class="beacon-pin ${className}"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });

function TapToPick({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

// Leaflet measures its container once; re-measure after sheet/expand animations.
function FixSize() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 350);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

function FlyTo({ point }: { point: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (point) map.flyTo([point.lat, point.lng], Math.max(map.getZoom(), 17), { duration: 0.6 });
  }, [map, point]);
  return null;
}

export default function LocationPicker({
  value,
  onPick,
}: {
  value: { lat: number; lng: number } | null;
  onPick: (lat: number, lng: number) => void;
}) {
  return (
    <MapContainer
      center={value ? [value.lat, value.lng] : BERKELEY}
      zoom={15}
      zoomControl={false}
      className="h-full w-full"
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={19} />
      <FixSize />
      <TapToPick onPick={onPick} />
      <FlyTo point={value} />
      {value && <Marker position={[value.lat, value.lng]} icon={pinIcon()} />}
    </MapContainer>
  );
}
