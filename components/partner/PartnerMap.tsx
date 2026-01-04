"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ProjectMap } from "../ProjectMap";

type ProjectListItem = { id: string; title: string };

export function PartnerMap() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let abort = false;
    setLoading(true);
    fetch("/api/projects")
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then((data: any[]) => {
        if (abort) return;
        const list = data.map((p) => ({ id: p.id, title: p.title })) as ProjectListItem[];
        setProjects(list);
        setSelected((prev) => prev ?? (list[0]?.id ?? null));
      })
      .finally(() => !abort && setLoading(false));
    return () => {
      abort = true;
    };
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="project">{t("partner.map.project")}</Label>
          <Select value={selected ?? undefined} onValueChange={(v) => setSelected(v)}>
            <SelectTrigger id="project">
              <SelectValue placeholder={loading ? t("common.map.loadingProjects") : t("common.map.selectProject")} />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {t("partner.map.hintPins")}
          </p>
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden bg-white shadow-sm flex flex-col">
        {selected ? (
          <ProjectMap projectId={selected} editable heightClassName="h-[420px]" />
        ) : (
          <div className="p-6 text-sm text-muted-foreground">{loading ? t("common.map.loadingProjects") : t("common.map.noProjectSelected")}</div>
        )}
      </div>
    </div>
  );
}
