import { TicketStatus } from "@prisma/client";
import type { Ticket, Project, TicketAssignee, TicketLog, TicketComment, TicketAttachment, User } from "@prisma/client";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { publishTicketUpdated } from "@/lib/event-bus";

const bucket = process.env.S3_BUCKET;
const region = process.env.AWS_REGION;
const s3 = bucket && region ? new S3Client({ region }) : null;

export const ticketInclude = {
  project: true,
  assignees: { include: { user: true } },
  logs: { include: { user: true } },
  comments: { include: { user: true } },
  attachments: true,
};

type PrismaTicket = Ticket & {
  project: Project;
  assignees: Array<TicketAssignee & { user: User }>;
  logs: Array<TicketLog & { user: User | null }>;
  comments: Array<TicketComment & { user: User }>;
  attachments: TicketAttachment[];
};

async function signUrl(keyOrUrl: string) {
  if (!s3 || !bucket || !region) return keyOrUrl;
  // treat stored value as key; fall back to original if looks like full URL
  const isFullUrl = keyOrUrl.startsWith("http://") || keyOrUrl.startsWith("https://");
  const key = isFullUrl ? keyOrUrl.replace(/^https?:\/\/[^/]+\//, "") : keyOrUrl;
  try {
    const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
    return await getSignedUrl(s3, cmd, { expiresIn: 300 });
  } catch {
    return keyOrUrl;
  }
}

export async function serializeTicket(ticket: PrismaTicket) {
  const attachments = await Promise.all(
    ticket.attachments.map(async (a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      url: await signUrl(a.url),
    }))
  );

  return {
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    projectId: ticket.projectId,
    projectName: ticket.project.title,
    status: ticket.status as TicketStatus,
    createdDate: ticket.createdAt.toISOString(),
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
      userName: l.user?.name ?? "",
    })),
    comments: ticket.comments.map((c) => ({
      id: c.id,
      message: c.message,
      date: c.createdAt.toISOString(),
      userId: c.userId,
      userName: c.user.name,
      userRole: c.userRole,
    })),
    attachments,
  };
}

export function notifyTicketUpdated(id: string) {
  publishTicketUpdated(id);
}
