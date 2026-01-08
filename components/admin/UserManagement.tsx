'use client';
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { UserPlus, Search, Mail, MessageSquare, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PhoneInput } from "../ui/phone-input";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  joinDate: string;
}

interface UsersResponse {
  items: UserData[];
  page: number;
  pageSize: number;
  total: number;
}

export function UserManagement() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inviteMethod, setInviteMethod] = useState<'email' | 'sms'>('email');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'partner'
  });

  const usersQuery = useQuery({
    queryKey: ["users", page, pageSize, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (searchTerm.trim()) {
        params.set("search", searchTerm.trim());
      }
      const res = await fetch(`/api/users?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load users");
      return res.json();
    },
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const usersData: UsersResponse | undefined = usersQuery.data;
  const users = usersData?.items ?? [];
  const totalPages = useMemo(() => {
    if (!usersData) return 1;
    return Math.max(1, Math.ceil(usersData.total / usersData.pageSize));
  }, [usersData]);

  const createUser = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newUser,
          role: newUser.role,
        }),
      });
      if (!res.ok) throw new Error("Failed to create user");
      return res.json();
    },
    onSuccess: (user: any) => {
      const method = inviteMethod === 'email' ? t('admin.userManagement.email') : t('admin.userManagement.sms');
      toast.success(t('admin.userManagement.inviteSent', { method, value: inviteMethod === 'email' ? newUser.email : newUser.phone }));
      setNewUser({ name: '', email: '', phone: '', role: 'partner' });
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err) => {
      console.error(err);
      toast.error(t("common.error", { defaultValue: "Failed to invite user" }));
    },
  });

  const handleInviteUser = () => {
    createUser.mutate();
  };

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/users?id=${userId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");
      return res.json();
    },
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(t("admin.userManagement.deleted", { defaultValue: "User removed" }));
    },
    onError: (err) => {
      console.error(err);
      toast.error(t("common.error", { defaultValue: "Failed to delete user" }));
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('admin.userManagement.title')}</CardTitle>
            <CardDescription>{t('admin.userManagement.desc')}</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                {t('admin.userManagement.inviteUser')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('admin.userManagement.inviteNewUser')}</DialogTitle>
                <DialogDescription>{t('admin.userManagement.inviteDesc')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="user-name">{t('admin.userManagement.fullName')}</Label>
                  <Input
                    id="user-name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder={t('admin.userManagement.fullNamePlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('admin.userManagement.inviteMethod')}</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={inviteMethod === 'email' ? 'default' : 'outline'}
                      onClick={() => setInviteMethod('email')}
                      className="flex-1"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      {t('admin.userManagement.email')}
                    </Button>
                    <Button
                      type="button"
                      variant={inviteMethod === 'sms' ? 'default' : 'outline'}
                      onClick={() => setInviteMethod('sms')}
                      className="flex-1"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      {t('admin.userManagement.sms')}
                    </Button>
                  </div>
                </div>
                {inviteMethod === 'email' && (
                  <div className="space-y-2">
                    <Label htmlFor="user-email">{t('admin.userManagement.email')}</Label>
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
                    <PhoneInput
                      label={t('admin.userManagement.phone')}
                      value={newUser.phone}
                      onChange={(val) => setNewUser({ ...newUser, phone: val })}
                      placeholder="+84 912 345 678"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="user-role">{t('admin.userManagement.role')}</Label>
                  <Select value={newUser.role} onValueChange={(value:string) => setNewUser({ ...newUser, role: value })}>
                    <SelectTrigger id="user-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                    {["admin", "partner", "investor"].map((role) => (
                      <SelectItem key={role} value={role}>
                        {t(`roles.${role}`)}
                      </SelectItem>
                    ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleInviteUser} className="w-full">
                  {t('admin.userManagement.sendInvite')}
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
              placeholder={t('admin.userManagement.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="border rounded-lg overflow-x-auto">
            <Table className="min-w-[720px]">
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.userManagement.fullName')}</TableHead>
                  <TableHead>{t('admin.userManagement.email')}</TableHead>
                  <TableHead>{t('admin.userManagement.phone')}</TableHead>
                  <TableHead>{t('admin.userManagement.role')}</TableHead>
                  <TableHead>{t('admin.userManagement.status')}</TableHead>
                  <TableHead>{t('admin.userManagement.joinDate')}</TableHead>
                  <TableHead>{t('admin.userManagement.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {user.role === 'admin'
                          ? t('admin.userManagement.adminShort')
                          : t(`roles.${user.role || 'partner'}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status === 'active' ? t('admin.userManagement.active') : t('admin.userManagement.pending')}
                      </Badge>
                    </TableCell>
                  <TableCell>{user.joinDate}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button disabled={user.role==='root'} variant="ghost" size="sm">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button disabled={user.role==='root'} variant="ghost" size="sm" onClick={() => deleteUser.mutate(user.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    setPage((current) => Math.max(1, current - 1));
                  }}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  {page} / {totalPages}
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    setPage((current) => Math.min(totalPages, current + 1));
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
}
