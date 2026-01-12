import { NextResponse } from "next/server";
import { TicketStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { serializeTicket, ticketDetailInclude, notifyTicketUpdated } from "../../shared";
import { requireTicketAccess } from "@/lib/api-auth";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { response } = await requireTicketAccess(request, params.id);
  if (response) return response;

  const { status } = await request.json().catch(() => ({}));
  if (!status || !Object.values(TicketStatus).includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const ticket = await prisma.ticket.update({
    where: { id: params.id },
    data: { status },
    include: ticketDetailInclude,
  });

  await notifyTicketUpdated(ticket.id);
  return NextResponse.json(await serializeTicket(ticket as any));
}
