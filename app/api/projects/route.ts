import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { getUserFromRequest } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isPublic = searchParams.get("public") === "true";

  if (isPublic) {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        country: true,
        province: true,
        area: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(
      projects.map((p) => ({
        ...p,
        createdAt: p.createdAt?.toISOString?.() ?? p.createdAt,
        updatedAt: p.updatedAt?.toISOString?.() ?? p.updatedAt,
      }))
    );
  }

  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = user.role === Role.admin || user.role === Role.root;

  const projects = await prisma.project.findMany({
    where: isAdmin ? {} : { members: { some: { userId: user.sub } } },
    include: {
      members: { include: { user: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    projects.map((project) => ({
      ...project,
      members: project.members.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        role: m.role,
      })),
    }))
  );
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, description, country, province, area, memberIds, memberRoles } = body as {
    title?: string;
    description?: string;
    country?: string;
    province?: string;
    area?: string;
    memberIds?: string[];
    memberRoles?: Record<string, Role>;
  };

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      title,
      description,
      country,
      province,
      area,
      members: {
        create: (memberIds || []).map((id) => ({
          userId: id,
          role: memberRoles?.[id] ?? Role.partner,
        })),
      },
    },
    include: { members: { include: { user: true } } },
  });

  return NextResponse.json(
    {
      ...project,
      members: project.members.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        role: m.role,
      })),
    },
    { status: 201 }
  );
}
