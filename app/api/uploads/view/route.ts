import { NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { requireUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const bucket = process.env.S3_BUCKET as string;
const region = process.env.AWS_REGION as string;

const s3 = bucket && region ? new S3Client({ region }) : null;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key") || "";

  if (!s3 || !bucket || !region) {
    return NextResponse.json({ error: "S3 is not configured" }, { status: 500 });
  }

  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }
  const { user } = await requireUser(request);

  const [projectKey] = key.split("/");

  if (projectKey !== "public" && !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } else {
    const project = await prisma.project.findUnique({
      where: { id: projectKey },
      include: { members: { select: { userId: true } } },
    });
    const isAdmin = user.role === "admin" || user.role === "root";
    const isMember = project?.members.some((m) => m.userId === user.sub);
    if (!isAdmin && !isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const getCommand = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const url = await getSignedUrl(s3, getCommand, { expiresIn: 300 });
  return NextResponse.redirect(url, { status: 302 });
}
