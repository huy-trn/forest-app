import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeTicket, ticketDetailInclude } from "../shared";
import { requireTicketAccess } from "@/lib/api-auth";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { response } = await requireTicketAccess(_, id);
  if (response) return response;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: ticketDetailInclude,
  });

  if (!ticket) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const serialized = await serializeTicket(ticket as any, { withThreads: true });
  return NextResponse.json(serialized);
}
