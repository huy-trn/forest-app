import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Calendar, MessageSquare, Image, FileText } from 'lucide-react';
import { Ticket } from '../admin/TicketManagement';
import { TicketDetails } from '../admin/TicketDetails';

const mockTickets: Ticket[] = [
  {
    id: '1',
    title: 'Trồng cây khu vực A-1',
    description: 'Trồng 500 cây thông tại khu vực A-1',
    projectId: '1',
    projectName: 'Dự án Rừng Thông Miền Bắc',
    status: 'in_progress',
    createdDate: '2025-11-10',
    assignees: [{ id: '1', name: 'Nguyễn Văn A', role: 'farmer' }],
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
    projectId: '1',
    projectName: 'Dự án Rừng Thông Miền Bắc',
    status: 'open',
    createdDate: '2025-11-12',
    assignees: [{ id: '1', name: 'Nguyễn Văn A', role: 'farmer' }],
    logs: [],
    comments: [],
    attachments: []
  },
  {
    id: '3',
    title: 'Thu hoạch và đánh giá chất lượng',
    description: 'Thu hoạch mẫu và đánh giá chất lượng cây trồng khu vực C',
    projectId: '2',
    projectName: 'Phục hồi rừng Sồi',
    status: 'completed',
    createdDate: '2025-11-05',
    assignees: [{ id: '2', name: 'Trần Thị B', role: 'farmer' }],
    logs: [
      { id: '1', message: 'Đã hoàn thành thu hoạch', date: '2025-11-08', userId: '2', userName: 'Trần Thị B' }
    ],
    comments: [],
    attachments: []
  }
];

export function FarmerTickets() {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredTickets = filterStatus === 'all' 
    ? tickets 
    : tickets.filter(t => t.status === filterStatus);

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
          <CardTitle>Nhiệm vụ được gán</CardTitle>
          <CardDescription>Xem và cập nhật tiến độ công việc</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button 
              variant={filterStatus === 'all' ? 'default' : 'outline'} 
              onClick={() => setFilterStatus('all')}
              size="sm"
            >
              Tất cả
            </Button>
            <Button 
              variant={filterStatus === 'open' ? 'default' : 'outline'} 
              onClick={() => setFilterStatus('open')}
              size="sm"
            >
              Mở
            </Button>
            <Button 
              variant={filterStatus === 'in_progress' ? 'default' : 'outline'} 
              onClick={() => setFilterStatus('in_progress')}
              size="sm"
            >
              Đang xử lý
            </Button>
            <Button 
              variant={filterStatus === 'completed' ? 'default' : 'outline'} 
              onClick={() => setFilterStatus('completed')}
              size="sm"
            >
              Hoàn thành
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
                Tạo: {ticket.createdDate}
              </div>

              <div className="flex gap-4 pt-2 border-t text-sm">
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>{ticket.logs.length} logs</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{ticket.comments.length} bình luận</span>
                </div>
                <div className="flex items-center gap-1">
                  <Image className="w-4 h-4" />
                  <span>{ticket.attachments.length} file</span>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={(e) => {
                e.stopPropagation();
                setSelectedTicket(ticket);
              }}>
                Cập nhật nhiệm vụ
              </Button>
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
          userRole="farmer"
        />
      )}
    </div>
  );
}
