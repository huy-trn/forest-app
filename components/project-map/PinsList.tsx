import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { useTranslation } from "react-i18next";
import { useProjectLocations } from "./useProjectLocations";
import { useMapController } from "./useMapController";

type PinsListProps = {
  projectId: string;
  onEdit: (pinId: string) => void;
};

export function PinsList({ projectId, onEdit }: PinsListProps) {
  const { t } = useTranslation();
  const { locations, deleteLocation, isLoading } = useProjectLocations(projectId);
  const map = useMapController();

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">
        {t("common.map.loadingPins")}
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        {t("common.map.noPinsView")}
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-[520px]">
      <div className="space-y-3 pr-2">
        {locations.map((l) => {
          const handleCardClick = () => map.focusLatLng(l.latitude, l.longitude);
          const stop = (e: any) => e.stopPropagation();
          return (
            <div
              key={l.id}
              className="rounded-lg border p-3 bg-muted/30 space-y-3 cursor-pointer hover:border-primary/50 transition"
              onClick={handleCardClick}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">{l.name || l.label || t("common.map.unnamed")}</p>
                  <p className="text-xs text-muted-foreground">{l.latitude.toFixed(6)}, {l.longitude.toFixed(6)}</p>
                  {l.description ? (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{l.description}</p>
                  ) : null}
                </div>

                <div className="flex items-center gap-2" onClick={stop}>
                  <Button size="sm" variant="outline" onClick={() => onEdit(l.id)}>
                    {t("common.map.edit")}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteLocation(l.id)}>
                    {t("common.map.delete")}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
