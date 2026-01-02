import { NextResponse } from "next/server";
import { getShowcaseContent } from "@/lib/showcase-service";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") ?? "en";
  const content = await getShowcaseContent(locale);
  return NextResponse.json(content);
}

export async function PUT(request: Request) {
  const { user, response } = await requireUser(request);
  if (!user) return response!;
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = (await request.json()) as { locale?: string; heroTitle?: string; heroDescription?: string };
  const targetLocale = (payload.locale || "en").toLowerCase();

  if (!prisma || !(prisma as any).showcaseHero) {
    return NextResponse.json({ error: "Prisma unavailable" }, { status: 500 });
  }

  const saved = await (prisma as any).showcaseHero.upsert({
    where: { locale: targetLocale },
    update: { title: payload.heroTitle ?? "", description: payload.heroDescription ?? "" },
    create: { locale: targetLocale, title: payload.heroTitle ?? "", description: payload.heroDescription ?? "" },
  });

  return NextResponse.json(saved);
}
