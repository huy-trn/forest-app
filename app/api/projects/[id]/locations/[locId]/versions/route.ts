import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth-helpers";
import { Role } from "@prisma/client";

async function isProjectMember(userId: string, projectId: string) {
  const member = await prisma.projectMember.findFirst({
    where: { userId, projectId },
  });
  return member;
}

export async function GET(req: Request, { params }: { params: { id: string; locId: string } }) {
  const { id: projectId, locId } = params;
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await isProjectMember(user.sub, projectId);
  const isAdmin = user.role === Role.admin || user.role === Role.root;
  if (!member && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const versions = await prisma.projectLocationVersion.findMany({
    where: { projectId, locationId: locId },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return NextResponse.json(versions);
}
