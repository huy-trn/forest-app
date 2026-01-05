"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { ProjectMap } from "../ProjectMap";
import { MapControllerProvider } from "./useMapController";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { ProjectData } from "./types";

type ProjectsMapPanelProps = {
  editable?: boolean;
  heightClassName?: string;
};

export function ProjectsMapPanel({ editable = true, heightClassName = "h-[480px] md:h-[560px]" }: ProjectsMapPanelProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<ProjectData | null>(null);
  const [toolsOpen, setToolsOpen] = useState(false);
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const r = await fetch("/api/projects");
      if (!r.ok) throw new Error(await r.text());
      return (await r.json()) as ProjectData[];
    },
  });
  useEffect(() => {
    if (isLoading || projects.length === 0) return;
    if (!selected) {
      setSelected(projects[0]);
      return;
    }
    const exists = projects.find((p) => p.id === selected.id);
    if (!exists) {
      setSelected(projects[0]);
    }
  }, [isLoading, projects]);

  return (
    <div className="rounded-lg border overflow-hidden bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b bg-muted/40 px-4 py-3">
        <div className="min-w-[180px]">
          <Select disabled={isLoading} value={selected?.id ?? undefined} onValueChange={(v) => setSelected(projects.find((p) => p.id === v) ?? null)}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder={t("common.map.selectProject")} />
            </SelectTrigger>
            <SelectContent className="z-[1200]">
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>
          {editable && (
            <Button
              size="sm"
              variant={toolsOpen ? "default" : "outline"}
              onClick={() => {
                setToolsOpen((prev) => !prev);
              }}
            >
              {toolsOpen ? t("common.map.hideTools") : t("common.map.showTools")}
            </Button>
          )}
      </div>
      {selected ? (
        <MapControllerProvider>
          <ProjectMap
            toolsOpen={toolsOpen}
            project={selected}
            heightClassName={heightClassName}
          />
        </MapControllerProvider>
      ) : null}
    </div>
  );
}
