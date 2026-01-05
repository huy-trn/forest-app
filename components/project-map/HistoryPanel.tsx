import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { useTranslation } from "react-i18next";
import type { ProjectSnapshot } from "./types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type HistoryPanelProps = {
  projectId: string;
  onPreview: (v: ProjectSnapshot) => void;
};

function formatDate(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  return d.toLocaleString();
}

export function HistoryPanel({ projectId, onPreview }: HistoryPanelProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: history = [], isLoading } = useQuery({
    queryKey: ["project", projectId, "locations", "versions"],
    queryFn: async () => {
      const r = await fetch(`/api/projects/${projectId}/locations/versions`);
      if (!r.ok) throw new Error(await r.text());
      return await r.json() as ProjectSnapshot[];
    }
  })

  const rollBackMut = useMutation({
    mutationKey: ["project", projectId, "locations", "versions", "rollback"],
    mutationFn: async (versionId: string) => {
      const r = await fetch(`/api/projects/${projectId}/locations/versions?versionId=${encodeURIComponent(versionId)}`, {
        method: "POST",
      });
      if (!r.ok) throw new Error(await r.text());
      return await r.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["project", projectId, "locations", "versions"] });
      await queryClient.invalidateQueries({ queryKey: ["projectLocations", projectId] });
    },
  })

  return (
    <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
      {isLoading ? (
        <p className="text-xs text-muted-foreground">{t("common.map.loading")}</p>
      ) : history.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t("common.map.noHistory")}</p>
      ) : (
        <ScrollArea className="max-h-[520px]">
          <div className="space-y-2 pr-2">
            {history.map((v, idx) => {
              const isCurrent = idx === 0;
              const locTitle = v.locationName || t("common.map.unnamed");
              return (
                <div key={v.id} className="rounded border px-2 py-2 text-xs flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p className="font-medium">
                      {locTitle} · {v.operation}
                    </p>
                    <p className="text-muted-foreground">{formatDate(v.createdAt)}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {v.user?.name || v.user?.email || t("common.map.unknownUser")}
                    </p>
                  </div>
                  {!isCurrent ? (
                    <div className="flex flex-col gap-1">
                      <Button size="sm" variant="outline" onClick={() => onPreview(v)}>
                        {t("common.map.preview")}
                      </Button>
                      <Button size="sm" onClick={() => rollBackMut.mutate(v.id)} disabled={rollBackMut.isPending}>
                        {t("common.map.restore")}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-[11px] text-muted-foreground mt-1">{t("common.map.currentState", { defaultValue: "Trạng thái hiện tại" })}</div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
