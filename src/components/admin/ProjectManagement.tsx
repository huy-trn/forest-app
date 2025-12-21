import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { FolderPlus, MapPin, Calendar, Users, Edit } from 'lucide-react';
import { toast } from 'sonner';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  country: string;
  province: string;
  area: string;
  createdDate: string;
  members: Array<{ id: string; name: string; role: string }>;
}

const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Dự án Rừng Thông Miền Bắc',
    description: 'Dự án trồng rừng thông quy mô lớn',
    status: 'active',
    country: 'Việt Nam',
    province: 'Lào Cai',
    area: '125 hecta',
    createdDate: '2024-01-20',
    members: [
      { id: '1', name: 'Nguyễn Văn A', role: 'partner' },
      { id: '3', name: 'Lê Văn C', role: 'investor' }
    ]
  },
  {
    id: '2',
    title: 'Phục hồi rừng Sồi',
    description: 'Dự án phục hồi rừng sồi và phong',
    status: 'active',
    country: 'Việt Nam',
    province: 'Nghệ An',
    area: '87 hecta',
    createdDate: '2024-02-15',
    members: [
      { id: '2', name: 'Trần Thị B', role: 'partner' }
    ]
  }
];

const mockUsers = [
  { id: '1', name: 'Nguyễn Văn A', role: 'partner' },
  { id: '2', name: 'Trần Thị B', role: 'partner' },
  { id: '3', name: 'Lê Văn C', role: 'investor' },
  { id: '4', name: 'Phạm Thị D', role: 'partner' },
  { id: '5', name: 'Hoàng Văn E', role: 'investor' },
];

export function ProjectManagement() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    country: 'Việt Nam',
    province: '',
    area: ''
  });
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const handleCreateProject = () => {
    const project: Project = {
      id: Math.random().toString(36).substr(2, 9),
      ...newProject,
      status: 'active',
      createdDate: new Date().toISOString().split('T')[0],
      members: mockUsers.filter(u => selectedMembers.includes(u.id))
    };
    setProjects([...projects, project]);
    setNewProject({ title: '', description: '', country: 'Việt Nam', province: '', area: '' });
    setSelectedMembers([]);
    setIsCreateDialogOpen(false);
  toast.success(t('admin.projectManagement.createSuccess'));
  };

  const handleUpdateProject = () => {
    if (!selectedProject) return;
    
    setProjects(projects.map(p => 
      p.id === selectedProject.id 
        ? { ...selectedProject, members: mockUsers.filter(u => selectedMembers.includes(u.id)) }
        : p
    ));
    setIsEditDialogOpen(false);
    setSelectedProject(null);
    setSelectedMembers([]);
  toast.success(t('admin.projectManagement.updateSuccess'));
  };

  const openEditDialog = (project: Project) => {
    setSelectedProject(project);
    setSelectedMembers(project.members.map(m => m.id));
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('admin.projectManagement.title')}</CardTitle>
              <CardDescription>{t('admin.projectManagement.desc')}</CardDescription>
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
                    <Label htmlFor="project-description">{t('admin.projectManagement.descLabel')}</Label>
                    <Textarea
                      id="project-description"
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      placeholder={t('admin.projectManagement.descPlaceholder')}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('admin.projectManagement.assignLabel')}</Label>
                    <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-3">
                      {mockUsers.map((user) => (
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
                          <label htmlFor={`user-${user.id}`} className="flex-1 cursor-pointer">
                            {user.name} <Badge variant="outline" className="ml-2">{user.role === 'partner' ? t('admin.projectManagement.partner') : t('admin.projectManagement.investor')}</Badge>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleCreateProject} className="w-full">{t('admin.projectManagement.createBtn')}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
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
                <Label htmlFor="edit-project-description">{t('admin.projectManagement.descLabel')}</Label>
                <Textarea
                  id="edit-project-description"
                  value={selectedProject.description}
                  onChange={(e) => setSelectedProject({ ...selectedProject, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('admin.projectManagement.assignLabel')}</Label>
                <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-3">
                  {mockUsers.map((user) => (
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
                <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                  {project.status === 'active' ? t('admin.projectManagement.active') : t('admin.projectManagement.completed')}
                </Badge>
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
              <p className="text-sm text-gray-600">{project.description}</p>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => openEditDialog(project)}>
                  <Edit className="w-4 h-4 mr-2" />
                  {t('admin.projectManagement.editBtn')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
