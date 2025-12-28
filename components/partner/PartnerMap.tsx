"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import type { Map, Marker, Polygon, LatLngLiteral, LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const STORAGE_KEY = "partner-forest-pin";

type SavedState = {
  lat?: string;
  lng?: string;
  polygon?: { lat: number; lng: number }[];
};

export function PartnerMap() {
  const { t } = useTranslation();
  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");
  const [polygon, setPolygon] = useState<LatLngLiteral[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const polygonRef = useRef<Polygon | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const drawnItemsRef = useRef<any>(null);
  const drawToolRef = useRef<any>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const [leafletReady, setLeafletReady] = useState(false);

  const defaultLat = "21.0278";
  const defaultLng = "105.8342";

  useEffect(() => {
    let mounted = true;
    (async () => {
      const L = await import("leaflet");
      await import("leaflet-draw");
      if (!mounted) return;
      leafletRef.current = L;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: (markerIcon2x as any).src ?? markerIcon2x,
        iconUrl: (markerIcon as any).src ?? markerIcon,
        shadowUrl: (markerShadow as any).src ?? markerShadow,
      });
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const { lat, lng, polygon } = JSON.parse(saved) as SavedState;
          setLat(lat ?? "");
          setLng(lng ?? "");
          setPolygon(polygon ?? []);
        }
      } catch {
        // ignore
      }
      setLeafletReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || !leafletReady || !leafletRef.current) return;
    const L = leafletRef.current;
    const initialLat = parseFloat(lat || defaultLat);
    const initialLng = parseFloat(lng || defaultLng);
    const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 11);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    drawnItemsRef.current = new L.FeatureGroup();
    map.addLayer(drawnItemsRef.current);

    const drawControl = new (L as any).Control.Draw({
      edit: { featureGroup: drawnItemsRef.current },
      draw: {
        polygon: true,
        polyline: false,
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false,
      },
    });
    map.addControl(drawControl);
    // Make sure toolbar is clickable in front of tiles
    const container = (drawControl as any)._toolbars.draw._container as HTMLElement | undefined;
    if (container) {
      container.style.zIndex = "1000";
    }

    map.on((L as any).Draw.Event.CREATED, (e: any) => {
      const layer = e.layer as L.Polygon;
      drawnItemsRef.current?.clearLayers();
      drawnItemsRef.current?.addLayer(layer);
      const pts = ((layer.getLatLngs()[0] as L.LatLng[]) || []).map((p) => ({ lat: p.lat, lng: p.lng }));
      setPolygon(pts);
      setStatus(t("partner.map.pointAdded"));
      setError(null);
    });

    map.on((L as any).Draw.Event.EDITED, () => {
      if (!drawnItemsRef.current) return;
      const layer = drawnItemsRef.current.getLayers()[0] as L.Polygon | undefined;
      if (!layer) return;
      const pts = ((layer.getLatLngs()[0] as L.LatLng[]) || []).map((p) => ({ lat: p.lat, lng: p.lng }));
      setPolygon(pts);
      setStatus(t("partner.map.saved"));
    });

    map.on((L as any).Draw.Event.DELETED, () => {
      setPolygon([]);
      setStatus(null);
    });

    map.on("click", (e: LeafletMouseEvent) => {
      setLat(e.latlng.lat.toFixed(6));
      setLng(e.latlng.lng.toFixed(6));
      setStatus(t("partner.map.saved"));
      setError(null);
    });

    mapRef.current = map;
  }, [lat, lng, t, leafletReady]);

  useEffect(() => {
    if (!mapRef.current) return;
    const parsedLat = parseFloat(lat || defaultLat);
    const parsedLng = parseFloat(lng || defaultLng);
    if (Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) return;

    mapRef.current.setView([parsedLat, parsedLng], mapRef.current.getZoom());

    if (!markerRef.current) {
      markerRef.current = L.marker([parsedLat, parsedLng]).addTo(mapRef.current);
    } else {
      markerRef.current.setLatLng([parsedLat, parsedLng]);
    }
  }, [lat, lng]);

  useEffect(() => {
    if (!mapRef.current || !drawnItemsRef.current) return;
    drawnItemsRef.current.clearLayers();
    if (polygon.length > 1) {
      const poly = L.polygon(polygon, { color: "#16a34a", weight: 2, fillOpacity: 0.15 });
      drawnItemsRef.current.addLayer(poly);
      mapRef.current.fitBounds(poly.getBounds(), { padding: [20, 20] });
    }
  }, [polygon]);

  const handleSave = () => {
    setStatus(null);
    setError(null);
    if (!lat || !lng) {
      setError(t("partner.map.required"));
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lng, polygon }));
    setStatus(t("partner.map.saved"));
  };

  const handleClear = () => {
    setLat("");
    setLng("");
    setPolygon([]);
    setStatus(null);
    setError(null);
    drawnItemsRef.current?.clearLayers();
    localStorage.removeItem(STORAGE_KEY);
  };

  const useCurrentLocation = () => {
    setStatus(null);
    setError(null);
    if (!navigator.geolocation) {
      setError(t("partner.map.noGeo"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setStatus(t("partner.map.setFromDevice"));
      },
      () => setError(t("partner.map.noGeo")),
    );
  };

  const handleClearShape = () => {
    setPolygon([]);
    setStatus(null);
    drawnItemsRef.current?.clearLayers();
  };

  const startDraw = () => {
    if (!mapRef.current || !leafletRef.current || !(leafletRef.current as any).Draw?.Polygon) return;
    const L = leafletRef.current;
    drawToolRef.current = new (L as any).Draw.Polygon(mapRef.current, {
      shapeOptions: { color: "#16a34a", weight: 2, fillOpacity: 0.15 },
    });
    drawToolRef.current.enable();
    setStatus(t("partner.map.drawStarted"));
    setError(null);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="lat">{t("partner.map.lat")}</Label>
          <Input
            id="lat"
            type="text"
            inputMode="decimal"
            placeholder="21.0278"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lng">{t("partner.map.lng")}</Label>
          <Input
            id="lng"
            type="text"
            inputMode="decimal"
            placeholder="105.8342"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {t("partner.map.hint")}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={handleSave}>
            {t("partner.map.save")}
          </Button>
          <Button type="button" variant="secondary" onClick={useCurrentLocation}>
            {t("partner.map.useLocation")}
          </Button>
          <Button type="button" variant="ghost" onClick={handleClear}>
            {t("partner.map.clear")}
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={startDraw}>
            {t("partner.map.startDraw")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClearShape}
            disabled={polygon.length === 0}
          >
            {t("partner.map.clearShape")}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{t("partner.map.drawHint")}</p>
        {status ? (
          <Alert>
            <AlertDescription>{status}</AlertDescription>
          </Alert>
        ) : null}
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
      </div>

      <div className="rounded-lg border overflow-hidden bg-white shadow-sm flex flex-col">
        <div ref={mapContainerRef} className="w-full h-[420px]" />
        <div className="p-3 text-sm text-muted-foreground bg-muted flex items-center justify-between">
          <a
            className="text-primary underline"
            href={`https://maps.google.com/?q=${encodeURIComponent(lat || defaultLat)},${encodeURIComponent(lng || defaultLng)}`}
            target="_blank"
            rel="noreferrer"
          >
            {t("partner.map.openExternal")}
          </a>
          <span className="text-xs">{t("partner.map.tapHint")}</span>
        </div>
      </div>
    </div>
  );
}
