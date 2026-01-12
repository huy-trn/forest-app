import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeTicket, ticketDetailInclude, notifyTicketUpdated } from "../../shared";
import { requireTicketAccess } from "@/lib/api-auth";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { response } = await requireTicketAccess(request, params.id);
  if (response) return response;

  const { name, type, key, url } = await request.json().catch(() => ({}));
  if (!name || !type || (!key && !url)) {
    return NextResponse.json({ error: "Missing file data" }, { status: 400 });
  }

  const ticket = await prisma.ticket.update({
    where: { id: params.id },
    data: {
      attachments: {
        create: { name, type, url: key || url },
      },
    },
    include: ticketDetailInclude,
  });

  await notifyTicketUpdated(ticket.id);
  return NextResponse.json(await serializeTicket(ticket as any));
}
