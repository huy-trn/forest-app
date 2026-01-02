import { prisma } from "@/lib/prisma";
import { defaultShowcaseContent } from "@/lib/showcase-defaults";
import { ShowcaseContent } from "@/types/showcase";

export async function getShowcaseContent(locale: string): Promise<ShowcaseContent> {
  const targetLocale = (locale || "en").toLowerCase();
  const prismaAny = prisma as any;

  const mapPosts = (rows: any[]) =>
    rows.map((p) => ({
      id: p.id,
      title: p.title,
      body: p.body,
      imageUrl: p.imageUrl || undefined,
      locale: p.locale || undefined,
    }));

  try {
    let heroTitle = "";
    let heroDescription = "";

    if (prismaAny?.showcaseHero?.findUnique) {
      const hero = await prismaAny.showcaseHero.findUnique({ where: { locale: targetLocale } });
      const fallbackHero = await prismaAny.showcaseHero.findUnique({ where: { locale: "en" } });
      heroTitle = hero?.title || fallbackHero?.title || "";
      heroDescription = hero?.description || fallbackHero?.description || "";
    }

    if (prismaAny?.post?.findMany) {
      const posts = await prismaAny.post.findMany({
        where: { OR: [{ locale: targetLocale }, { locale: null }, { locale: "" }] },
        orderBy: { createdAt: "desc" },
      });

      const effectivePosts =
        posts.length > 0
          ? posts
          : await prismaAny.post.findMany({
              where: { OR: [{ locale: "en" }, { locale: null }, { locale: "" }] },
              orderBy: { createdAt: "desc" },
            });

      return { ...defaultShowcaseContent, heroTitle, heroDescription, posts: mapPosts(effectivePosts) };
    }

    if (prismaAny?.$queryRaw) {
      const posts = (await prismaAny.$queryRaw`
        SELECT title, body, "imageUrl", locale
        FROM "Post"
        WHERE locale = ${targetLocale} OR locale IS NULL OR locale = ''
        ORDER BY "createdAt" DESC
      `) as any[];

      const effectivePosts =
        posts.length > 0
          ? posts
          : ((await prismaAny.$queryRaw`
              SELECT title, body, "imageUrl", locale
              FROM "Post"
              WHERE locale = 'en' OR locale IS NULL OR locale = ''
              ORDER BY "createdAt" DESC
            `) as any[]);

      return { ...defaultShowcaseContent, heroTitle, heroDescription, posts: mapPosts(effectivePosts) };
    }
  } catch (err) {
    console.error("Failed to load showcase content", err);
  }

  console.warn("Prisma client unavailable, returning default showcase content");
  return defaultShowcaseContent;
}
