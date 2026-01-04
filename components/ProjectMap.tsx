"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

type ProjectLocation = {
  id: string;
  latitude: number;
  longitude: number;
  label?: string | null;
};

type ProjectMapProps = {
  projectId: string;
  editable?: boolean;
  heightClassName?: string;
};

export function ProjectMap({ projectId, editable = false, heightClassName = "h-[300px] sm:h-[360px] md:h-[420px]" }: ProjectMapProps) {
  const { t } = useTranslation();
  const [LMod, setLMod] = useState<typeof import("leaflet") | null>(null);
  const [locations, setLocations] = useState<ProjectLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "add">("view");
  const mapRef = useRef<LeafletMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markerRefs = useRef<Map<string, LeafletMarker>>(new Map());
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);
  const modeRef = useRef<"view" | "add">("view");
  const unsavedMarkerRef = useRef<LeafletMarker | null>(null);
  const [unsavedPin, setUnsavedPin] = useState<{ latitude: number; longitude: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Lock/unlock map interactions based on mode
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    if (mode === "add") {
      map.dragging?.disable();
      map.touchZoom?.disable();
      map.scrollWheelZoom?.disable();
      map.doubleClickZoom?.disable();
      map.boxZoom?.disable();
      map.keyboard?.disable();
      try {
        map.zoomControl?.remove();
      } catch {}
    } else {
      map.dragging?.enable();
      map.touchZoom?.enable();
      map.scrollWheelZoom?.enable();
      map.doubleClickZoom?.enable();
      map.boxZoom?.enable();
      map.keyboard?.enable();
      try {
        map.zoomControl?.addTo(map);
      } catch {}
      // Clear any unsaved pin when returning to view mode
      if (unsavedMarkerRef.current) {
        unsavedMarkerRef.current.remove();
        unsavedMarkerRef.current = null;
      }
      setUnsavedPin(null);
    }
  }, [mode]);

  // Lazy-load Leaflet on client
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
      setLMod(L);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch existing locations
  useEffect(() => {
    let abort = false;
    setLoading(true);
    fetch(`/api/projects/${projectId}/locations`)
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then((data: ProjectLocation[]) => {
        if (!abort) setLocations(data);
      })
      .catch(() => !abort && setError(t("common.map.loadPinsFailed")))
      .finally(() => !abort && setLoading(false));
    return () => {
      abort = true;
    };
  }, [projectId]);

  // Initialize map
  useEffect(() => {
    if (!LMod || !mapContainerRef.current || mapRef.current) return;
    const L = LMod;
    const center = locations[0]
      ? [locations[0].latitude, locations[0].longitude]
      : [21.0278, 105.8342]; // Hanoi default
    const map = L.map(mapContainerRef.current).setView(center as any, 10);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    if (editable) {
      map.on("click", async (e: any) => {
        if (modeRef.current !== "add") return;
        const { lat, lng } = e.latlng;
        setUnsavedPin({ latitude: lat, longitude: lng });
      });
    }

    // Observe container size changes to keep Leaflet sized correctly
    if (typeof ResizeObserver !== "undefined" && mapContainerRef.current) {
      const ro = new ResizeObserver(() => {
        map.invalidateSize();
      });
      ro.observe(mapContainerRef.current);
      resizeObserverRef.current = ro;
    }

    const onResize = () => {
      map.invalidateSize();
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    // Invalidate when the container becomes visible (e.g., switching tabs)
    if (typeof IntersectionObserver !== "undefined" && mapContainerRef.current) {
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            map.invalidateSize();
          }
        }
      }, { root: null, threshold: 0.01 });
      io.observe(mapContainerRef.current);
      intersectionObserverRef.current = io;
    }

    mapRef.current = map;

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      intersectionObserverRef.current?.disconnect();
      intersectionObserverRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [LMod, editable, locations, projectId]);

  // Render markers and handle drag updates
  useEffect(() => {
    if (!LMod || !mapRef.current) return;
    const L = LMod;

    // Ensure markers match state
    const existingIds = new Set(locations.map((l) => l.id));
    // Remove stale markers
    markerRefs.current.forEach((marker, id) => {
      if (!existingIds.has(id)) {
        marker.removeFrom(mapRef.current!);
        markerRefs.current.delete(id);
      }
    });

    // Add or update markers
    locations.forEach((loc) => {
      let marker = markerRefs.current.get(loc.id);
      if (!marker) {
        marker = L.marker([loc.latitude, loc.longitude], { draggable: false });
        marker.addTo(mapRef.current!);
        markerRefs.current.set(loc.id, marker);
      } else {
        marker.setLatLng([loc.latitude, loc.longitude]);
        marker.dragging?.disable();
      }
    });

    // Fit bounds to pins if any
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map((l) => [l.latitude, l.longitude]) as any);
      mapRef.current.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [LMod, locations, editable, projectId]);

  // Render/update unsaved marker when in add mode
  useEffect(() => {
    if (!LMod || !mapRef.current) return;
    const L = LMod;
    if (unsavedPin) {
      if (!unsavedMarkerRef.current) {
        unsavedMarkerRef.current = L.marker([unsavedPin.latitude, unsavedPin.longitude]);
        unsavedMarkerRef.current.addTo(mapRef.current);
      } else {
        unsavedMarkerRef.current.setLatLng([unsavedPin.latitude, unsavedPin.longitude]);
      }
    } else {
      if (unsavedMarkerRef.current) {
        unsavedMarkerRef.current.remove();
        unsavedMarkerRef.current = null;
      }
    }
  }, [LMod, unsavedPin]);

  // Geocoding search via internal proxy
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    let aborted = false;
    setSearching(true);
    const controller = new AbortController();
    const url = `/api/geocode?q=${encodeURIComponent(q)}`;
    fetch(url, {
      headers: {
        "Accept": "application/json",
      },
      signal: controller.signal,
    })
      .then(async (r) => {
        if (!r.ok) throw new Error("Search failed");
        return r.json();
      })
      .then((data) => {
        if (!aborted) setSearchResults(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!aborted) setSearchResults([]);
      })
      .finally(() => {
        if (!aborted) setSearching(false);
      });
    return () => {
      aborted = true;
      controller.abort();
    };
  }, [searchQuery]);

  const handleSelectSearchResult = (item: { display_name: string; lat: string; lon: string }) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    if (mapRef.current) {
      mapRef.current.setView([lat, lng] as any, Math.max(mapRef.current.getZoom(), 14));
    }
    if (modeRef.current === "add") {
      setUnsavedPin({ latitude: lat, longitude: lng });
    }
    setSearchResults([]);
  };

  const handleDelete = async (id: string) => {
    try {
      const r = await fetch(`/api/projects/${projectId}/locations/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error(await r.text());
      setLocations((prev) => prev.filter((l) => l.id !== id));
    } catch {
      setError(t("common.map.deletePinFailed"));
    }
  };

  const handleSaveUnsavedPin = async () => {
    if (!unsavedPin) return;
    const lat = Math.max(-90, Math.min(90, unsavedPin.latitude));
    const lng = Math.max(-180, Math.min(180, unsavedPin.longitude));
    try {
      const r = await fetch(`/api/projects/${projectId}/locations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
      });
      if (!r.ok) throw new Error(await r.text());
      const created: ProjectLocation = await r.json();
      setLocations((prev) => [...prev, created]);
      setUnsavedPin(null);
      if (unsavedMarkerRef.current) {
        unsavedMarkerRef.current.remove();
        unsavedMarkerRef.current = null;
      }
    } catch (err) {
      setError(t("common.map.addPinFailed"));
    }
  };

  return (
    <div className="rounded-lg border overflow-hidden bg-white shadow-sm">
      <div ref={mapContainerRef} className={`w-full ${heightClassName}`} />

      <div className="p-3 text-sm text-muted-foreground bg-muted flex items-center justify-between gap-2">
        <span className="flex-1">
          {loading
            ? t("common.map.loadingPins")
            : error
            ? error
            : editable && mode === "add"
            ? t("common.map.pinModeHint", { defaultValue: "Pin mode: Click map to place a pin, edit coordinates, then confirm to save." })
            : t("common.map.projectPins")}
        </span>
        <div className="flex items-center gap-2">
          <div className="relative w-[220px] sm:w-[280px]">
            <Input
              placeholder={t("common.map.searchPlaceholder", { defaultValue: "Search location" }) as string}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && searchResults.length > 0 ? (
              <div className="absolute z-20 mt-1 w-full rounded-md border bg-background shadow-sm max-h-48 overflow-auto">
                {searchResults.map((r, idx) => (
                  <button
                    key={`${r.lat}-${r.lon}-${idx}`}
                    className="block w-full text-left px-2 py-1 hover:bg-muted text-foreground text-xs"
                    onClick={() => handleSelectSearchResult(r)}
                  >
                    {r.display_name}
                  </button>
                ))}
              </div>
            ) : null}
            {searchQuery && searching && searchResults.length === 0 ? (
              <div className="absolute z-20 mt-1 w-full rounded-md border bg-background shadow-sm px-2 py-1 text-xs text-muted-foreground">
                {t("common.map.searching", { defaultValue: "Searching..." })}
              </div>
            ) : null}
          </div>
          {editable ? (
            <>
            <Button
              size="sm"
              variant={mode === "view" ? "default" : "ghost"}
              onClick={() => setMode("view")}
            >
              {t("common.map.viewMode", { defaultValue: "View" })}
            </Button>
            <Button
              size="sm"
              variant={mode === "add" ? "default" : "ghost"}
              onClick={() => setMode("add")}
            >
              {t("common.map.addPinMode", { defaultValue: "Add Pin" })}
            </Button>
            </>
          ) : null}
        </div>
      </div>

      {editable ? (
        <div className="p-3 border-t bg-background space-y-3">
          {mode === "add" ? (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{t("common.map.latitude", { defaultValue: "Latitude" })}</span>
                  <Input
                    value={unsavedPin ? unsavedPin.latitude : ""}
                    placeholder={t("common.map.latPlaceholder", { defaultValue: "Click map" }) as string}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v)) {
                        setUnsavedPin((prev) => prev ? { latitude: v, longitude: prev.longitude } : { latitude: v, longitude: 0 });
                      } else if (e.target.value === "") {
                        setUnsavedPin((prev) => prev ? { latitude: NaN as any, longitude: prev.longitude } : null);
                      }
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{t("common.map.longitude", { defaultValue: "Longitude" })}</span>
                  <Input
                    value={unsavedPin ? unsavedPin.longitude : ""}
                    placeholder={t("common.map.lngPlaceholder", { defaultValue: "Click map" }) as string}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v)) {
                        setUnsavedPin((prev) => prev ? { latitude: prev.latitude, longitude: v } : { latitude: 0, longitude: v });
                      } else if (e.target.value === "") {
                        setUnsavedPin((prev) => prev ? { latitude: prev.latitude, longitude: NaN as any } : null);
                      }
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveUnsavedPin} disabled={!unsavedPin || isNaN(unsavedPin.latitude) || isNaN(unsavedPin.longitude)}>
                  {t("common.map.savePin", { defaultValue: "Confirm Save" })}
                </Button>
              </div>
            </div>
          ) : null}

          {locations.length > 0 ? (
            <div className="space-y-2">
              {locations.map((l) => (
                <div key={l.id} className="flex items-center justify-between text-sm">
                  <span>
                    {l.label ? `${l.label} – ` : ""}
                    {l.latitude.toFixed(6)}, {l.longitude.toFixed(6)}
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(l.id)}>{t("common.map.delete")}</Button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
