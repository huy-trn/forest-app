import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { requireUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const bucket = process.env.S3_BUCKET as string;
const region = process.env.AWS_REGION as string;

const s3 = bucket && region ? new S3Client({ region }) : null;

export async function POST(request: Request) {
  const { user, response } = await requireUser(request);
  if (!user) return response!;

  if (!s3 || !bucket || !region) {
    return NextResponse.json({ error: "S3 is not configured" }, { status: 500 });
  }

  const { name, type, projectId } = (await request.json().catch(() => ({}))) as { name?: string; type?: string; projectId?: string };
  if (!name || !type || !projectId) {
    return NextResponse.json({ error: "Missing file name, type, or projectId" }, { status: 400 });
  }

  if (projectId === "public") {
    if (user.role !== "admin" && user.role !== "root") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: { select: { userId: true } } },
    });
    const isAdmin = user.role === "admin" || user.role === "root";
    const isMember = project?.members.some((m) => m.userId === user.sub);
    if (!isAdmin && !isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const safeName = name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${projectId}/attachments/${Date.now()}-${safeName}`;

  const putCommand = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: type,
  });

  const uploadUrl = await getSignedUrl(s3, putCommand, { expiresIn: 300 });
  const viewUrl = `/api/uploads/view?key=${encodeURIComponent(key)}`;

  return NextResponse.json({ uploadUrl, key, viewUrl });
}
