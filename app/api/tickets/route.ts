import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TicketStatus } from "@prisma/client";
import { serializeTicket, ticketInclude, notifyTicketUpdated } from "./shared";
import { getUserFromRequest } from "@/lib/auth-helpers";

export async function GET() {
  const tickets = await prisma.ticket.findMany({
    include: ticketInclude,
    orderBy: { createdAt: "desc" },
  });

  const result = await Promise.all(tickets.map((ticket) => serializeTicket(ticket as any)));
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    include: ticketInclude,
  });

  const serialized = await serializeTicket(ticket as any);
  notifyTicketUpdated(ticket.id);
  return NextResponse.json(serialized, { status: 201 });
}
