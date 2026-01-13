import { TicketStatus } from "@prisma/client";
import type { Ticket, Project, TicketAssignee, TicketLog, TicketComment, TicketAttachment, User } from "@prisma/client";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { publishTicketUpdated } from "@/lib/event-bus";
import { prisma } from "@/lib/prisma";

const bucket = process.env.S3_BUCKET;
const region = process.env.AWS_REGION;
const s3 = bucket && region ? new S3Client({ region }) : null;

export const ticketDetailInclude = {
  project: true,
  assignees: { include: { user: true } },
  logs: { include: { user: true } },
  comments: { include: { user: true } },
  attachments: true,
};

export const ticketListInclude = {
  project: true,
  assignees: { include: { user: true } },
  attachments: true,
  _count: { select: { logs: true, comments: true } },
};

type PrismaTicket = Ticket & {
  project: Project;
  assignees: Array<TicketAssignee & { user: User }>;
  logs?: Array<TicketLog & { user: User | null }>;
  comments?: Array<TicketComment & { user: User }>;
  attachments: TicketAttachment[];
  _count?: { logs: number; comments: number };
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

export async function serializeTicket(ticket: PrismaTicket, opts: { withThreads?: boolean } = {}) {
  const { withThreads = true } = opts;
  const attachments = await Promise.all(
    ticket.attachments.map(async (a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      url: await signUrl(a.url),
    }))
  );

  const logs = withThreads
    ? (ticket.logs ?? []).map((l) => ({
        id: l.id,
        message: l.message,
        date: l.createdAt.toISOString(),
        userId: l.userId ?? "",
        userName: l.user?.name ?? "",
      }))
    : [];
  const comments = withThreads
    ? (ticket.comments ?? []).map((c) => ({
        id: c.id,
        message: c.message,
        date: c.createdAt.toISOString(),
        userId: c.userId,
        userName: c.user.name,
        userRole: c.userRole,
      }))
    : [];
  const logsCount = withThreads ? logs.length : ticket._count?.logs ?? 0;
  const commentsCount = withThreads ? comments.length : ticket._count?.comments ?? 0;

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
    logs,
    comments,
    logsCount,
    commentsCount,
    attachments,
  };
}

export async function notifyTicketUpdated(id: string) {
  // target assignees for user-scoped events
  const assignees = await prisma.ticketAssignee.findMany({
    where: { ticketId: id },
    select: { userId: true },
  });
  const userIds = assignees.map((a) => a.userId);
  publishTicketUpdated(id, userIds);
}
