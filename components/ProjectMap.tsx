"use client";

import { useEffect } from "react";
import { SearchBox } from "./project-map/SearchBox";
import { ToolsPanel } from "./project-map/ToolsPanel";
import { ProjectData } from "./project-map/types";
import { useMapController } from "./project-map/useMapController";
import { useProjectLocations } from "./project-map/useProjectLocations";

type ProjectMapProps = {
  toolsOpen: boolean;
  project: ProjectData;
  heightClassName: string;
};

export function ProjectMap({ project, toolsOpen, heightClassName }: ProjectMapProps) {
  const { mapContainerRef, setMarker, removeMarker, setPolygon, removePolygon, getMarkerIds, getPolygonIds, fitBounds, invalidateSize, isReady } = useMapController();
  const { locations, isLoading } = useProjectLocations(project.id);

  useEffect(() => {
    if (isLoading || !isReady) return;
    const ids = new Set<string>();
    const bounds: [number, number][] = [];
    locations.forEach((loc) => {
      ids.add(loc.id);
      setMarker(loc.id, {
        lat: loc.latitude,
        lng: loc.longitude,
        tooltip: loc.name || loc.label || `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`,
      });
      bounds.push([loc.latitude, loc.longitude]);
      if (loc.polygon && loc.polygon.length > 0) {
        setPolygon({ id: loc.id, points: loc.polygon });
        loc.polygon.forEach((p) => bounds.push([p.lat, p.lng]));
      } else {
        removePolygon(loc.id);
      }
    });
    getMarkerIds().forEach((id) => {
      if (id !== "draft" && !ids.has(id)) {
        removeMarker(id);
      }
    });
    getPolygonIds().forEach((id) => {
      if (id !== "draft" && !ids.has(id)) {
        removePolygon(id);
      }
    });
    fitBounds(bounds);
  }, [fitBounds, getMarkerIds, getPolygonIds, isLoading, locations, removeMarker, removePolygon, setMarker, setPolygon]);

  useEffect(() => {
    if (!isReady) return;
    const timer = setTimeout(() => {
      invalidateSize();
    }, 50);
    return () => clearTimeout(timer);
  }, [invalidateSize, isReady, toolsOpen]);
  return (
    <div className="rounded-lg border overflow-hidden bg-white shadow-sm">
      <div className={`grid gap-4 p-4 ${toolsOpen ? "lg:grid-cols-[1.6fr_1fr]" : "grid-cols-1"}`}>
        <div className="space-y-3">
          <div className={`relative overflow-visible ${heightClassName}`}>
            <div ref={mapContainerRef} className="absolute inset-0 rounded-lg border" />
            <div className="absolute left-4 right-4 top-4 z-[1000] pointer-events-none">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pointer-events-auto">
                <div className="flex-1 min-w-0 sm:max-w-[70%] ml-12 sm:ml-16 p-1 bg-background/80 rounded">
                  <SearchBox />
                </div>
              </div>
            </div>
          </div>
        </div>

        {toolsOpen && (
          <ToolsPanel
            project={project}
          />
        )}
      </div>
    </div>
  );
}
