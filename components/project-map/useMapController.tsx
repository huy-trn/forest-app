import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker, Polygon as LeafletPolygon } from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

type MarkerPayload = { lat: number; lng: number; tooltip?: string };
type PolygonPayload = { id: string; points?: { lat: number; lng: number }[]; color?: string; weight?: number; fillOpacity?: number };
type ClickHandler = ((lat: number, lng: number) => void) | undefined;

type MapController = {
  mapContainerRef: React.RefObject<HTMLDivElement | null>;
  focusLatLng: (lat: number, lng: number, zoom?: number) => void;
  fitBounds: (bounds: [number, number][]) => void;
  invalidateSize: () => void;
  setMarker: (id: string, payload: MarkerPayload) => void;
  removeMarker: (id?: string) => void;
  setPolygon: (payload: PolygonPayload) => void;
  removePolygon: (id?: string) => void;
  getMarkerIds: () => string[];
  getPolygonIds: () => string[];
  setClickHandler: (handler: ClickHandler) => void;
  setInteractionEnabled: (enabled: boolean) => void;
  isReady: boolean;
};

const MapControllerContext = createContext<MapController | null>(null);

function useCreateMapController(): MapController {
  const mapRef = useRef<LeafletMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markerRefs = useRef<Map<string, LeafletMarker>>(new Map());
  const polygonRefs = useRef<Map<string, LeafletPolygon>>(new Map());
  const clickHandlerRef = useRef<ClickHandler>(undefined);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const L = await import("leaflet");
      if (!mounted) return;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: (markerIcon2x as any).src ?? markerIcon2x,
        iconUrl: (markerIcon as any).src ?? markerIcon,
        shadowUrl: (markerShadow as any).src ?? markerShadow,
      });
      leafletRef.current = L;
      if (!mapContainerRef.current || mapRef.current) return;
      const map = L.map(mapContainerRef.current).setView([21.0278, 105.8342], 10);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);
      map.on("click", (e: any) => {
        if (clickHandlerRef.current) clickHandlerRef.current(e.latlng.lat, e.latlng.lng);
      });
      mapRef.current = map;
      setIsReady(true);
    })();
    return () => {
      mounted = false;
      setIsReady(false);
      mapRef.current?.remove();
      mapRef.current = null;
      markerRefs.current.forEach((m) => m.remove());
      markerRefs.current.clear();
      polygonRefs.current.forEach((p) => p.remove());
      polygonRefs.current.clear();
    };
  }, []);

  const focusLatLng = (lat: number, lng: number, zoom?: number) => {
    if (!mapRef.current) return;
    const targetZoom = zoom ?? Math.max(mapRef.current.getZoom(), 14);
    mapRef.current.flyTo([lat, lng] as any, targetZoom, { animate: true, duration: 0.5 });
  };

  const fitBounds = (bounds: [number, number][]) => {
    if (!mapRef.current || !leafletRef.current || bounds.length === 0) return;
    const LBounds = leafletRef.current.latLngBounds(bounds as any);
    mapRef.current.fitBounds(LBounds, { padding: [20, 20] });
  };

  const invalidateSize = () => {
    if (!mapRef.current) return;
    mapRef.current.invalidateSize({ pan: true });
  };

  const setMarker = (id: string, payload: MarkerPayload) => {
    if (!mapRef.current || !leafletRef.current) return;
    const L = leafletRef.current;
    let marker = markerRefs.current.get(id);
    if (!marker) {
      marker = L.marker([payload.lat, payload.lng], { draggable: false });
      marker.addTo(mapRef.current);
      markerRefs.current.set(id, marker);
    } else {
      marker.setLatLng([payload.lat, payload.lng]);
    }
    if (payload.tooltip) {
      if (marker.getTooltip()) {
        marker.getTooltip()?.setContent(payload.tooltip);
      } else {
        marker.bindTooltip(payload.tooltip, { direction: "top" });
      }
    }
  };

  const removeMarker = (id: string = "*") => {
    if (id === "*") {
      markerRefs.current.forEach((marker) => marker.remove());
      markerRefs.current.clear();
      return;
    }
    const marker = markerRefs.current.get(id);
    if (marker) {
      marker.remove();
      markerRefs.current.delete(id);
    }
  };

  const setPolygon = (payload: PolygonPayload) => {
    if (!mapRef.current || !leafletRef.current) return;
    const L = leafletRef.current;
    let polygon = polygonRefs.current.get(payload.id);
    if (!polygon) {
      polygon = L.polygon(payload.points || [], {
        color: payload.color ?? "#2563eb",
        weight: payload.weight ?? 2,
        fillOpacity: payload.fillOpacity ?? 0.08,
      });
      polygon.addTo(mapRef.current);
      polygonRefs.current.set(payload.id, polygon);
    } else {
      polygon.setLatLngs(payload.points || []);
    }
  };

  const removePolygon = (id: string = "*") => {
    if (id === "*") {
      polygonRefs.current.forEach((polygon) => polygon.remove());
      polygonRefs.current.clear();
      return;
    }
    const polygon = polygonRefs.current.get(id);
    if (polygon) {
      polygon.remove();
      polygonRefs.current.delete(id);
    }
  };

  const controller: MapController = useMemo(
    () => ({
      mapContainerRef,
      focusLatLng,
      fitBounds,
      invalidateSize,
      setMarker,
      removeMarker,
      setPolygon,
      removePolygon,
      getMarkerIds: () => Array.from(markerRefs.current.keys()),
      getPolygonIds: () => Array.from(polygonRefs.current.keys()),
      setClickHandler: (handler: ClickHandler) => {
        clickHandlerRef.current = handler;
      },
      setInteractionEnabled: (enabled: boolean) => {
        if (!mapRef.current) return;
        const map = mapRef.current;
        if (enabled) {
          map.dragging?.enable();
          map.touchZoom?.enable();
          map.scrollWheelZoom?.enable();
          map.doubleClickZoom?.enable();
          map.boxZoom?.enable();
          map.keyboard?.enable();
          try {
            map.zoomControl?.addTo(map);
          } catch {
            /* ignore */
          }
        } else {
          map.dragging?.disable();
          map.touchZoom?.disable();
          map.scrollWheelZoom?.disable();
          map.doubleClickZoom?.disable();
          map.boxZoom?.disable();
          map.keyboard?.disable();
          try {
            map.zoomControl?.remove();
          } catch {
            /* ignore */
          }
        }
      },
      isReady,
    }),
    [fitBounds, focusLatLng, isReady, mapContainerRef, removeMarker, removePolygon, setMarker, setPolygon]
  );

  return controller;
}

export const MapControllerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const controller = useCreateMapController();
  return <MapControllerContext.Provider value={controller}>{children}</MapControllerContext.Provider>;
};

export function useMapController() {
  const ctx = useContext(MapControllerContext);
  if (!ctx) throw new Error("useMapController must be used within MapControllerProvider");
  return ctx;
}
