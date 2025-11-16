import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent } from '../ui/card';
import { Ticket } from './TicketManagement';
import { Calendar, User, Send, Paperclip } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface TicketDetailsProps {
  ticket: Ticket;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (ticket: Ticket) => void;
  userRole: 'admin' | 'farmer';
}

export function TicketDetails({ ticket, isOpen, onClose, onUpdate, userRole }: TicketDetailsProps) {
  const [localTicket, setLocalTicket] = useState<Ticket>(ticket);
  const [newComment, setNewComment] = useState('');
  const [newLog, setNewLog] = useState('');

  const handleStatusChange = (status: string) => {
    const updated = { ...localTicket, status: status as Ticket['status'] };
    setLocalTicket(updated);
    onUpdate(updated);
    toast.success('Đã cập nhật trạng thái');
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: Math.random().toString(36).substr(2, 9),
      message: newComment,
      date: new Date().toISOString().split('T')[0],
      userId: userRole === 'admin' ? 'admin1' : 'farmer1',
      userName: userRole === 'admin' ? 'Admin' : 'Nông dân',
      userRole: userRole
    };
    
    const updated = {
      ...localTicket,
      comments: [...localTicket.comments, comment]
    };
    
    setLocalTicket(updated);
    onUpdate(updated);
    setNewComment('');
    toast.success('Đã thêm bình luận');
  };

  const handleAddLog = () => {
    if (!newLog.trim()) return;
    
    const log = {
      id: Math.random().toString(36).substr(2, 9),
      message: newLog,
      date: new Date().toISOString().split('T')[0],
      userId: 'farmer1',
      userName: 'Nông dân'
    };
    
    const updated = {
      ...localTicket,
      logs: [...localTicket.logs, log]
    };
    
    setLocalTicket(updated);
    onUpdate(updated);
    setNewLog('');
    toast.success('Đã thêm log công việc');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const attachment = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 'document',
      url: URL.createObjectURL(file)
    };

    const updated = {
      ...localTicket,
      attachments: [...localTicket.attachments, attachment]
    };

    setLocalTicket(updated);
    onUpdate(updated);
    toast.success('Đã tải lên tệp đính kèm');
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle>{localTicket.title}</DialogTitle>
              <DialogDescription>{localTicket.projectName}</DialogDescription>
            </div>
            {userRole === 'admin' && (
              <Select value={localTicket.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Mở</SelectItem>
                  <SelectItem value="in_progress">Đang xử lý</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="closed">Đã đóng</SelectItem>
                </SelectContent>
              </Select>
            )}
            {userRole === 'farmer' && (
              <Badge className={getStatusColor(localTicket.status)}>
                {getStatusText(localTicket.status)}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Ticket Info */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Mô tả</p>
                <p>{localTicket.description}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                Tạo ngày: {localTicket.createdDate}
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-600" />
                <div className="flex flex-wrap gap-1">
                  {localTicket.assignees.map((assignee) => (
                    <Badge key={assignee.id} variant="outline">
                      {assignee.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Logs, Comments, Attachments */}
          <Tabs defaultValue="logs" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="logs" className="flex-1">
                Work Logs ({localTicket.logs.length})
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex-1">
                Bình luận ({localTicket.comments.length})
              </TabsTrigger>
              <TabsTrigger value="attachments" className="flex-1">
                Tệp đính kèm ({localTicket.attachments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="logs" className="space-y-4">
              {/* Add Log Form - Only for farmers */}
              {userRole === 'farmer' && (
                <Card>
                  <CardContent className="pt-6 space-y-3">
                    <Label>Thêm log công việc</Label>
                    <Textarea
                      value={newLog}
                      onChange={(e) => setNewLog(e.target.value)}
                      placeholder="Mô tả công việc đã thực hiện..."
                      rows={3}
                    />
                    <Button onClick={handleAddLog} className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      Thêm Log
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Logs List */}
              <div className="space-y-3">
                {localTicket.logs.map((log) => (
                  <Card key={log.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{log.userName}</span>
                        </div>
                        <span className="text-sm text-gray-600">{log.date}</span>
                      </div>
                      <p className="text-sm">{log.message}</p>
                    </CardContent>
                  </Card>
                ))}
                {localTicket.logs.length === 0 && (
                  <p className="text-center text-gray-500 py-8">Chưa có log công việc</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="comments" className="space-y-4">
              {/* Add Comment Form */}
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <Label>Thêm bình luận</Label>
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Nhập bình luận..."
                    rows={3}
                  />
                  <Button onClick={handleAddComment} className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Gửi bình luận
                  </Button>
                </CardContent>
              </Card>

              {/* Comments List */}
              <div className="space-y-3">
                {localTicket.comments.map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{comment.userName}</span>
                          <Badge variant="outline" className="text-xs">
                            {comment.userRole === 'admin' ? 'Admin' : 'Nông dân'}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-600">{comment.date}</span>
                      </div>
                      <p className="text-sm">{comment.message}</p>
                    </CardContent>
                  </Card>
                ))}
                {localTicket.comments.length === 0 && (
                  <p className="text-center text-gray-500 py-8">Chưa có bình luận</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="attachments" className="space-y-4">
              {/* Upload Form - Only for farmers */}
              {userRole === 'farmer' && (
                <Card>
                  <CardContent className="pt-6">
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 transition">
                        <Paperclip className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">Nhấp để tải lên tệp đính kèm</p>
                        <p className="text-xs text-gray-500 mt-1">Hỗ trợ: Ảnh, PDF, DOC, XLS</p>
                      </div>
                      <Input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                      />
                    </Label>
                  </CardContent>
                </Card>
              )}

              {/* Attachments List */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {localTicket.attachments.map((attachment) => (
                  <Card key={attachment.id}>
                    <CardContent className="pt-6">
                      {attachment.type === 'image' ? (
                        <img src={attachment.url} alt={attachment.name} className="w-full h-32 object-cover rounded mb-2" />
                      ) : (
                        <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center mb-2">
                          <Paperclip className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <p className="text-sm truncate">{attachment.name}</p>
                    </CardContent>
                  </Card>
                ))}
                {localTicket.attachments.length === 0 && (
                  <p className="col-span-full text-center text-gray-500 py-8">Chưa có tệp đính kèm</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
