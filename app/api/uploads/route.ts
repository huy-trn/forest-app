import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucket = process.env.S3_BUCKET as string;
const region = process.env.AWS_REGION as string;

const s3 = bucket && region ? new S3Client({ region }) : null;

export async function POST(request: Request) {
  if (!s3 || !bucket || !region) {
    return NextResponse.json({ error: "S3 is not configured" }, { status: 500 });
  }

  const { name, type } = (await request.json().catch(() => ({}))) as { name?: string; type?: string };
  if (!name || !type) {
    return NextResponse.json({ error: "Missing file name or type" }, { status: 400 });
  }

  const safeName = name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `attachments/${Date.now()}-${safeName}`;

  const putCommand = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: type,
  });

  const uploadUrl = await getSignedUrl(s3, putCommand, { expiresIn: 300 });

  const getCommand = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  const viewUrl = await getSignedUrl(s3, getCommand, { expiresIn: 300 });

  return NextResponse.json({ uploadUrl, key, viewUrl });
}
