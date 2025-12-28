'use client';
import { useState } from "react";
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
import { Textarea } from "../ui/textarea";
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
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { TicketPlus, Calendar, Users, MessageSquare, Image, FileText } from "lucide-react";
import { toast } from "sonner";
import { TicketDetails } from "./TicketDetails";
import { useEffect } from "react";

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

interface UserOption {
  id: string;
  name: string;
  role: string;
}

interface ProjectOption {
  id: string;
  name: string;
}

export function TicketManagement({ currentUser }: { currentUser?: { id: string; name: string; role: string } }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    projectId: ''
  });
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

  const ticketsQuery = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const res = await fetch("/api/tickets");
      if (!res.ok) throw new Error("Failed to load tickets");
      return res.json();
    },
  });

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to load projects");
      return res.json();
    },
  });

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to load users");
      return res.json();
    },
  });

  useEffect(() => {
    if (ticketsQuery.data) {
      setTickets(
        (ticketsQuery.data as Ticket[]).map((t: any) => ({
          ...t,
          createdDate: t.createdAt ?? t.createdDate,
        }))
      );
    }
  }, [ticketsQuery.data]);

  useEffect(() => {
    if (projectsQuery.data) {
      setProjects((projectsQuery.data as any[]).map((p: any) => ({ id: p.id, name: p.title })));
    }
  }, [projectsQuery.data]);

  useEffect(() => {
    if (usersQuery.data) {
      setUsers(usersQuery.data as UserOption[]);
    }
  }, [usersQuery.data]);

  const createTicket = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTicket,
          assigneeIds: selectedAssignees,
        }),
      });
      if (!res.ok) throw new Error("Failed to create ticket");
      return res.json();
    },
    onSuccess: (ticket: any) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      setNewTicket({ title: "", description: "", projectId: "" });
      setSelectedAssignees([]);
      setIsCreateDialogOpen(false);
      setTickets((prev) => [
        ...prev,
        {
          ...ticket,
          createdDate: ticket.createdDate ?? ticket.createdAt ?? new Date().toISOString(),
        },
      ]);
      toast.success(t("admin.ticketManagement.created"));
    },
    onError: (err) => {
      console.error(err);
      toast.error(t("common.error", { defaultValue: "Failed to create ticket" }));
    },
  });

  const filteredTickets = filterStatus === 'all' 
    ? tickets 
    : tickets.filter(t => t.status === filterStatus);

  const handleCreateTicket = () => {
    const project = projects.find(p => p.id === newTicket.projectId);
    if (!project) return;
    createTicket.mutate();
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

  // Server push to invalidate tickets
  useEffect(() => {
    let es: EventSource | null = null;

    const connect = () => {
      if (es) {
        es.close();
        es = null;
      }
      es = new EventSource("/api/events");
      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data?.type === "ticket:update") {
            queryClient.invalidateQueries({ queryKey: ["tickets"] });
          }
        } catch {
          // ignore parse errors
        }
      };
      es.onerror = () => {
        es?.close();
        es = null;
        setTimeout(connect, 2000);
      };
    };

    connect();
    return () => {
      es?.close();
      es = null;
    };
  }, [queryClient]);

  if (selectedTicket) {
    return (
      <div className="space-y-4">
        <TicketDetails
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={handleUpdateTicket}
          userRole="admin"
          currentUser={currentUser}
        />
      </div>
    );
  }

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
                        {projects.map(project => (
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
                      {users.map((user) => (
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
    </div>
  );
}
