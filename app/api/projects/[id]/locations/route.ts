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

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const projectId = params.id;
  const user = await getUserFromRequest(_req);

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await isProjectMember(user.sub, projectId);
  const isAdmin = user.role === Role.admin || user.role === Role.root;
  if (!member && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const locations = await prisma.projectLocation.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(locations);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const projectId = params.id;
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await isProjectMember(user.sub, projectId);
  const isAdmin = user.role === Role.admin || user.role === Role.root;
  const isPartner = user.role === Role.partner;
  if (!(isAdmin || (isPartner && member))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { latitude, longitude, label } = body as {
    latitude?: number;
    longitude?: number;
    label?: string | null;
  };

  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return NextResponse.json({ error: "latitude and longitude are required numbers" }, { status: 400 });
  }

  const created = await prisma.projectLocation.create({
    data: { projectId, latitude, longitude, label: label ?? null },
  });
  return NextResponse.json(created, { status: 201 });
}
