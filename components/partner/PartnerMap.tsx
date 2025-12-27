"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";

const STORAGE_KEY = "partner-forest-pin";

export function PartnerMap() {
  const { t } = useTranslation();
  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { lat, lng } = JSON.parse(saved);
        setLat(lat ?? "");
        setLng(lng ?? "");
      }
    } catch {
      // ignore
    }
  }, []);

  const embedUrl = useMemo(() => {
    const centerLat = lat || "21.0278";
    const centerLng = lng || "105.8342";
    return `https://maps.google.com/maps?q=${encodeURIComponent(centerLat)},${encodeURIComponent(centerLng)}&z=11&output=embed`;
  }, [lat, lng]);

  const handleSave = () => {
    setStatus(null);
    setError(null);
    if (!lat || !lng) {
      setError(t("partner.map.required"));
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lng }));
    setStatus(t("partner.map.saved"));
  };

  const handleClear = () => {
    setLat("");
    setLng("");
    setStatus(null);
    setError(null);
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

      <div className="rounded-lg border overflow-hidden bg-white shadow-sm">
        <iframe
          key={embedUrl}
          title="forest-map"
          src={embedUrl}
          className="w-full h-[420px] border-0"
          loading="lazy"
          allowFullScreen
        />
        <div className="p-3 text-sm text-muted-foreground bg-muted">
          <a
            className="text-primary underline"
            href={`https://maps.google.com/?q=${encodeURIComponent(lat || "21.0278")},${encodeURIComponent(lng || "105.8342")}`}
            target="_blank"
            rel="noreferrer"
          >
            {t("partner.map.openExternal")}
          </a>
        </div>
      </div>
    </div>
  );
}
