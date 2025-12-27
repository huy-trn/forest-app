import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { members: { include: { user: true } } },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
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
  const body = await request.json();
  const { title, description, country, province, area, status, memberIds, memberRoles } = body as {
    title?: string;
    description?: string;
    country?: string;
    province?: string;
    area?: string;
    status?: string;
    memberIds?: string[];
    memberRoles?: Record<string, Role>;
  };

  const project = await prisma.project.update({
    where: { id: params.id },
    data: {
      title,
      description,
      country,
      province,
      area,
      status: status as any,
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
