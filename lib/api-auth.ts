import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-helpers";
import type { TokenPayload } from "@/lib/auth-types";
import { prisma } from "@/lib/prisma";

export const ADMIN_ROLES = ["admin", "root"] as const;

export function isRole(user: TokenPayload | null, roles: readonly string[]) {
  return Boolean(user?.role && roles.includes(user.role));
}

export function isAdminLike(user: TokenPayload | null) {
  return isRole(user, ADMIN_ROLES);
}

export function requireRole(user: TokenPayload | null, roles: readonly string[]) {
  if (!isRole(user, roles)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function requireUser(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return { user: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user, response: null };
}

export async function requireDbUser(
  request: Request,
  options: { createIfMissing?: boolean } = {}
) {
  const { user, response } = await requireUser(request);
  if (!user || response) return { user: null, dbUser: null, response };

  let dbUser = await prisma.user.findUnique({ where: { id: user.sub } });
  if (!dbUser && user.email) {
    dbUser = await prisma.user.findUnique({ where: { email: user.email } });
  }
  if (!dbUser && user.phone) {
    dbUser = await prisma.user.findUnique({ where: { phone: user.phone } });
  }

  if (!dbUser && options.createIfMissing && user.role) {
    dbUser = await prisma.user.create({
      data: {
        id: user.sub,
        name: user.name ?? "User",
        email: user.email,
        phone: user.phone,
        role: user.role as any,
        status: "active",
      },
    });
  }

  if (!dbUser) {
    return { user, dbUser: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { user, dbUser, response: null };
}

export async function requireTicketAccess(
  request: Request,
  ticketId: string,
  options: { createIfMissing?: boolean } = {}
) {
  const { user, dbUser, response } = await requireDbUser(request, {
    createIfMissing: options.createIfMissing,
  });
  if (!user || response) return { user: null, dbUser: null, response };

  if (isAdminLike(user)) {
    return { user, dbUser, response: null };
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: {
      id: true,
      assignees: { select: { userId: true } },
      project: { select: { members: { select: { userId: true } } } },
    },
  });

  if (!ticket) {
    return {
      user,
      dbUser,
      response: NextResponse.json({ error: "Not found" }, { status: 404 }),
    };
  }

  const isAssignee = ticket.assignees.some((a) => a.userId === user.sub);
  const isMember = ticket.project?.members.some((m) => m.userId === user.sub);
  if (!isAssignee && !isMember) {
    return {
      user,
      dbUser,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { user, dbUser, response: null };
}
