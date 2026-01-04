import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { MapPin, Calendar, TreeDeciduous, Users } from "lucide-react";

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
  lastActivity?: string | null;
  members?: Array<{ id: string; name: string; role: string }>;
};

export function PartnerProjects() {
  const { t } = useTranslation();
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to load projects");
      return res.json() as Promise<Project[]>;
    },
  });

  const projects = projectsQuery.data || [];

  return (
    <div className="space-y-6">
      <Card className="border-emerald-100 bg-emerald-50/60">
        <CardContent className="flex items-center justify-between gap-3 py-4">
          <div>
            <CardTitle className="text-lg">{t("partner.projects.assigned")}</CardTitle>
            <CardDescription>{t("partner.projects.desc")}</CardDescription>
            <p className="text-xs text-emerald-800 mt-1">
              {t("partner.projects.projectsLabel", { defaultValue: "Projects" })}: {projects.length}
            </p>
          </div>
        </CardContent>
      </Card>

      {projectsQuery.isLoading ? (
        <p className="text-sm text-gray-500">Loading projects...</p>
      ) : projectsQuery.isError ? (
        <p className="text-sm text-red-600">Failed to load projects</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project) => (
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
                  <Badge variant="default">
                    {project.status === "active" ? t("partner.projects.active") : t("partner.projects.completed")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{project.description}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">{t("partner.projects.area")}</p>
                    <p>{project.area || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t("partner.projects.startDate")}</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <p>{project.startDate || "-"}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">{t("partner.projects.progress")}</p>
                    <p className="text-sm">{project.progress ?? 0}%</p>
                  </div>
                  <Progress value={project.progress ?? 0} />
                </div>

                <div className="flex items-center gap-2">
                  <TreeDeciduous className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">{t("partner.projects.treesPlanted")}</p>
                    <p>
                      {(project.treesPlanted ?? 0).toLocaleString()} / {(project.targetTrees ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-gray-600" />
                    <p className="text-sm text-gray-600">
                      {t("partner.projects.members", "Members", { count: project.members?.length || 0 })} ({project.members?.length || 0})
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {project.members?.map((member) => (
                      <Badge key={member.id} variant="outline" className="text-xs">
                        {member.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600 mb-1">{t("partner.projects.lastActivity")}</p>
                  <p className="text-sm">{project.lastActivity || "-"}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
