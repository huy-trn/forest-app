import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useTranslation } from 'react-i18next';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { MapPin, Calendar, TreeDeciduous, Users, Eye } from 'lucide-react';

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
    lastUpdate: '2025-11-14',
    members: [
      { id: '1', name: 'Nguyễn Văn A', role: 'partner' },
      { id: '3', name: 'Lê Văn C', role: 'investor' }
    ],
    recentActivities: [
      { date: '2025-11-14', activity: 'Trồng 200 cây thông khu vực A-1' },
      { date: '2025-11-12', activity: 'Bảo dưỡng và làm cỏ khu vực B' }
    ]
  }
];

export function InvestorProjects() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('investor.projects.title')}</CardTitle>
          <CardDescription>{t('investor.projects.desc')}</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-6">
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
                <Badge variant="default">{project.status === 'active' ? t('investor.projects.active') : t('investor.projects.completed')}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{project.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">{t('investor.projects.area')}</p>
                  <p>{project.area}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('investor.projects.startDate')}</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <p>{project.startDate}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('investor.projects.treesPlanted')}</p>
                  <div className="flex items-center gap-2">
                    <TreeDeciduous className="w-4 h-4 text-green-600" />
                    <p>{project.treesPlanted.toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('investor.projects.target')}</p>
                  <p>{project.targetTrees.toLocaleString()} {t('investor.projects.trees')}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">{t('investor.projects.progress')}</p>
                  <p className="text-sm">{project.progress}%</p>
                </div>
                <Progress value={project.progress} />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-gray-600" />
                  <p className="text-sm text-gray-600">{t('investor.projects.members', { count: project.members.length })} ({project.members.length})</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {project.members.map((member) => (
                    <Badge key={member.id} variant="outline" className="text-xs">
                      {member.name} ({member.role === 'partner' ? t('investor.projects.partner') : t('investor.projects.investor')})
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t">
                <p className="text-sm text-gray-600 mb-2">{t('investor.projects.recent')}</p>
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

              <Button variant="outline" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                {t('investor.projects.detail')}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
