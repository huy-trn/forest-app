import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TicketStatus } from "@prisma/client";

export async function GET() {
  const tickets = await prisma.ticket.findMany({
    include: {
      project: true,
      assignees: { include: { user: true } },
      logs: true,
      comments: { include: { user: true } },
      attachments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    tickets.map((ticket) => ({
      ...ticket,
      projectName: ticket.project.title,
      assignees: ticket.assignees.map((a) => ({
        id: a.user.id,
        name: a.user.name,
        role: a.user.role,
      })),
      logs: ticket.logs.map((l) => ({
        id: l.id,
        message: l.message,
        date: l.createdAt.toISOString(),
        userId: l.userId ?? "",
        userName: "",
      })),
      comments: ticket.comments.map((c) => ({
        id: c.id,
        message: c.message,
        date: c.createdAt.toISOString(),
        userId: c.userId,
        userName: c.user.name,
        userRole: c.userRole,
      })),
      attachments: ticket.attachments.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        url: a.url,
      })),
    }))
  );
}

export async function POST(request: Request) {
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
    include: {
      project: true,
      assignees: { include: { user: true } },
      logs: true,
      comments: { include: { user: true } },
      attachments: true,
    },
  });

  return NextResponse.json(
    {
      ...ticket,
      projectName: ticket.project.title,
      assignees: ticket.assignees.map((a) => ({
        id: a.user.id,
        name: a.user.name,
        role: a.user.role,
      })),
      logs: [],
      comments: [],
      attachments: [],
    },
    { status: 201 }
  );
}
