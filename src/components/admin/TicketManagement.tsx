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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { TicketPlus, Calendar, Users, MessageSquare, Image, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { TicketDetails } from './TicketDetails';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  status: 'open' | 'in_progress' | 'completed' | 'closed';
  createdDate: string;
  assignees: Array<{ id: string; name: string; role: string }>;
  logs: Array<{ id: string; message: string; date: string; userId: string; userName: string }>;
  comments: Array<{ id: string; message: string; date: string; userId: string; userName: string; userRole: string }>;
  attachments: Array<{ id: string; name: string; type: string; url: string }>;
}

const mockTickets: Ticket[] = [
  {
    id: '1',
    title: 'Trồng cây khu vực A-1',
    description: 'Trồng 500 cây thông tại khu vực A-1',
    projectId: '1',
    projectName: 'Dự án Rừng Thông Miền Bắc',
    status: 'in_progress',
    createdDate: '2025-11-10',
    assignees: [{ id: '1', name: 'Nguyễn Văn A', role: 'partner' }],
    logs: [
      { id: '1', message: 'Đã trồng 200 cây thông', date: '2025-11-14', userId: '1', userName: 'Nguyễn Văn A' }
    ],
    comments: [
      { id: '1', message: 'Tiến độ tốt, tiếp tục theo dõi', date: '2025-11-14', userId: 'admin1', userName: 'Admin', userRole: 'admin' }
    ],
    attachments: [
      { id: '1', name: 'photo1.jpg', type: 'image', url: '#' }
    ]
  },
  {
    id: '2',
    title: 'Kiểm tra và bảo dưỡng khu B-2',
    description: 'Kiểm tra tình trạng cây và làm cỏ khu vực B-2',
    projectId: '2',
    projectName: 'Phục hồi rừng Sồi',
    status: 'open',
    createdDate: '2025-11-12',
    assignees: [{ id: '2', name: 'Trần Thị B', role: 'partner' }],
    logs: [],
    comments: [],
    attachments: []
  }
];

const mockProjects = [
  { id: '1', name: 'Dự án Rừng Thông Miền Bắc' },
  { id: '2', name: 'Phục hồi rừng Sồi' }
];

const mockUsers = [
  { id: '1', name: 'Nguyễn Văn A', role: 'partner' },
  { id: '2', name: 'Trần Thị B', role: 'partner' },
  { id: '3', name: 'Lê Văn C', role: 'investor' },
];

export function TicketManagement() {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    projectId: ''
  });
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

  const filteredTickets = filterStatus === 'all' 
    ? tickets 
    : tickets.filter(t => t.status === filterStatus);

  const handleCreateTicket = () => {
    const project = mockProjects.find(p => p.id === newTicket.projectId);
    if (!project) return;

    const ticket: Ticket = {
      id: Math.random().toString(36).substr(2, 9),
      ...newTicket,
      projectName: project.name,
      status: 'open',
      createdDate: new Date().toISOString().split('admin.T')[0],
      assignees: mockUsers.filter(u => selectedAssignees.includes(u.id)),
      logs: [],
      comments: [],
      attachments: []
    };
    setTickets([...tickets, ticket]);
    setNewTicket({ title: '', description: '', projectId: '' });
    setSelectedAssignees([]);
    setIsCreateDialogOpen(false);
    toast.success(t('admin.ticketManagement.created'));
  };

  const handleUpdateTicket = (updatedTicket: Ticket) => {
    setTickets(tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Mở';
      case 'in_progress': return 'Đang xử lý';
      case 'completed': return 'Hoàn thành';
      case 'closed': return 'Đã đóng';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('admin.ticketManagement.title')}</CardTitle>
              <CardDescription>{t('admin.ticketManagement.desc')}</CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <TicketPlus className="w-4 h-4 mr-2" />
                  {t('admin.ticketManagement.create')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t('admin.ticketManagement.createTitle')}</DialogTitle>
                  <DialogDescription>{t('admin.ticketManagement.createDesc')}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="ticket-project">{t('admin.ticketManagement.project')}</Label>
                    <Select value={newTicket.projectId} onValueChange={(value: string) => setNewTicket({ ...newTicket, projectId: value })}>
                      <SelectTrigger id="ticket-project">
                        <SelectValue placeholder={t('admin.ticketManagement.projectPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {mockProjects.map(project => (
                          <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ticket-title">{t('admin.ticketManagement.titleLabel')}</Label>
                    <Input
                      id="ticket-title"
                      value={newTicket.title}
                      onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                      placeholder={t('admin.ticketManagement.titlePlaceholder')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ticket-description">{t('admin.ticketManagement.descLabel')}</Label>
                    <Textarea
                      id="ticket-description"
                      value={newTicket.description}
                      onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                      placeholder={t('admin.ticketManagement.descPlaceholder')}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t('admin.ticketManagement.assign')}</Label>
                    <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-3">
                      {mockUsers.map((user) => (
                        <div key={user.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`assignee-${user.id}`}
                            checked={selectedAssignees.includes(user.id)}
                            onCheckedChange={(checked: boolean) => {
                              if (checked) {
                                setSelectedAssignees([...selectedAssignees, user.id]);
                              } else {
                                setSelectedAssignees(selectedAssignees.filter(id => id !== user.id));
                              }
                            }}
                          />
                          <label htmlFor={`assignee-${user.id}`} className="flex-1 cursor-pointer">
                            {user.name} <Badge variant="outline" className="ml-2">{user.role === 'partner' ? t('admin.ticketManagement.partner') : t('admin.ticketManagement.investor')}</Badge>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleCreateTicket} className="w-full">{t('admin.ticketManagement.create')}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button 
              variant={filterStatus === 'all' ? 'default' : 'outline'} 
              onClick={() => setFilterStatus('all')}
              size="sm"
            >
              {t('admin.ticketManagement.filters.all')}
            </Button>
            <Button 
              variant={filterStatus === 'open' ? 'default' : 'outline'} 
              onClick={() => setFilterStatus('open')}
              size="sm"
            >
              {t('admin.ticketManagement.filters.open')}
            </Button>
            <Button 
              variant={filterStatus === 'in_progress' ? 'default' : 'outline'} 
              onClick={() => setFilterStatus('in_progress')}
              size="sm"
            >
              {t('admin.ticketManagement.filters.in_progress')}
            </Button>
            <Button 
              variant={filterStatus === 'completed' ? 'default' : 'outline'} 
              onClick={() => setFilterStatus('completed')}
              size="sm"
            >
              {t('admin.ticketManagement.filters.completed')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTickets.map((ticket) => (
          <Card key={ticket.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{ticket.title}</CardTitle>
                  <p className="text-sm text-gray-600">{ticket.projectName}</p>
                </div>
                <Badge className={getStatusColor(ticket.status)}>
                  {getStatusText(ticket.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">{ticket.description}</p>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                {t('admin.ticketManagement.created')}: {ticket.createdDate}
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-600" />
                <div className="flex flex-wrap gap-1">
                  {ticket.assignees.map((assignee) => (
                    <Badge key={assignee.id} variant="outline" className="text-xs">
                      {assignee.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-2 border-t text-sm">
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>{ticket.logs.length} {t('admin.ticketManagement.logs')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{ticket.comments.length} {t('admin.ticketManagement.comments')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Image className="w-4 h-4" />
                  <span>{ticket.attachments.length} {t('admin.ticketManagement.files')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ticket Details Dialog */}
      {selectedTicket && (
        <TicketDetails 
          ticket={selectedTicket} 
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={handleUpdateTicket}
          userRole="admin"
        />
      )}
    </div>
  );
}
