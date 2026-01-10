"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, LayoutDashboard, LogIn } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SelectLng } from "@/components/ui/select-lng";
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

type ForestType = "natural" | "artificial";

export function ShowcaseClient({ locale, content, isAuthenticated, dashboardPath, loginPath }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const normalizeForestType = useCallback((type?: string | null): ForestType => (type === "artificial" ? "artificial" : "natural"), []);

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
    projects: (content.projects ?? []).map((p) => ({
      ...p,
      description: p.description ?? "",
    })),
  };

  const HEADLINE_COUNT = 3;
  const projects = data.projects ?? [];
  const featuredProjects = projects.slice(0, HEADLINE_COUNT);
  const moreProjects = projects.slice(HEADLINE_COUNT);
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(Math.max(moreProjects.length, 1) / pageSize));
  const pagedProjects = useMemo(() => {
    const start = (page - 1) * pageSize;
    return moreProjects.slice(start, start + pageSize);
  }, [moreProjects, page]);
  const forestTypeLabels: Record<ForestType, string> = {
    natural: t("common.naturalForest"),
    artificial: t("common.artificialForest"),
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-end gap-2">
        <SelectLng />
        {isAuthenticated && dashboardPath ? (
          <Button
            size="sm"
            variant="outline"
            className="h-8 border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
            onClick={() => goTo(dashboardPath)}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            {t("common.dashboard", { defaultValue: "Dashboard" })}
          </Button>
        ) : (
          loginPath && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
              onClick={() => goTo(loginPath)}
            >
              <LogIn className="mr-2 h-4 w-4" />
              {t("login.signIn", { defaultValue: "Sign In" })}
            </Button>
          )
        )}
      </div>

      <section className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.45),_rgba(15,23,42,0.85)),linear-gradient(120deg,_rgba(15,118,110,0.95),_rgba(5,46,22,0.9))] px-6 py-10 text-white shadow-[var(--shadow-soft)] sm:px-10">
        <div className="absolute -top-10 right-6 h-28 w-28 rounded-full bg-emerald-300/40 blur-2xl" />
        <div className="absolute bottom-0 left-6 h-32 w-32 rounded-full bg-teal-200/30 blur-2xl" />
        <div className="relative z-10 max-w-4xl space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-100/80">Forest intelligence</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold">{data.heroTitle}</h1>
          <p className="text-base sm:text-lg text-emerald-50/90">{data.heroDescription}</p>
          <div className="flex flex-wrap gap-3 pt-2 text-sm text-emerald-100/80">
            <span className="rounded-full border border-emerald-200/40 bg-white/10 px-3 py-1">Satellite-ready metrics</span>
            <span className="rounded-full border border-emerald-200/40 bg-white/10 px-3 py-1">Field team coordination</span>
            <span className="rounded-full border border-emerald-200/40 bg-white/10 px-3 py-1">Investor visibility</span>
          </div>
        </div>
      </section>

      <Card className="border-emerald-100/70">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("investor.showcase.postsTitle", { defaultValue: "Featured projects" })}</CardTitle>
              <CardDescription>
                {t("investor.showcase.postsDesc", {
                  defaultValue: "Highlights from ongoing projects and teams.",
                })}
              </CardDescription>
            </div>
            {featuredProjects.length > 1 ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => emblaApi?.scrollPrev()}
                  className="p-2 rounded-md border border-slate-200/70 bg-white text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => emblaApi?.scrollNext()}
                  className="p-2 rounded-md border border-slate-200/70 bg-white text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
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
              {featuredProjects.map((project, idx) => (
                <div key={idx} className="min-w-0 flex-[0_0_100%] md:flex-[0_0_50%] pr-4">
                  <Link href={`/${locale}/projects/${project.id ?? ""}`} className="block h-full">
                    <Card className="group h-full overflow-hidden border border-slate-200/70 bg-white/90 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                      {project.imageUrl ? (
                        <div className="h-40 bg-muted overflow-hidden">
                          <ImageWithFallback src={project.imageUrl} alt={project.title} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
                        </div>
                      ) : null}
                      <CardContent className="p-4 space-y-2">
                        <h3 className="text-lg font-semibold">{project.title}</h3>
                        <Badge variant="secondary">{forestTypeLabels[normalizeForestType(project.forestType)]}</Badge>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {previewBody(project.description)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {[project.province, project.country].filter(Boolean).join(", ")}
                        </p>
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
                {t("investor.showcase.postsArchive", { defaultValue: "More projects" })}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <button
                  type="button"
                  className="px-2 py-1 rounded-full border border-slate-200/70 bg-white text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md disabled:opacity-50"
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
                  className="px-2 py-1 rounded-full border border-slate-200/70 bg-white text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  {t("common.next", { defaultValue: "Next" })}
                </button>
              </div>
            </div>
            {pagedProjects.length > 0 ? (
              <div className="space-y-3">
                {pagedProjects.map((project, idx) => (
                  <Link
                    key={`${project.title}-${idx}`}
                    href={`/${locale}/projects/${project.id ?? ""}`}
                    className="block border border-slate-200/70 rounded-2xl bg-white/90 hover:shadow-md transition"
                  >
                    <div className="flex gap-3 p-4">
                      {project.imageUrl ? (
                        <div className="w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                          <ImageWithFallback src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                        </div>
                      ) : null}
                      <div className="flex-1 space-y-1">
                        <h4 className="font-semibold">{project.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {forestTypeLabels[normalizeForestType(project.forestType)]}
                        </Badge>
                        <p className="text-sm text-gray-600 leading-relaxed">{previewBody(project.description)}</p>
                        <p className="text-xs text-muted-foreground">
                          {[project.province, project.country].filter(Boolean).join(", ")}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">{t("investor.showcase.noArchive", { defaultValue: "No projects yet." })}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
