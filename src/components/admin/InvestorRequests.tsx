import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Calendar, User, MessageSquare, Link2 } from 'lucide-react';
import { toast } from 'sonner';

interface InvestorRequest {
  id: string;
  title: string;
  description: string;
  investorId: string;
  investorName: string;
  projectId: string;
  projectName: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  createdDate: string;
  linkedTickets: string[];
  response?: string;
}

const mockRequests: InvestorRequest[] = [
  {
    id: '1',
    title: 'Yêu cầu báo cáo tiến độ Q4',
    description: 'Cần báo cáo chi tiết về tiến độ trồng cây quý 4/2024',
    investorId: '3',
    investorName: 'Lê Văn C',
    projectId: '1',
    projectName: 'Dự án Rừng Thông Miền Bắc',
    status: 'processing',
    createdDate: '2025-11-10',
    linkedTickets: []
  },
  {
    id: '2',
    title: 'Yêu cầu kiểm tra chất lượng cây',
    description: 'Kiểm tra chất lượng và tình trạng phát triển của cây trồng khu vực A',
    investorId: '5',
    investorName: 'Hoàng Văn E',
    projectId: '2',
    projectName: 'Phục hồi rừng Sồi',
    status: 'pending',
    createdDate: '2025-11-12',
    linkedTickets: []
  },
  {
    id: '3',
    title: 'Yêu cầu ảnh hiện trạng dự án',
    description: 'Cần ảnh chụp hiện trạng khu rừng đã trồng để báo cáo cho ban lãnh đạo',
    investorId: '3',
    investorName: 'Lê Văn C',
    projectId: '1',
    projectName: 'Dự án Rừng Thông Miền Bắc',
    status: 'completed',
    createdDate: '2025-11-05',
    linkedTickets: ['1'],
    response: 'Đã gửi bộ ảnh và báo cáo chi tiết qua email'
  }
];

export function InvestorRequests() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<InvestorRequest[]>(mockRequests);
  const [selectedRequest, setSelectedRequest] = useState<InvestorRequest | null>(null);
  const [response, setResponse] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredRequests = filterStatus === 'all' 
    ? requests 
    : requests.filter(r => r.status === filterStatus);

  const handleUpdateStatus = (status: InvestorRequest['status']) => {
    if (!selectedRequest) return;
    
    const updated = { ...selectedRequest, status };
    setRequests(requests.map(r => r.id === updated.id ? updated : r));
    setSelectedRequest(updated);
  toast.success(t('admin.investorRequests.statusUpdated'));
  };

  const handleSendResponse = () => {
    if (!selectedRequest || !response.trim()) return;
    
    const updated = { ...selectedRequest, response, status: 'completed' as const };
    setRequests(requests.map(r => r.id === updated.id ? updated : r));
    setSelectedRequest(null);
    setResponse('');
  toast.success(t('admin.investorRequests.responseSent'));
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
      case 'pending': return t('admin.investorRequests.status.pending');
      case 'processing': return t('admin.investorRequests.status.processing');
      case 'completed': return t('admin.investorRequests.status.completed');
      case 'rejected': return t('admin.investorRequests.status.rejected');
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.investorRequests.title')}</CardTitle>
          <CardDescription>{t('admin.investorRequests.desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button 
              variant={filterStatus === 'all' ? 'default' : 'outline'} 
              onClick={() => setFilterStatus('all')}
              size="sm"
            >
              {t('admin.investorRequests.all')}
            </Button>
            <Button 
              variant={filterStatus === 'pending' ? 'default' : 'outline'} 
              onClick={() => setFilterStatus('pending')}
              size="sm"
            >
              {t('admin.investorRequests.status.pending')}
            </Button>
            <Button 
              variant={filterStatus === 'processing' ? 'default' : 'outline'} 
              onClick={() => setFilterStatus('processing')}
              size="sm"
            >
              {t('admin.investorRequests.status.processing')}
            </Button>
            <Button 
              variant={filterStatus === 'completed' ? 'default' : 'outline'} 
              onClick={() => setFilterStatus('completed')}
              size="sm"
            >
              {t('admin.investorRequests.status.completed')}
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Requests List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRequests.map((request) => (
          <Card key={request.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedRequest(request)}>
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
              <p className="text-sm text-gray-600">{request.description}</p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                {request.investorName}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                {request.createdDate}
              </div>
              {request.linkedTickets.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Link2 className="w-4 h-4" />
                  {t('admin.investorRequests.linkedTickets', { count: request.linkedTickets.length })}
                </div>
              )}
              {request.response && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600 mb-1">{t('admin.investorRequests.responseLabel')}</p>
                  <p className="text-sm">{request.response}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Request Details Dialog */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <DialogTitle>{selectedRequest.title}</DialogTitle>
                  <DialogDescription>{selectedRequest.projectName}</DialogDescription>
                </div>
                <Select value={selectedRequest.status} onValueChange={(value:string) => handleUpdateStatus(value as InvestorRequest['status'])}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t('admin.investorRequests.status.pending')}</SelectItem>
                    <SelectItem value="processing">{t('admin.investorRequests.status.processing')}</SelectItem>
                    <SelectItem value="completed">{t('admin.investorRequests.status.completed')}</SelectItem>
                    <SelectItem value="rejected">{t('admin.investorRequests.status.rejected')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{t('admin.investorRequests.requestContent')}</p>
                    <p>{selectedRequest.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    {t('admin.investorRequests.from')}: {selectedRequest.investorName}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {t('admin.investorRequests.createdDate')}: {selectedRequest.createdDate}
                  </div>
                </CardContent>
              </Card>
              {selectedRequest.status !== 'completed' && (
                <Card>
                  <CardContent className="pt-6 space-y-3">
                    <Label>{t('admin.investorRequests.responseLabel')}</Label>
                    <Textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder={t('admin.investorRequests.responsePlaceholder')}
                      rows={4}
                    />
                    <Button onClick={handleSendResponse} className="w-full">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      {t('admin.investorRequests.sendResponse')}
                    </Button>
                  </CardContent>
                </Card>
              )}
              {selectedRequest.response && (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-600 mb-2">{t('admin.investorRequests.sentResponse')}</p>
                    <p>{selectedRequest.response}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
