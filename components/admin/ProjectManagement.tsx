'use client';
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { FolderPlus, MapPin, Calendar, Users, Edit, Eye } from "lucide-react";
import { toast } from "sonner";
import { RichTextEditor } from "../ui/rich-text-editor";

interface Project {
  id: string;
  title: string;
  description?: string | null;
  descriptionRich?: string | null;
  status: string;
  forestType?: "natural" | "artificial" | null;
  country: string;
  province: string;
  area: string;
  createdDate: string;
  members: Array<{ id: string; name: string; role: string }>;
}

interface User {
  id: string;
  name: string;
  role: string;
}

export function ProjectManagement({ locale }: { locale: string }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    descriptionRich: '',
    country: 'Việt Nam',
    province: '',
    area: '',
    forestType: "natural" as "natural" | "artificial",
  });
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const forestTypeLabels: Record<"natural" | "artificial", string> = {
    natural: t("common.naturalForest"),
    artificial: t("common.artificialForest"),
  };

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to load projects");
      return res.json();
    },
  });

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to load users");
      return res.json();
    },
  });

  useEffect(() => {
    if (projectsQuery.data) {
      setProjects(
        (projectsQuery.data as Project[]).map((p: any) => ({
          ...p,
          createdDate: p.createdAt ?? p.createdDate,
          descriptionRich: (p as any).descriptionRich ?? p.description ?? "",
          description: (p as any).description ?? "",
          forestType: (p as any).forestType ?? "natural",
        }))
      );
    }
  }, [projectsQuery.data]);

  useEffect(() => {
    if (usersQuery.data) {
      setAllUsers(usersQuery.data as User[]);
    }
  }, [usersQuery.data]);

  const createProject = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newProject,
          description: newProject.descriptionRich || newProject.description,
          memberIds: selectedMembers,
        }),
      });
      if (!res.ok) throw new Error("Failed to create project");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setNewProject({ title: "", description: "", descriptionRich: "", country: "Việt Nam", province: "", area: "", forestType: "natural" });
      setSelectedMembers([]);
      setIsCreateDialogOpen(false);
      toast.success(t("admin.projectManagement.createSuccess"));
    },
    onError: (err) => {
      console.error(err);
      toast.error(t("common.error", { defaultValue: "Failed to create project" }));
    },
  });

  const updateProject = useMutation({
    mutationFn: async (projectId: string) => {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...selectedProject,
          description: selectedProject.descriptionRich ?? selectedProject.description,
          memberIds: selectedMembers,
        }),
      });
      if (!res.ok) throw new Error("Failed to update project");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setIsEditDialogOpen(false);
      setSelectedProject(null);
      setSelectedMembers([]);
      toast.success(t("admin.projectManagement.updateSuccess"));
    },
    onError: (err) => {
      console.error(err);
      toast.error(t("common.error", { defaultValue: "Failed to update project" }));
    },
  });

  const handleCreateProject = () => {
    createProject.mutate();
  };

  const handleUpdateProject = () => {
    if (!selectedProject) return;
    updateProject.mutate(selectedProject.id);
  };

  const openEditDialog = (project: Project) => {
    setSelectedProject(project);
    setSelectedMembers(project.members.map(m => m.id));
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card className="border-emerald-100 bg-emerald-50/60">
        <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
          <div>
            <CardTitle className="text-lg">{t('admin.projectManagement.title')}</CardTitle>
            <CardDescription>{t('admin.projectManagement.desc')}</CardDescription>
            <p className="text-xs text-emerald-800 mt-1">
              {t('admin.projectManagement.projects', { defaultValue: 'Projects' })}: {projects.length}
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <FolderPlus className="w-4 h-4 mr-2" />
                {t('admin.projectManagement.createBtn')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('admin.projectManagement.createTitle')}</DialogTitle>
                <DialogDescription>{t('admin.projectManagement.createDesc')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="project-title">{t('admin.projectManagement.nameLabel')}</Label>
                  <Input
                    id="project-title"
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    placeholder={t('admin.projectManagement.namePlaceholder')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="project-country">{t('admin.projectManagement.countryLabel')}</Label>
                    <Input
                      id="project-country"
                      value={newProject.country}
                      onChange={(e) => setNewProject({ ...newProject, country: e.target.value })}
                      placeholder={t('admin.projectManagement.countryPlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-province">{t('admin.projectManagement.provinceLabel')}</Label>
                    <Input
                      id="project-province"
                      value={newProject.province}
                      onChange={(e) => setNewProject({ ...newProject, province: e.target.value })}
                      placeholder={t('admin.projectManagement.provincePlaceholder')}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-area">{t('admin.projectManagement.areaLabel')}</Label>
                  <Input
                    id="project-area"
                    value={newProject.area}
                    onChange={(e) => setNewProject({ ...newProject, area: e.target.value })}
                    placeholder={t('admin.projectManagement.areaPlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-forest-type">{t("admin.projectManagement.forestTypeLabel", { defaultValue: "Forest type" })}</Label>
                  <Select
                    value={newProject.forestType}
                    onValueChange={(val) => setNewProject({ ...newProject, forestType: val as "natural" | "artificial" })}
                  >
                    <SelectTrigger id="project-forest-type">
                      <SelectValue placeholder={t("admin.projectManagement.forestTypePlaceholder", { defaultValue: "Select forest type" })} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="natural">{t("common.naturalForest")}</SelectItem>
                      <SelectItem value="artificial">{t("common.artificialForest")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-description">{t('admin.projectManagement.descLabel')}</Label>
                  <RichTextEditor
                    value={newProject.descriptionRich}
                    onChange={(val) => setNewProject({ ...newProject, descriptionRich: val, description: val })}
                    placeholder={t('admin.projectManagement.descPlaceholder')}
                    onAttachUpload={async (files) => {
                      const uploads = await Promise.all(
                        files.map(async (file) => {
                          const presignRes = await fetch("/api/uploads", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              name: file.name,
                              type: file.type,
                              projectId: selectedProject?.id || newProject.title || "public",
                            }),
                          });
                          if (!presignRes.ok) throw new Error("presign_failed");
                          const { uploadUrl, viewUrl } = await presignRes.json();
                          const uploadRes = await fetch(uploadUrl, {
                            method: "PUT",
                            headers: { "Content-Type": file.type },
                            body: file,
                          });
                          if (!uploadRes.ok) throw new Error("upload_failed");
                          return { src: viewUrl as string };
                        })
                      );
                      return uploads;
                    }}
                  />
                  <div className="text-xs text-muted-foreground">{t("admin.projectManagement.descHint", { defaultValue: "Supports images and formatting." })}</div>
                </div>
                <div className="space-y-2">
                  <Label>{t('admin.projectManagement.assignLabel')}</Label>
                  <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-3">
                    {allUsers.map((user) => (
                      <div key={user.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`user-${user.id}`}
                          checked={selectedMembers.includes(user.id)}
                          onCheckedChange={(checked: boolean) => {
                            if (checked) {
                              setSelectedMembers([...selectedMembers, user.id]);
                            } else {
                              setSelectedMembers(selectedMembers.filter(id => id !== user.id));
                            }
                          }}
                        />
                        <Label htmlFor={`user-${user.id}`} className="flex-1 cursor-pointer">
                          {user.name} <Badge variant="outline" className="ml-2">
                            {user.role === 'partner'
                              ? t('admin.projectManagement.partner')
                              : user.role === 'investor'
                                ? t('admin.projectManagement.investor')
                                : t('admin.projectManagement.admin')}</Badge>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <Button onClick={handleCreateProject} className="w-full">{t('admin.projectManagement.createBtn')}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('admin.projectManagement.editTitle')}</DialogTitle>
            <DialogDescription>{t('admin.projectManagement.editDesc')}</DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-project-title">{t('admin.projectManagement.nameLabel')}</Label>
                <Input
                  id="edit-project-title"
                  value={selectedProject.title}
                  onChange={(e) => setSelectedProject({ ...selectedProject, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-project-country">{t('admin.projectManagement.countryLabel')}</Label>
                  <Input
                    id="edit-project-country"
                    value={selectedProject.country}
                    onChange={(e) => setSelectedProject({ ...selectedProject, country: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-project-province">{t('admin.projectManagement.provinceLabel')}</Label>
                  <Input
                    id="edit-project-province"
                    value={selectedProject.province}
                    onChange={(e) => setSelectedProject({ ...selectedProject, province: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-project-area">{t('admin.projectManagement.areaLabel')}</Label>
                <Input
                  id="edit-project-area"
                  value={selectedProject.area}
                  onChange={(e) => setSelectedProject({ ...selectedProject, area: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-project-forest-type">{t("admin.projectManagement.forestTypeLabel", { defaultValue: "Forest type" })}</Label>
                <Select
                  value={selectedProject.forestType ?? "natural"}
                  onValueChange={(val) => setSelectedProject({ ...selectedProject, forestType: val as "natural" | "artificial" })}
                >
                  <SelectTrigger id="edit-project-forest-type">
                    <SelectValue placeholder={t("admin.projectManagement.forestTypePlaceholder", { defaultValue: "Select forest type" })} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="natural">{t("common.naturalForest")}</SelectItem>
                    <SelectItem value="artificial">{t("common.artificialForest")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-project-description">{t('admin.projectManagement.descLabel')}</Label>
                  <RichTextEditor
                    value={selectedProject.descriptionRich ?? selectedProject.description ?? ""}
                    onChange={(val) => setSelectedProject({ ...selectedProject, descriptionRich: val, description: val })}
                    placeholder={t('admin.projectManagement.descPlaceholder')}
                  onAttachUpload={async (files) => {
                    const uploads = await Promise.all(
                      files.map(async (file) => {
                        const presignRes = await fetch("/api/uploads", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              name: file.name,
                              type: file.type,
                              projectId: selectedProject.id || "public",
                            }),
                          });
                        if (!presignRes.ok) throw new Error("presign_failed");
                        const { uploadUrl, viewUrl } = await presignRes.json();
                        const uploadRes = await fetch(uploadUrl, {
                          method: "PUT",
                          headers: { "Content-Type": file.type },
                          body: file,
                        });
                        if (!uploadRes.ok) throw new Error("upload_failed");
                        return { src: viewUrl as string };
                      })
                    );
                    return uploads;
                  }}
                />
                <div className="text-xs text-muted-foreground">{t("admin.projectManagement.descHint", { defaultValue: "Supports images and formatting." })}</div>
              </div>
              <div className="space-y-2">
                <Label>{t('admin.projectManagement.assignLabel')}</Label>
                <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-3">
                  {allUsers.map((user) => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-user-${user.id}`}
                        checked={selectedMembers.includes(user.id)}
                        onCheckedChange={(checked: boolean) => {
                          if (checked) {
                            setSelectedMembers([...selectedMembers, user.id]);
                          } else {
                            setSelectedMembers(selectedMembers.filter(id => id !== user.id));
                          }
                        }}
                      />
                      <label htmlFor={`edit-user-${user.id}`} className="flex-1 cursor-pointer">
                        {user.name} <Badge variant="outline" className="ml-2">{user.role === 'partner' ? t('admin.projectManagement.partner') : t('admin.projectManagement.investor')}</Badge>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={handleUpdateProject} className="w-full">{t('admin.projectManagement.editBtn')}</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{project.title}</CardTitle>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                    {project.status === 'active' ? t('admin.projectManagement.active') : t('admin.projectManagement.completed')}
                  </Badge>
                  <Badge variant="outline">{forestTypeLabels[(project.forestType as "natural" | "artificial") || "natural"]}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                {project.province}, {project.country}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                {t('admin.projectManagement.created')}: {project.createdDate}
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-600 mb-1">{t('admin.projectManagement.areaLabel')}</p>
                <p>{project.area}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4" />
                  <p className="text-sm text-gray-600">{t('admin.projectManagement.members')} ({project.members.length})</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {project.members.map((member) => (
                    <Badge key={member.id} variant="outline" className="text-xs">
                      {member.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => openEditDialog(project)}>
                  <Edit className="w-4 h-4 mr-2" />
                  {t('admin.projectManagement.editBtn')}
                </Button>
                <Button asChild variant="ghost" size="sm">
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
    </div>
  );
}
