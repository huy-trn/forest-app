import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const isPublic = new URL(request.url).searchParams.get("public") === "true";
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: isPublic ? undefined : { members: { include: { user: true } } },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (isPublic) {
    const { id, title, description, country, province, area, status, createdAt, updatedAt } = project as any;
    return NextResponse.json({ id, title, description, descriptionRich: description, country, province, area, status, createdAt, updatedAt });
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
