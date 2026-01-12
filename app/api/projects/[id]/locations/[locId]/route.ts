import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, isAdminLike, isRole } from "@/lib/api-auth";

async function isProjectMember(userId: string, projectId: string) {
  const member = await prisma.projectMember.findFirst({
    where: { userId, projectId },
  });
  return member;
}

export async function PATCH(req: Request, { params }: { params: { id: string; locId: string } }) {
  const { id: projectId, locId } = params;
  const { user, response } = await requireUser(req);
  if (!user) return response!;

  const member = await isProjectMember(user.sub, projectId);
  const isAdmin = isAdminLike(user);
  const isPartner = isRole(user, ["partner"]);
  if (!(isAdmin || (isPartner && member))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { latitude, longitude, label, name, description, polygon, rollbackToVersionId } = body as {
    latitude?: number;
    longitude?: number;
    label?: string | null;
    name?: string | null;
    description?: string | null;
    polygon?: any;
    rollbackToVersionId?: string | null;
  };

  const data: any = {};
  let rollbackVersion: any = null;

  // Ensure the location belongs to the project
  const existing = await prisma.projectLocation.findFirst({ where: { id: locId, projectId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (rollbackToVersionId) {
    rollbackVersion = await prisma.projectLocationVersion.findFirst({
      where: { id: rollbackToVersionId, locationId: locId, projectId },
    });
    if (!rollbackVersion) return NextResponse.json({ error: "Version not found" }, { status: 404 });
    data.latitude = rollbackVersion.latitude;
    data.longitude = rollbackVersion.longitude;
    data.label = rollbackVersion.label;
    data.name = rollbackVersion.name;
    data.description = rollbackVersion.description;
    data.polygon = rollbackVersion.polygon;
  } else {
    if (typeof latitude === "number") data.latitude = latitude;
    if (typeof longitude === "number") data.longitude = longitude;
    if (typeof label !== "undefined") data.label = label;
    if (typeof name !== "undefined") data.name = name;
    if (typeof description !== "undefined") data.description = description;
    if (typeof polygon !== "undefined") {
      if (polygon === null) {
        data.polygon = null;
      } else {
        if (!Array.isArray(polygon)) {
          return NextResponse.json({ error: "polygon must be an array of { lat, lng } points" }, { status: 400 });
        }
        const clean = polygon.map((p: any) => ({
          lat: typeof p.lat === "number" ? p.lat : typeof p.latitude === "number" ? p.latitude : NaN,
          lng: typeof p.lng === "number" ? p.lng : typeof p.longitude === "number" ? p.longitude : NaN,
        }));
        if (clean.some((p: any) => Number.isNaN(p.lat) || Number.isNaN(p.lng))) {
          return NextResponse.json({ error: "polygon points need numeric lat/lng" }, { status: 400 });
        }
        data.polygon = clean;
      }
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }
  }

  const updated = await prisma.projectLocation.update({ where: { id: locId }, data: { ...data, deletedAt: null } });

  await prisma.projectLocationVersion.create({
    data: {
      projectId,
      locationId: locId,
      userId: user.sub,
      operation: rollbackVersion ? "rollback" : "update",
      latitude: updated.latitude,
      longitude: updated.longitude,
      label: updated.label,
      name: updated.name,
      description: updated.description,
      polygon: updated.polygon as any,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: { id: string; locId: string } }) {
  const { id: projectId, locId } = params;
  const { user, response } = await requireUser(req);
  if (!user) return response!;

  const member = await isProjectMember(user.sub, projectId);
  const isAdmin = isAdminLike(user);
  const isPartner = isRole(user, ["partner"]);
  if (!(isAdmin || (isPartner && member))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Ensure the location belongs to the project
  const existing = await prisma.projectLocation.findFirst({ where: { id: locId, projectId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.projectLocationVersion.create({
    data: {
      projectId,
      locationId: locId,
      userId: user.sub,
      operation: "delete",
      latitude: existing.latitude,
      longitude: existing.longitude,
      label: existing.label,
      name: existing.name,
      description: existing.description,
      polygon: existing.polygon as any,
    },
  });

  await prisma.projectLocation.update({
    where: { id: locId },
    data: { deletedAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
