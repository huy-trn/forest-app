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

export async function PATCH(req: Request, { params }: { params: { id: string; locId: string } }) {
  const { id: projectId, locId } = params;
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

  const data: any = {};
  if (typeof latitude === "number") data.latitude = latitude;
  if (typeof longitude === "number") data.longitude = longitude;
  if (typeof label !== "undefined") data.label = label;
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  // Ensure the location belongs to the project
  const existing = await prisma.projectLocation.findFirst({ where: { id: locId, projectId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.projectLocation.update({ where: { id: locId }, data });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: { id: string; locId: string } }) {
  const { id: projectId, locId } = params;
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await isProjectMember(user.sub, projectId);
  const isAdmin = user.role === Role.admin;
  const isPartner = user.role === Role.partner;
  if (!(isAdmin || (isPartner && member))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Ensure the location belongs to the project
  const existing = await prisma.projectLocation.findFirst({ where: { id: locId, projectId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.projectLocation.delete({ where: { id: locId } });
  return NextResponse.json({ ok: true });
}
