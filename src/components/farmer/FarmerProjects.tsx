import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { MapPin, Calendar, TreeDeciduous, Users } from 'lucide-react';

const myProjects = [
  {
    id: '1',
    title: 'Dự án Rừng Thông Miền Bắc',
    description: 'Dự án trồng rừng thông quy mô lớn',
    country: 'Việt Nam',
    province: 'Lào Cai',
    area: '125 hecta',
    status: 'active',
    progress: 65,
    startDate: '2024-01-20',
    treesPlanted: 9750,
    targetTrees: 15000,
    lastActivity: '2025-11-14',
    members: [
      { id: '1', name: 'Nguyễn Văn A', role: 'farmer' },
      { id: '3', name: 'Lê Văn C', role: 'buyer' }
    ]
  },
  {
    id: '2',
    title: 'Phục hồi rừng Sồi',
    description: 'Dự án phục hồi rừng sồi và phong',
    country: 'Việt Nam',
    province: 'Nghệ An',
    area: '87 hecta',
    status: 'active',
    progress: 45,
    startDate: '2024-02-15',
    treesPlanted: 4000,
    targetTrees: 8700,
    lastActivity: '2025-11-12',
    members: [
      { id: '2', name: 'Trần Thị B', role: 'farmer' }
    ]
  }
];

export function FarmerProjects() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dự án được gán</CardTitle>
          <CardDescription>Các dự án bạn đang tham gia</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {myProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <MapPin className="w-4 h-4" />
                    {project.province}, {project.country}
                  </div>
                </div>
                <Badge variant="default">{project.status === 'active' ? 'Đang hoạt động' : 'Hoàn thành'}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{project.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Diện tích</p>
                  <p>{project.area}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày bắt đầu</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <p>{project.startDate}</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Tiến độ</p>
                  <p className="text-sm">{project.progress}%</p>
                </div>
                <Progress value={project.progress} />
              </div>

              <div className="flex items-center gap-2">
                <TreeDeciduous className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Cây đã trồng</p>
                  <p>{project.treesPlanted.toLocaleString()} / {project.targetTrees.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-gray-600" />
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

              <div className="pt-3 border-t">
                <p className="text-sm text-gray-600 mb-1">Hoạt động gần nhất</p>
                <p className="text-sm">{project.lastActivity}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
