import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeTicket, ticketDetailInclude, notifyTicketUpdated } from "../../shared";
import { getUserFromRequest } from "@/lib/auth-helpers";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const dbUser = await prisma.user.findUnique({ where: { id: user.sub } });
  if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message, attachments } = await request.json().catch(() => ({}));
  if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });
  const attachmentItems = (attachments as Array<{ name: string; type: string; url?: string; key?: string }> | undefined) ?? [];

  const ticket = await prisma.ticket.update({
    where: { id: params.id },
    data: {
      logs: {
        create: {
          message,
          userId: dbUser.id,
        },
      },
      attachments: attachmentItems.length
        ? {
            create: attachmentItems.map((a) => ({
              name: a.name,
              type: a.type,
              url: a.url ?? a.key ?? "",
            })),
          }
        : undefined,
    },
    include: ticketDetailInclude,
  });

  await notifyTicketUpdated(ticket.id);
  return NextResponse.json(await serializeTicket(ticket as any));
}
