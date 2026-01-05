import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ProjectLocation } from "./types";
import { normalizePolygon } from "./utils";

type UseProjectLocationsReturn = {
  locations: ProjectLocation[];
  isLoading: boolean;
  addLocation: (location: Omit<ProjectLocation, "id">) => Promise<void>;
  updateLocation: (location: ProjectLocation) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
};

const normalizeLocation = (loc: any): ProjectLocation => ({
  id: loc.id,
  latitude: loc.latitude,
  longitude: loc.longitude,
  label: loc.label ?? null,
  name: loc.name ?? loc.label ?? null,
  description: loc.description ?? null,
  polygon: normalizePolygon(loc.polygon),
  createdAt: loc.createdAt,
  updatedAt: loc.updatedAt,
});

export function useProjectLocations(projectId: string): UseProjectLocationsReturn {
  const queryClient = useQueryClient();

  const locationsQuery = useQuery({
    queryKey: ["projectLocations", projectId],
    queryFn: async () => {
      const r = await fetch(`/api/projects/${projectId}/locations`);
      if (!r.ok) throw new Error(await r.text());
      const data = await r.json();
      return (Array.isArray(data) ? data : []).map(normalizeLocation);
    },
  });

  const addMutation = useMutation({
    mutationFn: async (payload: Omit<ProjectLocation, "id">) => {
      const r = await fetch(`/api/projects/${projectId}/locations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error(await r.text());
      return await r.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projectLocations", projectId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (location: ProjectLocation) => {
      const r = await fetch(`/api/projects/${projectId}/locations/${location.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(location),
      });
      if (!r.ok) throw new Error(await r.text());
      return await r.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projectLocations", projectId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const r = await fetch(`/api/projects/${projectId}/locations/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error(await r.text());
      return id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projectLocations", projectId] });
    },
  });

  const addLocation = async (location: Omit<ProjectLocation, "id">) => {
    await addMutation.mutateAsync(location);
  };

  const updateLocation = async (location: ProjectLocation) => {
    await updateMutation.mutateAsync(location);
  };

  const deleteLocation = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  return {
    locations: locationsQuery.data ?? [],
    isLoading: locationsQuery.isLoading || addMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    addLocation,
    updateLocation,
    deleteLocation,
  };
}
