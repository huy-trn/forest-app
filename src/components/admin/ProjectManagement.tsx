import { useState } from 'react';
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
import { toast } from 'sonner@2.0.3';

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
      { id: '1', name: 'Nguyễn Văn A', role: 'farmer' },
      { id: '3', name: 'Lê Văn C', role: 'buyer' }
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
      { id: '2', name: 'Trần Thị B', role: 'farmer' }
    ]
  }
];

const mockUsers = [
  { id: '1', name: 'Nguyễn Văn A', role: 'farmer' },
  { id: '2', name: 'Trần Thị B', role: 'farmer' },
  { id: '3', name: 'Lê Văn C', role: 'buyer' },
  { id: '4', name: 'Phạm Thị D', role: 'farmer' },
  { id: '5', name: 'Hoàng Văn E', role: 'buyer' },
];

export function ProjectManagement() {
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
    toast.success('Đã tạo dự án thành công');
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
    toast.success('Đã cập nhật dự án thành công');
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
              <CardTitle>Quản lý dự án</CardTitle>
              <CardDescription>Tạo và quản lý các dự án trồng rừng</CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <FolderPlus className="w-4 h-4 mr-2" />
                  Tạo dự án mới
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tạo dự án mới</DialogTitle>
                  <DialogDescription>Thiết lập dự án quản lý rừng mới</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="project-title">Tên dự án</Label>
                    <Input
                      id="project-title"
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      placeholder="Nhập tên dự án"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="project-country">Quốc gia</Label>
                      <Input
                        id="project-country"
                        value={newProject.country}
                        onChange={(e) => setNewProject({ ...newProject, country: e.target.value })}
                        placeholder="Việt Nam"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project-province">Tỉnh/Thành phố</Label>
                      <Input
                        id="project-province"
                        value={newProject.province}
                        onChange={(e) => setNewProject({ ...newProject, province: e.target.value })}
                        placeholder="Nhập tỉnh/thành phố"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project-area">Diện tích (hecta)</Label>
                    <Input
                      id="project-area"
                      value={newProject.area}
                      onChange={(e) => setNewProject({ ...newProject, area: e.target.value })}
                      placeholder="Ví dụ: 125"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project-description">Mô tả</Label>
                    <Textarea
                      id="project-description"
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      placeholder="Nhập mô tả dự án"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Gán thành viên</Label>
                    <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-3">
                      {mockUsers.map((user) => (
                        <div key={user.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`user-${user.id}`}
                            checked={selectedMembers.includes(user.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedMembers([...selectedMembers, user.id]);
                              } else {
                                setSelectedMembers(selectedMembers.filter(id => id !== user.id));
                              }
                            }}
                          />
                          <label htmlFor={`user-${user.id}`} className="flex-1 cursor-pointer">
                            {user.name} <Badge variant="outline" className="ml-2">{user.role === 'farmer' ? 'Nông dân' : 'Nhà đầu tư'}</Badge>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleCreateProject} className="w-full">Tạo dự án</Button>
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
            <DialogTitle>Cập nhật dự án</DialogTitle>
            <DialogDescription>Chỉnh sửa thông tin và gán thành viên</DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-project-title">Tên dự án</Label>
                <Input
                  id="edit-project-title"
                  value={selectedProject.title}
                  onChange={(e) => setSelectedProject({ ...selectedProject, title: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-project-country">Quốc gia</Label>
                  <Input
                    id="edit-project-country"
                    value={selectedProject.country}
                    onChange={(e) => setSelectedProject({ ...selectedProject, country: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-project-province">Tỉnh/Thành phố</Label>
                  <Input
                    id="edit-project-province"
                    value={selectedProject.province}
                    onChange={(e) => setSelectedProject({ ...selectedProject, province: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-project-area">Diện tích (hecta)</Label>
                <Input
                  id="edit-project-area"
                  value={selectedProject.area}
                  onChange={(e) => setSelectedProject({ ...selectedProject, area: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-project-description">Mô tả</Label>
                <Textarea
                  id="edit-project-description"
                  value={selectedProject.description}
                  onChange={(e) => setSelectedProject({ ...selectedProject, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Gán thành viên</Label>
                <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-3">
                  {mockUsers.map((user) => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-user-${user.id}`}
                        checked={selectedMembers.includes(user.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedMembers([...selectedMembers, user.id]);
                          } else {
                            setSelectedMembers(selectedMembers.filter(id => id !== user.id));
                          }
                        }}
                      />
                      <label htmlFor={`edit-user-${user.id}`} className="flex-1 cursor-pointer">
                        {user.name} <Badge variant="outline" className="ml-2">{user.role === 'farmer' ? 'Nông dân' : 'Nhà đầu tư'}</Badge>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleUpdateProject} className="w-full">Cập nhật dự án</Button>
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
                  {project.status === 'active' ? 'Hoạt động' : 'Hoàn thành'}
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
                Tạo: {project.createdDate}
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-600 mb-1">Diện tích</p>
                <p>{project.area}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4" />
                  <p className="text-sm text-gray-600">Thành viên ({project.members.length})</p>
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
                  Cập nhật
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
