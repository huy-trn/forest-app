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
import { Plus, Calendar, MessageSquare } from 'lucide-react';
import { toast } from 'sonner'

interface InvestorRequest {
  id: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  createdDate: string;
  response?: string;
}

const mockRequests: InvestorRequest[] = [
  {
    id: '1',
    title: 'Yêu cầu báo cáo tiến độ Q4',
    description: 'Cần báo cáo chi tiết về tiến độ trồng cây quý 4/2024',
    projectId: '1',
    projectName: 'Dự án Rừng Thông Miền Bắc',
    status: 'processing',
    createdDate: '2025-11-10'
  },
  {
    id: '3',
    title: 'Yêu cầu ảnh hiện trạng dự án',
    description: 'Cần ảnh chụp hiện trạng khu rừng đã trồng để báo cáo cho ban lãnh đạo',
    projectId: '1',
    projectName: 'Dự án Rừng Thông Miền Bắc',
    status: 'completed',
    createdDate: '2025-11-05',
    response: 'Đã gửi bộ ảnh và báo cáo chi tiết qua email'
  }
];

const mockProjects = [
  { id: '1', name: 'Dự án Rừng Thông Miền Bắc' }
];

export function InvestorRequestsView() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<InvestorRequest[]>(mockRequests);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    projectId: ''
  });

  const handleCreateRequest = () => {
    const project = mockProjects.find(p => p.id === newRequest.projectId);
    if (!project) return;

    const request: InvestorRequest = {
      id: Math.random().toString(36).substr(2, 9),
      ...newRequest,
      projectName: project.name,
      status: 'pending',
      createdDate: new Date().toISOString().split('T')[0]
    };
    
    setRequests([request, ...requests]);
    setNewRequest({ title: '', description: '', projectId: '' });
    setIsDialogOpen(false);
    toast.success('Đã gửi yêu cầu thành công');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return t('investor.requests.pending');
      case 'processing': return t('investor.requests.processing');
      case 'completed': return t('investor.requests.completed');
      case 'rejected': return t('investor.requests.rejected');
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('investor.requests.title')}</CardTitle>
              <CardDescription>{t('investor.requests.desc')}</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('investor.requests.create')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t('investor.requests.create')}</DialogTitle>
                  <DialogDescription>{t('investor.requests.createDesc')}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="request-project">{t('investor.requests.project')}</Label>
                    <Select value={newRequest.projectId} onValueChange={(value: string) => setNewRequest({ ...newRequest, projectId: value })}>
                      <SelectTrigger id="request-project">
                        <SelectValue placeholder={t('investor.requests.projectPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {mockProjects.map(project => (
                          <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="request-title">{t('investor.requests.titleLabel')}</Label>
                    <Input
                      id="request-title"
                      value={newRequest.title}
                      onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                      placeholder={t('investor.requests.titlePlaceholder')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="request-description">{t('investor.requests.descLabel')}</Label>
                    <Textarea
                      id="request-description"
                      value={newRequest.description}
                      onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                      placeholder={t('investor.requests.descPlaceholder')}
                      rows={6}
                    />
                  </div>

                  <Button onClick={handleCreateRequest} className="w-full">
                    {t('investor.requests.send')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{request.title}</CardTitle>
                  <p className="text-sm text-gray-600">{request.projectName}</p>
                </div>
                <Badge className={getStatusColor(request.status)}>
                  {getStatusText(request.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('investor.requests.content')}</p>
                <p className="text-sm">{request.description}</p>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                {t('investor.requests.date')}: {request.createdDate}
              </div>

              {request.response && (
                <div className="pt-3 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-green-600" />
                    <p className="text-sm text-green-600">{t('investor.requests.responded')}</p>
                  </div>
                  <p className="text-sm bg-green-50 p-3 rounded">{request.response}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
