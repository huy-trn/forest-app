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

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const projectId = params.id;
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await isProjectMember(user.sub, projectId);
  const isAdmin = user.role === Role.admin || user.role === Role.root;
  if (!member && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const versions = await prisma.projectLocationVersion.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      location: { select: { id: true, name: true, label: true, latitude: true, longitude: true } },
    },
  });

  // Build project-level snapshots of all pins after each change
  const state = new Map<
    string,
    {
      id: string;
      latitude: number;
      longitude: number;
      label: string | null;
      name: string | null;
      description: string | null;
      polygon: any;
    }
  >();

  const snapshots = versions.map((v) => {
    if (v.operation === "delete") {
      state.delete(v.locationId);
    } else {
      state.set(v.locationId, {
        id: v.locationId,
        latitude: v.latitude,
        longitude: v.longitude,
        label: v.label ?? null,
        name: v.name ?? null,
        description: v.description ?? null,
        polygon: (v.polygon as any) ?? null,
      });
    }

    return {
      id: v.id,
      createdAt: v.createdAt,
      operation: v.operation,
      locationId: v.locationId,
      locationName: v.name ?? v.label ?? v.location?.name ?? v.location?.label ?? null,
      user: v.user,
      locations: Array.from(state.values()),
    };
  });

  return NextResponse.json(snapshots.reverse());
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const projectId = params.id;
  const url = new URL(req.url);
  const versionId = url.searchParams.get("versionId");
  if (!versionId) return NextResponse.json({ error: "versionId is required" }, { status: 400 });

  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const member = await isProjectMember(user.sub, projectId);
  const isAdmin = user.role === Role.admin || user.role === Role.root;
  const isPartner = user.role === Role.partner;
  if (!(isAdmin || (isPartner && member))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const versions = await prisma.projectLocationVersion.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  });

  const state = new Map<
    string,
    {
      id: string;
      latitude: number;
      longitude: number;
      label: string | null;
      name: string | null;
      description: string | null;
      polygon: any;
    }
  >();

  let found = false;
  for (const v of versions) {
    if (v.operation === "delete") {
      state.delete(v.locationId);
    } else {
      state.set(v.locationId, {
        id: v.locationId,
        latitude: v.latitude,
        longitude: v.longitude,
        label: v.label ?? null,
        name: v.name ?? null,
        description: v.description ?? null,
        polygon: (v.polygon as any) ?? null,
      });
    }
    if (v.id === versionId) {
      found = true;
      break;
    }
  }

  if (!found) return NextResponse.json({ error: "Version not found" }, { status: 404 });

  const desiredLocations = Array.from(state.values());

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.projectLocation.findMany({ where: { projectId } });
    const existingMap = new Map(existing.map((l) => [l.id, l]));
    const desiredIds = new Set(desiredLocations.map((l) => l.id));

    const toDelete = existing.filter((l) => !desiredIds.has(l.id));
    if (toDelete.length) {
      await tx.projectLocation.updateMany({
        where: { id: { in: toDelete.map((l) => l.id) } },
        data: { deletedAt: new Date() },
      });
    }

    for (const loc of desiredLocations) {
      const exists = existingMap.has(loc.id);
      if (exists) {
        await tx.projectLocation.update({
          where: { id: loc.id },
          data: {
            latitude: loc.latitude,
            longitude: loc.longitude,
            label: loc.label,
            name: loc.name,
            description: loc.description,
            polygon: loc.polygon,
            deletedAt: null,
          },
        });
      } else {
        await tx.projectLocation.create({
          data: {
            id: loc.id,
            projectId,
            latitude: loc.latitude,
            longitude: loc.longitude,
            label: loc.label,
            name: loc.name,
            description: loc.description,
            polygon: loc.polygon,
            deletedAt: null,
          },
        });
      }
    }

    const fresh = await tx.projectLocation.findMany({ where: { projectId, deletedAt: null } });
    if (fresh.length > 0) {
      await tx.projectLocationVersion.create({
        data: {
          projectId,
          locationId: fresh[0].id,
          userId: user.sub,
          operation: "rollback_project",
          latitude: fresh[0].latitude,
          longitude: fresh[0].longitude,
          label: fresh[0].label,
          name: fresh[0].name,
          description: fresh[0].description,
          polygon: fresh[0].polygon as any,
        },
      });
    }
    return fresh;
  });

  return NextResponse.json(result);
}
