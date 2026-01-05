import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useTranslation } from "react-i18next";
import { ProjectLocation } from "./types";
import { useCallback, useEffect, useMemo } from "react";
import { computeCentroid, parsePolygonText } from "./utils";


type PinDataSetter = ProjectLocation | ((prev: ProjectLocation) => ProjectLocation);

type LocationEditingProps = {
  data: Omit<ProjectLocation, "id">;
  onChange: (payload: PinDataSetter) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function LocationEditing({ data, onChange, onSave, onCancel }: LocationEditingProps) {
  const { t } = useTranslation();
  const clearPolygon = () => {
    onChange((prev) => ({
      ...prev,
      polygon: null,
    }));
  };
  const handlePolygonTextChange = (text: string) => {
    let polygon = null;
    try {
      polygon = parsePolygonText(text);
    } catch {
      // ignore
    }
    const center = polygon && polygon.length > 0 ? computeCentroid(polygon) : null;
    adjustCenter(polygon);
    onChange((prev) => ({
      ...prev,
      polygon,
    }));
  };

  const adjustCenter = useCallback( (polygon: ProjectLocation["polygon"])=>{
    const center = polygon && polygon.length > 0 ? computeCentroid(polygon) : null;
    if(center){
      onChange((prev) => ({
        ...prev,
        latitude: center ? center.latitude : prev.latitude,
        longitude: center ? center.longitude : prev.longitude,
      }));
    }
  },[onChange]);

  useEffect(()=>{
    adjustCenter(data.polygon);
  },[data.polygon, adjustCenter]);

  const polygonText = useMemo(() => {
    if (!data.polygon || data.polygon.length === 0) return "";
    return JSON.stringify(data.polygon);
  }, [data.polygon]);
  return (
    <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{t("common.map.addPin")}</p>
      </div>
      <div className="grid grid-cols-1 gap-2">
        <Input
          placeholder={t("common.map.name") as string}
          value={data.name}
          onChange={(e) => onChange((prev) => ({ ...prev, name: e.target.value }))}
        />
        <Textarea
          rows={2}
          placeholder={t("common.map.description") as string}
          value={data.description}
          onChange={(e) => onChange((prev) => ({ ...prev, description: e.target.value }))}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">{t("common.map.latPlaceholder")}</label>
            <Input
              value={data?.latitude ?? ""}
              placeholder={t("common.map.latPlaceholder") as string}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                onChange((prev) => ({
                  ...prev,
                  latitude: Number.isNaN(v) ? null : v,
                }));
              }}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">{t("common.map.lngPlaceholder")}</label>
            <Input
              value={data?.longitude ?? ""}
              placeholder={t("common.map.lngPlaceholder") as string}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                onChange((prev) => ({
                  ...prev,
                  longitude: Number.isNaN(v) ? null : v,
                }));
              }}
            />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{t("common.map.polygon")}</span>
            <Button size="sm" variant="outline" onClick={clearPolygon}>
              {t("common.reset")}
            </Button>
          </div>
          <Textarea
            rows={3}
            placeholder='e.g. [[21.0, 105.8],[21.02,105.84]]'
            value={polygonText}
            onChange={(e) => handlePolygonTextChange(e.target.value)}
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button size="sm" variant="outline" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button
          size="sm"
          onClick={onSave}
          disabled={
            data.latitude === null ||
            data.longitude === null ||
            Number.isNaN(data.latitude) ||
            Number.isNaN(data.longitude)
          }
        >
          {t("common.map.savePin")}
        </Button>
      </div>
    </div>
  );
}
