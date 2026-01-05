"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ProjectMap } from "@/components/ProjectMap";
import { MapControllerProvider } from "@/components/project-map/useMapController";
import type { ProjectData } from "@/components/project-map/types";
import { useProjectLocations } from "@/components/project-map/useProjectLocations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ProjectDetailClientProps = {
  projectId: string;
  isPublic?: boolean;
};

type ProjectMember = { id: string; name: string | null; role: string | null };
type ProjectDetail = ProjectData & {
  status?: string | null;
  members?: ProjectMember[];
  descriptionRich?: string | null;
};

function normalizeProject(data: any): ProjectDetail {
  return {
    id: data.id,
    title: data.title ?? data.name ?? "Project",
    description: data.descriptionRich ?? data.description ?? null,
    descriptionRich: data.descriptionRich ?? data.description ?? null,
    country: data.country ?? null,
    province: data.province ?? null,
    area: data.area ?? null,
    createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
    updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    status: data.status ?? null,
    members: Array.isArray(data.members)
      ? data.members.map((m: any) => ({ id: m.id, name: m.name ?? null, role: m.role ?? null }))
      : [],
  };
}

export default function ProjectDetailClient({ projectId, isPublic = false }: ProjectDetailClientProps) {
  const { t } = useTranslation();
  const { locations } = useProjectLocations(projectId);
  const pendingText = t("projectDetail.pending", { defaultValue: "Pending" });
  const { data, isLoading, isError } = useQuery({
    queryKey: ["project", projectId, { public: isPublic }],
    queryFn: async () => {
      const url = isPublic ? `/api/projects/${projectId}?public=true` : `/api/projects/${projectId}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(await res.text());

      return normalizeProject(await res.json());
    },
  });
  const [renderedHtml, setRenderedHtml] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    const html = data?.descriptionRich ?? data?.description ?? "";
    if (!html) {
      setRenderedHtml(null);
      setImageUrls([]);
      return;
    }
    const doc = new DOMParser().parseFromString(html, "text/html");
    setRenderedHtml(doc.body.innerHTML);
    const resolved = Array.from(doc.querySelectorAll("img"))
      .map((img) => img.src)
      .filter(Boolean)
      .slice(0, 6);
    setImageUrls(resolved);
  }, [data?.descriptionRich, data?.description]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground px-4 py-6">{t("projectDetail.loading")}</p>;
  }

  if (isError || !data) {
    return <p className="text-sm text-red-600 px-4 py-6">{t("projectDetail.error")}</p>;
  }

  const stats = [
    {
      label: t("projectDetail.createdLabel"),
      value: data.createdAt ? data.createdAt.toLocaleDateString() : pendingText,
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      label: t("projectDetail.updatedLabel", { defaultValue: "Updated" }),
      value: data.updatedAt ? data.updatedAt.toLocaleDateString() : pendingText,
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      label: t("projectDetail.membersLabel"),
      value: data.members && data.members.length > 0 ? data.members.length : pendingText,
      icon: <Users className="w-4 h-4" />,
    },
    {
      label: t("projectDetail.areaLabel"),
      value: data.area || pendingText,
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      label: t("projectDetail.locationsLabel"),
      value: locations && locations.length > 0 ? locations.length : pendingText,
      icon: <Users className="w-4 h-4" />,
    },
    {
      label: t("projectDetail.idLabel"),
      value: data.id,
      icon: <Calendar className="w-4 h-4" />,
      muted: true,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card className="h-full">
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl">{data.title}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {[data.province, data.country].filter(Boolean).join(", ") ||
                      `${t("partner.projects.province", { defaultValue: "Province" })}, ${t("partner.projects.country", { defaultValue: "Country" })}`}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {data.status ? <Badge variant="secondary">{data.status}</Badge> : null}
                {data.area ? <Badge variant="outline">{data.area}</Badge> : null}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded border bg-muted/40 p-3 space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {stat.icon}
                    <span>{stat.label}</span>
                  </div>
                  <p className={`font-medium ${stat.muted ? "text-xs break-all text-muted-foreground" : ""}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground prose prose-sm max-w-none">
              {renderedHtml ? (
                <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
              ) : (
                <p>{data.description || t("projectDetail.descriptionFallback")}</p>
              )}
            </div>

            {imageUrls.length ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("projectDetail.galleryLabel", { defaultValue: "Gallery" })}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {imageUrls.map((url, idx) => (
                    <div key={`${url}-${idx}`} className="rounded-lg overflow-hidden border bg-muted">
                      <img src={url} alt={`Project ${idx + 1}`} className="w-full h-32 object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {!isPublic && data.members && data.members.length ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("projectDetail.teamLabel")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.members.map((m) => (
                    <Badge key={m.id} variant="outline">
                      {m.name || t("projectDetail.memberFallback")} {m.role ? `· ${m.role}` : ""}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card className="h-full">
            <CardHeader>
              <CardTitle>{t("partner.dashboard.forestMap")}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <MapControllerProvider>
                <ProjectMap project={data} toolsOpen={false} heightClassName="h-[360px] md:h-[420px]" />
              </MapControllerProvider>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("projectDetail.locationsList")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {locations?.length ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {locations.map((loc) => (
                <div key={loc.id} className="rounded border bg-muted/50 p-3 space-y-1">
                  <p className="font-medium">{loc.name || loc.label || t("projectDetail.memberFallback")}</p>
                  <p className="text-xs text-muted-foreground">
                    {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{pendingText}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
