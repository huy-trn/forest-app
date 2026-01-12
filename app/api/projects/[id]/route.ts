import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role, ForestType } from "@prisma/client";
import { requireUser, requireRole, ADMIN_ROLES, isAdminLike } from "@/lib/api-auth";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const isPublic = new URL(request.url).searchParams.get("public") === "true";
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: isPublic ? undefined : { members: { include: { user: true } } },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (isPublic) {
    const { id, title, description, country, province, area, status, createdAt, updatedAt, forestType } = project as any;
    return NextResponse.json({
      id,
      title,
      description,
      descriptionRich: description,
      country,
      province,
      area,
      status,
      forestType,
      createdAt,
      updatedAt,
    });
  }
  const { user, response } = await requireUser(request);
  if (!user) return response!;
  const isAdmin = isAdminLike(user);
  const isMember = project.members.some((m) => m.userId === user.sub);
  if (!isAdmin && !isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    ...project,
    members: project.members.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      role: m.role,
    })),
  });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { user, response } = await requireUser(request);
  if (!user) return response!;
  const forbidden = requireRole(user, ADMIN_ROLES);
  if (forbidden) return forbidden;

  const body = await request.json();
  const { title, description, country, province, area, status, forestType, memberIds, memberRoles } = body as {
    title?: string;
    description?: string;
    country?: string;
    province?: string;
    area?: string;
    status?: string;
    forestType?: ForestType | string;
    memberIds?: string[];
    memberRoles?: Record<string, Role>;
  };

  const normalizedForestType =
    forestType === ForestType.natural || forestType === "natural"
      ? ForestType.natural
      : forestType === ForestType.artificial || forestType === "artificial"
        ? ForestType.artificial
        : undefined;

  const project = await prisma.project.update({
    where: { id: params.id },
    data: {
      title,
      description,
      country,
      province,
      area,
      status: status as any,
      forestType: normalizedForestType,
      members: {
        deleteMany: {},
        create: (memberIds || []).map((id) => ({
          userId: id,
          role: memberRoles?.[id] ?? Role.partner,
        })),
      },
    },
    include: { members: { include: { user: true } } },
  });

  return NextResponse.json({
    ...project,
    members: project.members.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      role: m.role,
    })),
  });
}
