import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Calendar, MessageSquare, Image, FileText } from "lucide-react";
import { Ticket } from "../admin/TicketManagement";
import { TicketDetails } from "../admin/TicketDetails";
import type { User } from "@/types/user";
import { toast } from "sonner";
import { useTicketListSse } from "@/lib/use-ticket-list-sse";

interface PartnerTicketsProps {
  user: User;
}

export function PartnerTickets({ user }: PartnerTicketsProps) {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const ticketsQuery = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const res = await fetch("/api/tickets");
      if (!res.ok) throw new Error("Failed to load tickets");
      return res.json();
    },
  });
  useTicketListSse(() => ticketsQuery.refetch());

  useEffect(() => {
    if (ticketsQuery.data) {
      const data: Ticket[] = ticketsQuery.data;
      const assigned = data.filter((t) => t.assignees.some((a) => a.id === user.id));
      setTickets(
        assigned.map((t: any) => ({
          ...t,
          createdDate: t.createdAt ?? t.createdDate,
        }))
      );
    }
  }, [ticketsQuery.data, user.id]);

  useEffect(() => {
    if (ticketsQuery.error) {
      toast.error(t("common.error", { defaultValue: "Failed to load tickets" }));
    }
  }, [ticketsQuery.error, t]);

  const filteredTickets = filterStatus === 'all'
    ? tickets
    : tickets.filter(t => t.status === filterStatus);

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
      case 'open': return t('partner.tickets.open');
      case 'in_progress': return t('partner.tickets.in_progress');
      case 'completed': return t('partner.tickets.completed');
      case 'closed': return t('partner.tickets.closed');
      default: return status;
    }
  };

  if (selectedTicket) {
    return (
      <div className="space-y-4">
        <TicketDetails
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          userRole="partner"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('partner.tickets.assigned')}</CardTitle>
          <CardDescription>{t('partner.tickets.desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('all')}
              size="sm"
            >
              {t('partner.tickets.all')}
            </Button>
            <Button
              variant={filterStatus === 'open' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('open')}
              size="sm"
            >
              {t('partner.tickets.open')}
            </Button>
            <Button
              variant={filterStatus === 'in_progress' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('in_progress')}
              size="sm"
            >
              {t('partner.tickets.in_progress')}
            </Button>
            <Button
              variant={filterStatus === 'completed' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('completed')}
              size="sm"
            >
              {t('partner.tickets.completed')}
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
                {t('partner.tickets.created')}: {ticket.createdDate}
              </div>

              <div className="flex gap-4 pt-2 border-t text-sm">
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>{ticket.logs.length} {t('partner.tickets.logs')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{ticket.comments.length} {t('partner.tickets.comments')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Image className="w-4 h-4" />
                  <span>{ticket.attachments.length} {t('partner.tickets.files')}</span>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                setSelectedTicket(ticket);
              }}>
                {t('partner.tickets.update')}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
