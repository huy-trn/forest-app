import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, isAdminLike, isRole } from "@/lib/api-auth";

async function isProjectMember(userId: string, projectId: string) {
  const member = await prisma.projectMember.findFirst({
    where: { userId, projectId },
  });
  return member;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const projectId = params.id;
  const { user, response } = await requireUser(_req);
  if (!user) return response!;

  const member = await isProjectMember(user.sub, projectId);
  const isAdmin = isAdminLike(user);
  if (!member && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const locations = await prisma.projectLocation.findMany({
    where: { projectId, deletedAt: null },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(locations);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const projectId = params.id;
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

  const { latitude, longitude, label, name, description, polygon } = body as {
    latitude?: number;
    longitude?: number;
    label?: string | null;
    name?: string | null;
    description?: string | null;
    polygon?: any;
  };

  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return NextResponse.json({ error: "latitude and longitude are required numbers" }, { status: 400 });
  }

  let parsedPolygon: any = undefined;
  if (typeof polygon !== "undefined") {
    if (polygon === null) {
      parsedPolygon = null;
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
      parsedPolygon = clean;
    }
  }

  const created = await prisma.projectLocation.create({
    data: {
      projectId,
      latitude,
      longitude,
      label: label ?? null,
      name: name ?? null,
      description: description ?? null,
      polygon: parsedPolygon ?? null,
      deletedAt: null,
    },
  });
  await prisma.projectLocationVersion.create({
    data: {
      projectId,
      locationId: created.id,
      userId: user.sub,
      operation: "create",
      latitude: created.latitude,
      longitude: created.longitude,
      label: created.label,
      name: created.name,
      description: created.description,
      polygon: created.polygon as any,
    },
  });
  return NextResponse.json(created, { status: 201 });
}
