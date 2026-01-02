import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TicketStatus } from "@prisma/client";
import { serializeTicket, ticketListInclude, notifyTicketUpdated } from "./shared";
import { requireUser } from "@/lib/api-auth";

export async function GET(request: Request) {
  const { response } = await requireUser(request);
  if (response) return response;

  const tickets = await prisma.ticket.findMany({
    include: ticketListInclude,
    orderBy: { createdAt: "desc" },
  });

  const result = await Promise.all(tickets.map((ticket) => serializeTicket(ticket as any, { withThreads: false })));
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const { user, response } = await requireUser(request);
  if (!user || response) return response!;

  const body = await request.json();
  const { title, description, projectId, assigneeIds } = body as {
    title?: string;
    description?: string;
    projectId?: string;
    assigneeIds?: string[];
  };

  if (!title || !projectId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const ticket = await prisma.ticket.create({
    data: {
      title,
      description,
      projectId,
      status: TicketStatus.open,
      assignees: {
        create: (assigneeIds || []).map((id) => ({ userId: id })),
      },
    },
    include: ticketListInclude,
  });

  const serialized = await serializeTicket(ticket as any, { withThreads: false });
  await notifyTicketUpdated(ticket.id);
  return NextResponse.json(serialized, { status: 201 });
}
