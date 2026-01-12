import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeTicket, ticketDetailInclude, notifyTicketUpdated } from "../../shared";
import { requireTicketAccess } from "@/lib/api-auth";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { dbUser, response } = await requireTicketAccess(request, params.id, { createIfMissing: true });
  if (!dbUser || response) return response!;

  const body = await request.json().catch(() => null);
  const { message, attachments } = (body ?? {}) as { message?: unknown; attachments?: unknown };
  const attachmentItems = (attachments as Array<{ name: string; type: string; url?: string; key?: string }> | undefined) ?? [];
  const rawMessage = typeof message === "string" ? message : String(message ?? "");
  const plainMessage = rawMessage.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").trim();
  const hasImage = /<img\b/i.test(rawMessage);
  if (!plainMessage && !hasImage && attachmentItems.length === 0) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }
  let messageText = rawMessage;
  if (!plainMessage && !hasImage) {
    messageText = "Attachment";
  }

  const ticket = await prisma.ticket.update({
    where: { id: params.id },
    data: {
      comments: {
        create: {
          message: messageText,
          userId: dbUser.id,
          userRole: dbUser.role as any,
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
