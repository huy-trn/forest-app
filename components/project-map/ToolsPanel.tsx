"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { LocationEditing } from "./LocationEditing";
import { HistoryPanel } from "./HistoryPanel";
import { PinsList } from "./PinsList";
import { useProjectLocations } from "./useProjectLocations";
import { useMapController } from "./useMapController";
import type { ProjectData, ProjectLocation, ProjectSnapshot } from "./types";
import { useQuery } from "@tanstack/react-query";
import { normalizePolygon } from "./utils";

type ToolsPanelProps = {
  project: ProjectData
};
const DEFAULT_DRAFT: Omit<ProjectLocation, "id"> = {
  name: "New location",
  description: "",
  latitude: null,
  longitude: null,
  polygon: [],
}

export function ToolsPanel({ project }: ToolsPanelProps) {
  const { t } = useTranslation();
  const map = useMapController();
  const { locations, addLocation, updateLocation, isLoading } = useProjectLocations(project.id);
  const [panel, setPanel] = useState<"pins" | "history">("pins");
  const [draft, setDraft] = useState<typeof DEFAULT_DRAFT | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [preview, setPreview] = useState<ProjectSnapshot | null>(null);
  const isEditing = useMemo(() => draft !== null, [draft]);
  const { data: projectLoc } = useQuery({
    queryKey: ["provinceLocation", project.id],
    enabled: !!project,
    queryFn: async () => {
      const searchTerm = project.province || project.country || t("country");
      const r = await fetch(`/api/geocode?q=${encodeURIComponent(searchTerm.trim())}`, {
        headers: { "Accept": "application/json" },
      });
      if (!r.ok) throw new Error(await r.text());
      const data = await r.json();
      if (data && Array.isArray(data) && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        }
      } else {
        return null;
      }
    }
  })
  const handleCancelEditing = () => {
    setDraft(null);
    setEditingId(null);
  }
  const handleSaveEditing = () => {
    if (!draft) return;
    if (editingId === null) {
      addLocation(draft)
        .then(() => setDraft(null))
        .catch(() => { /* handled by hook */ });
    } else {
      updateLocation({ id: editingId, ...draft })
        .then(() => setDraft(null))
        .catch(() => { /* handled by hook */ });
    }
  };


  useEffect(() => {
    if (!isEditing) {
      map.removePolygon("draft");
      map.removeMarker("draft");
      map.removePolygon("old");
      map.removeMarker("old");
      map.setClickHandler(undefined);
      // map.setInteractionEnabled(true);
      return;
    }
    // map.setInteractionEnabled(false);
    map.setClickHandler((lat, lng) => {
      setDraft((prev) => {
        const current = prev ?? { ...DEFAULT_DRAFT };
        const polygon = current.polygon ?? [];
        const nextPolygon = [...polygon, { lat, lng }];
        return {
          ...current,
          latitude: current.latitude ?? lat,
          longitude: current.longitude ?? lng,
          polygon: nextPolygon,
        };
      });
    });
  }, [isEditing, map, setDraft]);

  useEffect(() => {
    if (!isEditing) return;
    map.removePolygon("*");
    map.removeMarker("*");
    if (editingId) {
      const old = locations.find((l) => l.id === editingId);
      if (old) {
        map.setPolygon({ id: "old", points: old.polygon || [], color: "#e4851fff", weight: 1, fillOpacity: 0.04 });
        map.setMarker("old", { lat: old.latitude, lng: old.longitude, tooltip: old.name || t("common.map.unnamed") });
      }
    }
    map.focusLatLng(draft.latitude ?? 0, draft.longitude ?? 0);
  }, [isEditing, editingId, map, t, locations]);


  useEffect(() => {
    if (!isEditing) return;
    map.setPolygon({ id: "draft", points: draft.polygon });
  }, [isEditing, draft?.polygon, map]);

  useEffect(() => {
    if (!isEditing) return;
    map.setMarker("draft", { lat: draft.latitude ?? 0, lng: draft.longitude ?? 0, tooltip: draft.name || t("common.map.unnamed") });
  }, [isEditing, draft?.latitude, draft?.longitude, draft?.name, map, t]);

  useEffect(() => {
    if (panel !== "history") {
      setPreview(null);
    }
  }, [panel]);

  useEffect(() => {
    setPreview(null);
  }, [project.id]);

  useEffect(() => {
    const previewMarkers = map.getMarkerIds().filter((id) => id.startsWith("preview-"));
    const previewPolygons = map.getPolygonIds().filter((id) => id.startsWith("preview-"));
    previewMarkers.forEach((id) => map.removeMarker(id));
    previewPolygons.forEach((id) => map.removePolygon(id));
    if (!preview) return;
    const bounds: [number, number][] = [];
    preview.locations.forEach((loc) => {
      const markerId = `preview-${loc.id}`;
      map.setMarker(markerId, { lat: loc.latitude, lng: loc.longitude, tooltip: loc.name || loc.label || t("common.map.unnamed") });
      bounds.push([loc.latitude, loc.longitude]);
      const poly = normalizePolygon(loc.polygon);
      if (poly && poly.length) {
        map.setPolygon({ id: markerId, points: poly, color: "#0ea5e9", weight: 2, fillOpacity: 0.1 });
        poly.forEach((p) => bounds.push([p.lat, p.lng]));
      }
    });
    map.fitBounds(bounds);
  }, [map, preview, t]);

  const handleStartEditing = (id: string | null) => {
    if (id === null) {
      const draft = {
        ...DEFAULT_DRAFT,
        latitude: projectLoc?.latitude || 0,
        longitude: projectLoc?.longitude || 0,
      }
      setDraft(draft);
    } else {
      const loc = locations.find((l) => l.id === id);
      if (loc) {
        setEditingId(id);
        setDraft({
          ...loc,
          polygon: null,
        });
      }
    }
  }
  return (
    <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
      <Tabs value={panel} onValueChange={(val) => setPanel(val as "pins" | "history")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pins">{isLoading ? t("common.loading") : t("common.map.pins")}</TabsTrigger>
          <TabsTrigger value="history">{t("common.map.history")}</TabsTrigger>
        </TabsList>

        <TabsContent value="pins">
          <div className="rounded-lg border bg-white shadow-sm p-3 space-y-3">
            {isEditing
              ? <LocationEditing data={draft || DEFAULT_DRAFT}
                onChange={setDraft}
                onSave={handleSaveEditing}
                onCancel={handleCancelEditing}
              />
              : (
                <>
                  <div className="flex justify-start">
                    <Button size="sm" onClick={() => handleStartEditing(null)}>
                      {t("common.map.addPin")}
                    </Button>
                  </div>
                  <PinsList
                    projectId={project.id}
                    onEdit={handleStartEditing}
                  />
                </>
              )
            }
          </div>
        </TabsContent>

        <TabsContent value="history">
          <HistoryPanel
            projectId={project.id}
            onPreview={(snapshot) => {
              setPreview(snapshot);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
