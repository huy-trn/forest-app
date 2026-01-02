"use client";

import { useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useTranslation } from "react-i18next";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { ShowcaseContent } from "@/types/showcase";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

type Props = {
  locale: string;
  content: ShowcaseContent;
};

export function PublicShowcase({ locale, content }: Props) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  // auto-slide headlines every 6s
  useEffect(() => {
    if (!emblaApi) return;
    const autoScroll = () => {
      const slides = emblaApi.slideNodes().length;
      if (slides <= 1) return;
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    };
    const id = setInterval(autoScroll, 6000);
    return () => clearInterval(id);
  }, [emblaApi]);

  const data: ShowcaseContent = {
    heroTitle: content.heroTitle || "Lorem ipsum dolor sit amet",
    heroDescription: content.heroDescription || "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    posts: content.posts ?? [],
  };

  const HEADLINE_COUNT = 3;
  const posts = data.posts ?? [];
  const headlinePosts = posts.slice(0, HEADLINE_COUNT);
  const archivePosts = posts.slice(HEADLINE_COUNT);
  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(Math.max(archivePosts.length, 1) / pageSize));
  const pagedPosts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return archivePosts.slice(start, start + pageSize);
  }, [archivePosts, page]);

  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-br from-green-600 to-emerald-700 text-white">
        <CardContent className="pt-6 pb-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-white">{data.heroTitle}</h1>
            <p className="text-lg text-green-50">{data.heroDescription}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("investor.showcase.postsTitle", { defaultValue: "Featured updates" })}</CardTitle>
              <CardDescription>
                {t("investor.showcase.postsDesc", {
                  defaultValue: "Highlights from ongoing projects and teams.",
                })}
              </CardDescription>
            </div>
            {headlinePosts.length > 1 ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => emblaApi?.scrollPrev()}
                  className="p-2 rounded-md border hover:bg-gray-50"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => emblaApi?.scrollNext()}
                  className="p-2 rounded-md border hover:bg-gray-50"
                  aria-label="Next"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {headlinePosts.map((post, idx) => (
                <div key={idx} className="min-w-0 flex-[0_0_100%] md:flex-[0_0_50%] pr-4">
                  <Link href={`/${locale}/blog/${post.id ?? ""}`} className="block h-full">
                    <Card className="overflow-hidden border h-full">
                      {post.imageUrl ? (
                        <div className="h-40 bg-muted">
                          <ImageWithFallback src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                        </div>
                      ) : null}
                      <CardContent className="p-4 space-y-2">
                        <h3 className="text-lg font-semibold">{post.title}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{post.body}</p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">
                {t("investor.showcase.postsArchive", { defaultValue: "Older updates" })}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <button
                  type="button"
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  {t("common.back", { defaultValue: "Back" })}
                </button>
                <span>
                  {page}/{totalPages}
                </span>
                <button
                  type="button"
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  {t("common.next", { defaultValue: "Next" })}
                </button>
              </div>
            </div>
            {pagedPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pagedPosts.map((post, idx) => (
                  <Link key={`${post.title}-${idx}`} href={`/${locale}/blog/${post.id ?? ""}`} className="block">
                    <Card className="border h-full">
                      <CardContent className="p-4 space-y-2">
                        <h4 className="font-semibold">{post.title}</h4>
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{post.body}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">{t("investor.showcase.noArchive", { defaultValue: "No older posts yet." })}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
