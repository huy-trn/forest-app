import { prisma } from "@/lib/prisma";
import { defaultShowcaseContent } from "@/lib/showcase-defaults";
import { ShowcaseContent, ShowcaseProject } from "@/types/showcase";

const extractFirstImage = (html?: string | null): string | null => {
  if (!html) return null;
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ?? null;
};

export async function getShowcaseContent(locale: string): Promise<ShowcaseContent> {
  const targetLocale = (locale || "en").toLowerCase();
  const prismaAny = prisma as any;

  try {
    let heroTitle = "";
    let heroDescription = "";

    if (prismaAny?.showcaseHero?.findUnique) {
      const hero = await prismaAny.showcaseHero.findUnique({ where: { locale: targetLocale } });
      const fallbackHero = await prismaAny.showcaseHero.findUnique({ where: { locale: "en" } });
      heroTitle = hero?.title || fallbackHero?.title || "";
      heroDescription = hero?.description || fallbackHero?.description || "";
    }

    const projects: ShowcaseProject[] = await prisma.project
      .findMany({
        orderBy: { createdAt: "desc" },
        take: 12,
        select: {
          id: true,
        title: true,
        description: true,
        country: true,
        province: true,
        area: true,
        forestType: true,
        createdAt: true,
      },
    })
      .then((rows) =>
        rows.map((p) => ({
          ...p,
          createdAt: p.createdAt?.toISOString?.() ?? undefined,
          imageUrl: extractFirstImage(p.description ?? ""),
          description: p.description ?? null,
        }))
      )
      .catch(() => []);

    return { ...defaultShowcaseContent, heroTitle, heroDescription, projects };
  } catch (err) {
    console.error("Failed to load showcase content", err);
  }

  console.warn("Prisma client unavailable, returning default showcase content");
  return defaultShowcaseContent;
}
