import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { UserPlus, Search, Mail, MessageSquare, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  joinDate: string;
}

const mockUsers: UserData[] = [
  { id: '1', name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', phone: '+84 912 345 678', role: 'farmer', status: 'active', joinDate: '2024-01-15' },
  { id: '2', name: 'Trần Thị B', email: 'tranthib@example.com', phone: '+84 923 456 789', role: 'farmer', status: 'active', joinDate: '2024-02-20' },
  { id: '3', name: 'Lê Văn C', email: 'levanc@example.com', phone: '+84 934 567 890', role: 'buyer', status: 'active', joinDate: '2024-03-10' },
  { id: '4', name: 'Phạm Thị D', email: 'phamthid@example.com', phone: '+84 945 678 901', role: 'farmer', status: 'active', joinDate: '2024-04-05' },
  { id: '5', name: 'Hoàng Văn E', email: 'hoangvane@example.com', phone: '+84 956 789 012', role: 'buyer', status: 'inactive', joinDate: '2024-05-12' },
];

export function UserManagement() {
  const [users, setUsers] = useState<UserData[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inviteMethod, setInviteMethod] = useState<'email' | 'sms'>('email');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'farmer'
  });

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );

  const handleInviteUser = () => {
    const user: UserData = {
      id: Math.random().toString(36).substr(2, 9),
      ...newUser,
      status: 'pending',
      joinDate: new Date().toISOString().split('T')[0]
    };
    setUsers([...users, user]);
    
    const method = inviteMethod === 'email' ? 'email' : 'SMS';
    toast.success(`Đã gửi lời mời qua ${method} đến ${inviteMethod === 'email' ? newUser.email : newUser.phone}`);
    
    setNewUser({ name: '', email: '', phone: '', role: 'farmer' });
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Quản lý người dùng</CardTitle>
            <CardDescription>Tạo tài khoản và mời người dùng tham gia</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Mời người dùng
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Mời người dùng mới</DialogTitle>
                <DialogDescription>Gửi lời mời qua Email hoặc SMS</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="user-name">Họ và tên</Label>
                  <Input
                    id="user-name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Nhập họ tên"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Phương thức mời</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={inviteMethod === 'email' ? 'default' : 'outline'}
                      onClick={() => setInviteMethod('email')}
                      className="flex-1"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                    <Button
                      type="button"
                      variant={inviteMethod === 'sms' ? 'default' : 'outline'}
                      onClick={() => setInviteMethod('sms')}
                      className="flex-1"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      SMS
                    </Button>
                  </div>
                </div>

                {inviteMethod === 'email' && (
                  <div className="space-y-2">
                    <Label htmlFor="user-email">Email</Label>
                    <Input
                      id="user-email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="example@email.com"
                    />
                  </div>
                )}

                {inviteMethod === 'sms' && (
                  <div className="space-y-2">
                    <Label htmlFor="user-phone">Số điện thoại</Label>
                    <Input
                      id="user-phone"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      placeholder="+84 912 345 678"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="user-role">Vai trò</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                    <SelectTrigger id="user-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Quản trị viên</SelectItem>
                      <SelectItem value="farmer">Nông dân</SelectItem>
                      <SelectItem value="buyer">Nhà đầu tư</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleInviteUser} className="w-full">
                  Gửi lời mời
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tham gia</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {user.role === 'admin' ? 'Quản trị' : user.role === 'farmer' ? 'Nông dân' : 'Nhà đầu tư'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status === 'active' ? 'Hoạt động' : 'Chờ xác nhận'}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.joinDate}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
