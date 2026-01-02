import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = (searchParams.get("locale") ?? "en").toLowerCase();

  if (!prisma || !(prisma as any).post) {
    return NextResponse.json([], { status: 200 });
  }

  const posts = await (prisma as any).post.findMany({
    where: { OR: [{ locale }, { locale: null }, { locale: "" }] },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const { user, response } = await requireUser(request);
  if (!user) return response!;
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { title, content, imageUrl, locale } = body as {
    title?: string;
    content?: string;
    imageUrl?: string;
    locale?: string;
  };

  if (!title || !content) {
    return NextResponse.json({ error: "Missing title or content" }, { status: 400 });
  }

  const created = await (prisma as any).post.create({
    data: {
      title,
      body: content,
      imageUrl: imageUrl || null,
      locale: (locale || "en").toLowerCase(),
    },
  });

  return NextResponse.json(created, { status: 201 });
}

export async function DELETE(request: Request) {
  const { user, response } = await requireUser(request);
  if (!user) return response!;
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  if (!prisma || !(prisma as any).post) {
    return NextResponse.json({ error: "Prisma unavailable" }, { status: 500 });
  }

  await (prisma as any).post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
