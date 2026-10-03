// Display helpers shared by the Report, Map and Vault tabs.
import type { Category, Location, Severity } from "@/lib/types";

export const BERKELEY: [number, number] = [37.8719, -122.2585];

export const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: "harassment", label: "Harassment", emoji: "🗣️" },
  { id: "stalking", label: "Stalking / following", emoji: "👣" },
  { id: "assault", label: "Physical / sexual assault", emoji: "✋" },
  { id: "unsafe_area", label: "Unsafe area", emoji: "🌒" },
  { id: "online", label: "Online", emoji: "📱" },
];

export const categoryLabel = (c: Category) => CATEGORIES.find((x) => x.id === c)?.label ?? c;
export const categoryEmoji = (c: Category) => CATEGORIES.find((x) => x.id === c)?.emoji ?? "•";

export const SEVERITIES: { level: Severity; label: string; color: string }[] = [
  { level: 1, label: "Uneasy", color: "#a5b4fc" },
  { level: 2, label: "Uncomfortable", color: "#a78bfa" },
  { level: 3, label: "Scared", color: "#e0a03c" },
  { level: 4, label: "Hurt or threatened", color: "#ec7a4f" },
  { level: 5, label: "In danger", color: "#e0446a" },
];

export const severityMeta = (s: Severity) => SEVERITIES[s - 1] ?? SEVERITIES[2];

// Named spots around campus, used to label a dropped pin.
const LANDMARKS: Location[] = [
  { label: "Sather Gate", lat: 37.87037, lng: -122.25942 },
  { label: "Doe Library", lat: 37.87205, lng: -122.25935 },
  { label: "Memorial Glade", lat: 37.87291, lng: -122.25904 },
  { label: "Bancroft Way & Telegraph Ave", lat: 37.86894, lng: -122.25876 },
  { label: "Telegraph Ave & Durant Ave", lat: 37.86779, lng: -122.2587 },
  { label: "Telegraph Ave & Channing Way", lat: 37.86675, lng: -122.25896 },
  { label: "Telegraph Ave & Haste St", lat: 37.86597, lng: -122.25886 },
  { label: "People's Park", lat: 37.86544, lng: -122.25677 },
  { label: "Southside – Unit 2 dorms, Haste St", lat: 37.86656, lng: -122.25508 },
  { label: "Southside – Dwight Way & Bowditch St", lat: 37.86375, lng: -122.25631 },
  { label: "Channing Way & Ellsworth St", lat: 37.86626, lng: -122.26072 },
  { label: "Downtown Berkeley BART", lat: 37.87005, lng: -122.26844 },
];

// Quick picks in the intake "where" step.
export const PLACES: Location[] = ["Sather Gate", "Doe Library", "Telegraph Ave & Durant Ave", "People's Park", "Downtown Berkeley BART"].map(
  (label) => LANDMARKS.find((l) => l.label === label)!,
);

// Haversine distance in metres.
export function metersBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6_371_000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const h =
    Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function labelFor(lat: number, lng: number): string {
  let best = LANDMARKS[0];
  let bestD = Infinity;
  for (const l of LANDMARKS) {
    const d = metersBetween(l, { lat, lng });
    if (d < bestD) [best, bestD] = [l, d];
  }
  return bestD <= 120 ? best.label : bestD <= 400 ? `Near ${best.label}` : "Dropped pin";
}

export function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}
