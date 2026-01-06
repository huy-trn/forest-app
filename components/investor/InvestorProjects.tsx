import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { MapPin, Calendar, TreeDeciduous, Users, Eye } from "lucide-react";

type Project = {
  id: string;
  title: string;
  description?: string | null;
  country?: string | null;
  province?: string | null;
  area?: string | null;
  status?: string | null;
  progress?: number | null;
  startDate?: string | null;
  treesPlanted?: number | null;
  targetTrees?: number | null;
  lastUpdate?: string | null;
  forestType?: "natural" | "artificial" | null;
  members?: Array<{ id: string; name: string; role: string }>;
  recentActivities?: Array<{ date: string; activity: string }>;
};

export function InvestorProjects({ locale }: { locale: string }) {
  const { t } = useTranslation();
  const [forestTypeFilter, setForestTypeFilter] = useState<"all" | "natural" | "artificial">("all");
  const forestTypeLabels: Record<"natural" | "artificial", string> = {
    natural: t("common.naturalForest"),
    artificial: t("common.artificialForest"),
  };
  const normalizeForestType = (type?: string | null) => (type === "artificial" ? "artificial" : "natural");
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to load projects");
      return res.json() as Promise<Project[]>;
    },
  });

  const projects = projectsQuery.data || [];
  const filteredProjects =
    forestTypeFilter === "all" ? projects : projects.filter((p) => normalizeForestType(p.forestType) === forestTypeFilter);

  return (
    <div className="space-y-6">
      <Card className="border-emerald-100 bg-emerald-50/60">
        <CardContent className="flex items-center justify-between gap-3 py-4">
          <div>
            <CardTitle className="text-lg">{t("investor.projects.title")}</CardTitle>
            <CardDescription>{t("investor.projects.desc")}</CardDescription>
            <p className="text-xs text-emerald-800 mt-1">
              {t("partner.projects.projectsLabel", { defaultValue: "Projects" })}: {projects.length}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm text-gray-600">{t("common.forestType", { defaultValue: "Forest type" })}:</p>
        {(["all", "natural", "artificial"] as const).map((type) => (
          <Button
            key={type}
            size="sm"
            variant={forestTypeFilter === type ? "default" : "outline"}
            onClick={() => setForestTypeFilter(type)}
          >
            {type === "all" ? t("common.allTypes", { defaultValue: "All" }) : forestTypeLabels[type]}
          </Button>
        ))}
      </div>

      {projectsQuery.isLoading ? (
        <p className="text-sm text-gray-500">Loading projects...</p>
      ) : projectsQuery.isError ? (
        <p className="text-sm text-red-600">Failed to load projects</p>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <MapPin className="w-4 h-4" />
                      {(project.province || t("partner.projects.province", { defaultValue: "Province" }))},{" "}
                      {project.country || t("partner.projects.country", { defaultValue: "Country" })}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="default">
                      {project.status === "active" ? t("investor.projects.active") : t("investor.projects.completed")}
                    </Badge>
                    <Badge variant="secondary">{forestTypeLabels[normalizeForestType(project.forestType)]}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">{t("investor.projects.area")}</p>
                    <p>{project.area || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t("investor.projects.startDate")}</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <p>{project.startDate || "-"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t("investor.projects.treesPlanted")}</p>
                    <div className="flex items-center gap-2">
                      <TreeDeciduous className="w-4 h-4 text-green-600" />
                      <p>{(project.treesPlanted ?? 0).toLocaleString()}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t("investor.projects.target")}</p>
                    <p>
                      {(project.targetTrees ?? 0).toLocaleString()} {t("investor.projects.trees")}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">{t("investor.projects.progress")}</p>
                    <p className="text-sm">{project.progress ?? 0}%</p>
                  </div>
                  <Progress value={project.progress ?? 0} />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-gray-600" />
                    <p className="text-sm text-gray-600">
                      {t("investor.projects.members", { count: project.members?.length || 0 })} ({project.members?.length || 0})
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {project.members?.map((member) => (
                      <Badge key={member.id} variant="outline" className="text-xs">
                        {member.name} ({member.role === "partner" ? t("investor.projects.partner") : t("investor.projects.investor")})
                      </Badge>
                    ))}
                  </div>
                </div>

                {project.recentActivities?.length ? (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-gray-600 mb-2">{t("investor.projects.recent")}</p>
                    <div className="space-y-2">
                      {project.recentActivities.map((activity, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-gray-600">{activity.date}</p>
                            <p>{activity.activity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="flex justify-end">
                  <Button asChild variant="ghost" size="sm" className="text-emerald-700 hover:text-emerald-900">
                    <Link href={`/${locale}/dashboard/projects/${project.id}`} className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {t("investor.projects.detail", { defaultValue: "View detail" })}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
