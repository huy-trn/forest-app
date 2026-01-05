import type { PolygonPoint } from "./types";

export function normalizePolygon(value: any): PolygonPoint[] | null {
  if (!Array.isArray(value)) return null;
  const points = value
    .map((p: any) => {
      if (Array.isArray(p)) {
        const [lat, lng] = p;
        return { lat: Number(lat), lng: Number(lng) };
      }
      if (p && typeof p === "object") {
        const lat = Number((p as any).lat ?? (p as any).latitude);
        const lng = Number((p as any).lng ?? (p as any).longitude ?? (p as any).lon);
        return { lat, lng };
      }
      return { lat: NaN, lng: NaN };
    })
    .filter((p) => !Number.isNaN(p.lat) && !Number.isNaN(p.lng));
  return points.length ? points : null;
}

export function polygonToText(polygon?: PolygonPoint[] | null) {
  if (!polygon || polygon.length === 0) return "";
  try {
    return JSON.stringify(polygon, null, 2);
  } catch {
    return "";
  }
}

export function parsePolygonText(text: string): { points: PolygonPoint[] | null; error?: string } {
  const trimmed = text.trim();
  if (!trimmed) return { points: null };
  try {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) {
      return { points: null, error: "Polygon must be an array" };
    }
    const points = parsed
      .map((p: any) => {
        if (Array.isArray(p)) {
          const [lat, lng] = p;
          return { lat: Number(lat), lng: Number(lng) };
        }
        if (p && typeof p === "object") {
          const lat = Number(p.lat ?? p.latitude);
          const lng = Number(p.lng ?? p.longitude ?? p.lon);
          return { lat, lng };
        }
        return { lat: NaN, lng: NaN };
      })
      .filter((p) => !Number.isNaN(p.lat) && !Number.isNaN(p.lng));
    if (points.length === 0) {
      return { points: null, error: "Polygon needs at least one valid point" };
    }
    return { points };
  } catch {
    return { points: null, error: "Polygon must be valid JSON" };
  }
}

export function computeCentroid(points: PolygonPoint[]): { latitude: number; longitude: number } {
  if (!points.length) return { latitude: 0, longitude: 0 };
  const { lat, lng } = points.reduce(
    (acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }),
    { lat: 0, lng: 0 }
  );
  return { latitude: lat / points.length, longitude: lng / points.length };
}
