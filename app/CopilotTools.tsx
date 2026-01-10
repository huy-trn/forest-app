"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useFrontendTool } from "@copilotkit/react-core";

type CopilotToolsProps = {
  isAuthenticated: boolean;
  userRole: string | null;
};

export function CopilotTools({ isAuthenticated, userRole }: CopilotToolsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useMemo(() => {
    const segments = (pathname ?? "").split("/").filter(Boolean);
    return segments[0] || "en";
  }, [pathname]);

  const dashboardPath = useMemo(() => {
    if (!isAuthenticated || !userRole) return null;
    if (userRole === "admin" || userRole === "root") return `/${locale}/admin`;
    if (userRole === "partner") return `/${locale}/partner`;
    if (userRole === "investor") return `/${locale}/investor`;
    return null;
  }, [isAuthenticated, locale, userRole]);

  useFrontendTool({
    name: "navigateToPath",
    description: "Navigate to a path in the app.",
    parameters: [
      {
        name: "path",
        type: "string",
        description: "Path to navigate to, e.g. /en/login.",
        required: true,
      },
    ],
    handler: async ({ path }: { path: string }) => {
      if (!path) return;
      router.push(path);
    },
  });

  useFrontendTool({
    name: "goToHome",
    description: "Go to the locale home page.",
    parameters: [],
    handler: async () => {
      router.push(`/${locale}`);
    },
  });

  useFrontendTool({
    name: "goToLogin",
    description: "Go to the login page.",
    parameters: [],
    handler: async () => {
      router.push(`/${locale}/login`);
    },
  });

  useFrontendTool({
    name: "goToDashboard",
    description: "Go to the dashboard for the current role.",
    parameters: [],
    handler: async () => {
      if (!dashboardPath) return;
      router.push(dashboardPath);
    },
  });

  useFrontendTool({
    name: "openProject",
    description: "Open a public project detail page by project id.",
    parameters: [
      {
        name: "projectId",
        type: "string",
        description: "Project id to open.",
        required: true,
      },
    ],
    handler: async ({ projectId }: { projectId: string }) => {
      if (!projectId) return;
      router.push(`/${locale}/projects/${projectId}`);
    },
  });

  useFrontendTool({
    name: "summarizePublicProjects",
    description: "Summarize public projects with counts and newest items.",
    parameters: [
      {
        name: "limit",
        type: "number",
        description: "Maximum number of projects to analyze.",
      },
    ],
    handler: async ({ limit }: { limit?: number }) => {
      const take = Math.min(100, Math.max(1, Number(limit ?? 50)));
      const res = await fetch(`/api/projects?public=true`, { credentials: "include" });
      if (!res.ok) return { error: "Failed to load public projects." };
      const projects = (await res.json()) as Array<{
        id: string;
        title: string;
        forestType?: string | null;
        createdAt?: string;
      }>;
      const sample = projects.slice(0, take);
      const counts = sample.reduce(
        (acc, p) => {
          const type = p.forestType === "artificial" ? "artificial" : "natural";
          acc[type] += 1;
          return acc;
        },
        { natural: 0, artificial: 0 }
      );
      const newest = [...sample]
        .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
        .slice(0, 3)
        .map((p) => ({ id: p.id, title: p.title, forestType: p.forestType ?? "natural" }));
      return { total: sample.length, counts, newest };
    },
  });

  useFrontendTool({
    name: "findProjectByName",
    description: "Find public projects by name and return matches.",
    parameters: [
      {
        name: "query",
        type: "string",
        description: "Project name to search for.",
        required: true,
      },
    ],
    handler: async ({ query }: { query: string }) => {
      const trimmed = query.trim().toLowerCase();
      if (!trimmed) return [];
      const res = await fetch(`/api/projects?public=true`, { credentials: "include" });
      if (!res.ok) return [];
      const projects = (await res.json()) as Array<{ id: string; title: string; forestType?: string | null }>;
      return projects
        .filter((p) => p.title.toLowerCase().includes(trimmed))
        .slice(0, 10)
        .map((p) => ({ id: p.id, title: p.title, forestType: p.forestType ?? "natural" }));
    },
  });

  if (isAuthenticated) {
    useFrontendTool({
      name: "getMyProjectSnapshot",
      description: "Summarize projects visible to the current user.",
      parameters: [
        {
          name: "limit",
          type: "number",
          description: "Maximum number of projects to analyze.",
        },
      ],
      handler: async ({ limit }: { limit?: number }) => {
        const take = Math.min(50, Math.max(1, Number(limit ?? 20)));
        const res = await fetch(`/api/projects`, { credentials: "include" });
        if (!res.ok) return { error: "Failed to load projects." };
        const projects = (await res.json()) as Array<{
          id: string;
          title: string;
          status: string;
          forestType?: string | null;
          createdAt?: string;
        }>;
        const sample = projects.slice(0, take);
        const byStatus = sample.reduce<Record<string, number>>((acc, p) => {
          acc[p.status] = (acc[p.status] ?? 0) + 1;
          return acc;
        }, {});
        return {
          total: sample.length,
          byStatus,
          newest: sample.slice(0, 3).map((p) => ({ id: p.id, title: p.title, status: p.status })),
        };
      },
    });

    useFrontendTool({
      name: "summarizeTickets",
      description: "Summarize one or more tickets by id with recent log/comment content.",
      parameters: [
        {
          name: "ticketIds",
          type: "string[]",
          description: "Ticket ids to summarize.",
          required: true,
        },
        {
          name: "limitPerTicket",
          type: "number",
          description: "Max number of logs/comments to return per ticket.",
        },
      ],
      handler: async ({ ticketIds, limitPerTicket }: { ticketIds: string[]; limitPerTicket?: number }) => {
        const ids = Array.isArray(ticketIds) ? ticketIds.filter(Boolean).slice(0, 10) : [];
        if (ids.length === 0) return { error: "No ticket ids provided." };
        const itemLimit = Math.min(10, Math.max(1, Number(limitPerTicket ?? 5)));
        const details = await Promise.all(
          ids.map(async (id) => {
            const detailRes = await fetch(`/api/tickets/${id}`, { credentials: "include" });
            if (!detailRes.ok) {
              return { id, status: "unknown", comments: 0, logs: 0 };
            }
            const detail = (await detailRes.json()) as {
              id: string;
              title?: string;
              status?: string;
              comments?: Array<{ id: string; message: string; date?: string; userName?: string }>;
              logs?: Array<{ id: string; message: string; date?: string; userName?: string }>;
            };
            return {
              id: detail.id ?? id,
              title: detail.title ?? "",
              status: detail.status ?? "unknown",
              comments: (detail.comments ?? []).slice(0, itemLimit),
              logs: (detail.logs ?? []).slice(0, itemLimit),
              commentCount: detail.comments?.length ?? 0,
              logCount: detail.logs?.length ?? 0,
            };
          })
        );
        const byStatus = details.reduce<Record<string, number>>((acc, t) => {
          acc[t.status] = (acc[t.status] ?? 0) + 1;
          return acc;
        }, {});
        return {
          total: details.length,
          byStatus,
          details,
        };
      },
    });
  }

  return null;
}
