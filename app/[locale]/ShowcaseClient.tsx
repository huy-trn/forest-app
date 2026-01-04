"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { ShowcaseContent } from "@/types/showcase";
import { useRouter } from "next/navigation";

type Props = {
  locale: string;
  content: ShowcaseContent;
  isAuthenticated?: boolean;
  dashboardPath?: string;
  loginPath?: string;
};

export function ShowcaseClient({ locale, content, isAuthenticated, dashboardPath, loginPath }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const goTo = useCallback(
    (href?: string) => {
      if (!href) return;
      router.push(href);
    },
    [router]
  );

  useEffect(() => {
    if (!emblaApi) return;
    const autoScroll = () => {
      const slides = emblaApi.slideNodes().length;
      if (slides <= 1) return;
      if (emblaApi.canScrollNext()) emblaApi.scrollNext();
      else emblaApi.scrollTo(0);
    };
    const id = setInterval(autoScroll, 6000);
    return () => clearInterval(id);
  }, [emblaApi]);

  const previewBody = (text?: string | null) => {
    if (!text) return "";
    const stripped = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return stripped.length > 180 ? `${stripped.slice(0, 180)}…` : stripped;
  };

  const data: ShowcaseContent = {
    heroTitle: content.heroTitle || "Lorem ipsum dolor sit amet",
    heroDescription: content.heroDescription || "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    posts: content.posts ?? [],
  };

  const HEADLINE_COUNT = 3;
  const posts = data.posts ?? [];
  const headlinePosts = posts.slice(0, HEADLINE_COUNT);
  const archivePosts = posts.slice(HEADLINE_COUNT);
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(Math.max(archivePosts.length, 1) / pageSize));
  const pagedPosts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return archivePosts.slice(start, start + pageSize);
  }, [archivePosts, page]);

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        {isAuthenticated && dashboardPath ? (
          <Button size="sm" variant="outline" onClick={() => goTo(dashboardPath)}>
            {t("common.dashboard", { defaultValue: "Dashboard" })}
          </Button>
        ) : (
          loginPath && (
            <Button size="sm" variant="default" onClick={() => goTo(loginPath)}>
              {t("login.signIn", { defaultValue: "Sign In" })}
            </Button>
          )
        )}
      </div>

      <Card className="bg-gradient-to-br from-green-600 to-emerald-700 text-white relative overflow-hidden">
        <CardContent className="pt-6 pb-10">
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
                  <Link href={`/${locale}/post/${post.id ?? ""}`} className="block h-full">
                    <Card className="overflow-hidden border h-full">
                      {post.imageUrl ? (
                        <div className="h-40 bg-muted">
                          <ImageWithFallback src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                        </div>
                      ) : null}
                      <CardContent className="p-4 space-y-2">
                        <h3 className="text-lg font-semibold">{post.title}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{previewBody(post.body)}</p>
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
              <div className="space-y-3">
                {pagedPosts.map((post, idx) => (
                  <Link
                    key={`${post.title}-${idx}`}
                    href={`/${locale}/post/${post.id ?? ""}`}
                    className="block border rounded-lg bg-white hover:shadow-sm transition"
                  >
                    <div className="flex gap-3 p-4">
                      {post.imageUrl ? (
                        <div className="w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                          <ImageWithFallback src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                        </div>
                      ) : null}
                      <div className="flex-1 space-y-1">
                        <h4 className="font-semibold">{post.title}</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">{previewBody(post.body)}</p>
                      </div>
                    </div>
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
