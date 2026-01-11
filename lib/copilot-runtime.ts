import { CopilotRuntime } from "@copilotkit/runtime";
import { prisma } from "@/lib/prisma";
import type { TokenPayload } from "@/lib/auth-types";

type RuntimeOptions = {
  user: TokenPayload;
  url?: string;
};

export function getCopilotRuntime({ user, url }: RuntimeOptions) {
  const isAdmin = user.role === "admin" || user.role === "root";
  const isPartner = user.role === "partner";
  const isInvestor = user.role === "investor";
  const actions = [];

  if (isAdmin) {
    actions.push(
      {
        name: "listUsers",
        description: "List users with basic profile info.",
        parameters: [
          {
            name: "limit",
            type: "number",
            description: "Maximum number of users to return.",
          },
        ],
        handler: async ({ limit }: { limit?: number }) => {
          const take = Math.min(50, Math.max(1, Number(limit ?? 10)));
          const users = await prisma.user.findMany({
            take,
            orderBy: { joinDate: "desc" },
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              status: true,
              joinDate: true,
            },
          });
          return users.map((u) => ({
            ...u,
            joinDate: u.joinDate?.toISOString?.() ?? u.joinDate,
          }));
        },
      },
      {
        name: "searchUsers",
        description: "Search users by name, email, or phone.",
        parameters: [
          {
            name: "query",
            type: "string",
            description: "Search term for name, email, or phone.",
            required: true,
          },
        ],
        handler: async ({ query }: { query: string }) => {
          const trimmed = query.trim();
          if (!trimmed) return [];
          const users = await prisma.user.findMany({
            where: {
              OR: [
                { name: { contains: trimmed, mode: "insensitive" } },
                { email: { contains: trimmed, mode: "insensitive" } },
                { phone: { contains: trimmed } },
              ],
            },
            take: 20,
            orderBy: { joinDate: "desc" },
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              status: true,
              joinDate: true,
            },
          });
          return users.map((u) => ({
            ...u,
            joinDate: u.joinDate?.toISOString?.() ?? u.joinDate,
          }));
        },
      },
      {
        name: "getUserByEmail",
        description: "Fetch a user profile by email.",
        parameters: [
          {
            name: "email",
            type: "string",
            description: "User email address.",
            required: true,
          },
        ],
        handler: async ({ email }: { email: string }) => {
          const found = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              status: true,
              joinDate: true,
            },
          });
          if (!found) return null;
          return {
            ...found,
            joinDate: found.joinDate?.toISOString?.() ?? found.joinDate,
          };
        },
      },
      {
        name: "countProjectsByStatus",
        description: "Count projects grouped by status.",
        parameters: [],
        handler: async () => {
          const grouped = await prisma.project.groupBy({
            by: ["status"],
            _count: { status: true },
          });
          return grouped.map((g) => ({
            status: g.status,
            count: g._count.status,
          }));
        },
      },
      {
        name: "getDashboardContext",
        description: "Return a snapshot of recent users and projects for the dashboard.",
        parameters: [],
        handler: async () => {
          const [users, projects] = await Promise.all([
            prisma.user.findMany({
              take: 5,
              orderBy: { joinDate: "desc" },
              select: { id: true, name: true, role: true, joinDate: true },
            }),
            prisma.project.findMany({
              take: 5,
              orderBy: { createdAt: "desc" },
              select: { id: true, title: true, status: true, createdAt: true },
            }),
          ]);
          return {
            users: users.map((u) => ({
              ...u,
              joinDate: u.joinDate?.toISOString?.() ?? u.joinDate,
            })),
            projects: projects.map((p) => ({
              ...p,
              createdAt: p.createdAt?.toISOString?.() ?? p.createdAt,
            })),
            url,
          };
        },
      },
      {
        name: "listInvestorRequests",
        description: "List recent investor requests.",
        parameters: [
          {
            name: "limit",
            type: "number",
            description: "Maximum number of requests to return.",
          },
        ],
        handler: async ({ limit }: { limit?: number }) => {
          const take = Math.min(50, Math.max(1, Number(limit ?? 10)));
          const requests = await prisma.investorRequest.findMany({
            take,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              status: true,
              fromName: true,
              fromEmail: true,
              projectId: true,
              createdAt: true,
            },
          });
          return requests.map((r) => ({
            ...r,
            createdAt: r.createdAt?.toISOString?.() ?? r.createdAt,
          }));
        },
      },
    );
  }

  actions.push(
    {
      name: "listProjects",
      description: "List projects with summary fields.",
      parameters: [
        {
          name: "limit",
          type: "number",
          description: "Maximum number of projects to return.",
        },
      ],
      handler: async ({ limit }: { limit?: number }) => {
        const take = Math.min(50, Math.max(1, Number(limit ?? 10)));
        const projects = await prisma.project.findMany({
          take,
          orderBy: { createdAt: "desc" },
          where: isAdmin ? {} : { members: { some: { userId: user.sub } } },
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            forestType: true,
            country: true,
            province: true,
            area: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        return projects.map((p) => ({
          ...p,
          createdAt: p.createdAt?.toISOString?.() ?? p.createdAt,
          updatedAt: p.updatedAt?.toISOString?.() ?? p.updatedAt,
        }));
      },
    },
    {
      name: "listProjectsByForestType",
      description: "List projects filtered by forest type.",
      parameters: [
        {
          name: "forestType",
          type: "string",
          description: "Forest type to filter by (natural or artificial).",
          required: true,
        },
        {
          name: "limit",
          type: "number",
          description: "Maximum number of projects to return.",
        },
      ],
      handler: async ({ forestType, limit }: { forestType: string; limit?: number }) => {
        const normalized = forestType === "artificial" ? "artificial" : "natural";
        const take = Math.min(50, Math.max(1, Number(limit ?? 10)));
        const projects = await prisma.project.findMany({
          take,
          orderBy: { createdAt: "desc" },
          where: {
            forestType: normalized as any,
            ...(isAdmin ? {} : { members: { some: { userId: user.sub } } }),
          },
          select: {
            id: true,
            title: true,
            status: true,
            forestType: true,
            country: true,
            province: true,
            createdAt: true,
          },
        });
        return projects.map((p) => ({
          ...p,
          createdAt: p.createdAt?.toISOString?.() ?? p.createdAt,
        }));
      },
    },
    {
      name: "getProjectById",
      description: "Fetch a project and its members by project id.",
      parameters: [
        {
          name: "projectId",
          type: "string",
          description: "Project id.",
          required: true,
        },
      ],
      handler: async ({ projectId }: { projectId: string }) => {
        const project = await prisma.project.findFirst({
          where: {
            id: projectId,
            ...(isAdmin ? {} : { members: { some: { userId: user.sub } } }),
          },
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, role: true },
                },
              },
            },
          },
        });
        if (!project) return null;
        return {
          ...project,
          createdAt: project.createdAt?.toISOString?.() ?? project.createdAt,
          updatedAt: project.updatedAt?.toISOString?.() ?? project.updatedAt,
          members: project.members.map((m) => ({
            id: m.user.id,
            name: m.user.name,
            email: m.user.email,
            role: m.role,
          })),
        };
      },
    },
  );

  if (isAdmin || isPartner) {
    actions.push(
      {
        name: "listTickets",
        description: "List tickets, optionally filtered by project or status.",
        parameters: [
          {
            name: "projectId",
            type: "string",
            description: "Project id to filter by.",
          },
          {
            name: "status",
            type: "string",
            description: "Ticket status to filter by.",
          },
          {
            name: "limit",
            type: "number",
            description: "Maximum number of tickets to return.",
          },
        ],
        handler: async ({ projectId, status, limit }: { projectId?: string; status?: string; limit?: number }) => {
          const take = Math.min(50, Math.max(1, Number(limit ?? 10)));
          const where = {
            ...(projectId ? { projectId } : {}),
            ...(status ? { status: status as any } : {}),
            ...(isAdmin ? {} : { project: { members: { some: { userId: user.sub } } } }),
          };
          const tickets = await prisma.ticket.findMany({
            take,
            where,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              title: true,
              status: true,
              projectId: true,
              createdAt: true,
            },
          });
          return tickets.map((t) => ({
            ...t,
            createdAt: t.createdAt?.toISOString?.() ?? t.createdAt,
          }));
        },
      },
      {
        name: "getTicketById",
        description: "Fetch a ticket with comments and assignees.",
        parameters: [
          {
            name: "ticketId",
            type: "string",
            description: "Ticket id.",
            required: true,
          },
        ],
        handler: async ({ ticketId }: { ticketId: string }) => {
          const ticket = await prisma.ticket.findFirst({
            where: {
              id: ticketId,
              ...(isAdmin ? {} : { project: { members: { some: { userId: user.sub } } } }),
            },
            include: {
              assignees: { include: { user: { select: { id: true, name: true, email: true } } } },
              comments: { orderBy: { createdAt: "desc" }, take: 5 },
              project: { select: { id: true, title: true } },
            },
          });
          if (!ticket) return null;
          return {
            id: ticket.id,
            title: ticket.title,
            description: ticket.description,
            status: ticket.status,
            project: ticket.project,
            createdAt: ticket.createdAt?.toISOString?.() ?? ticket.createdAt,
            assignees: ticket.assignees.map((a) => ({
              id: a.user.id,
              name: a.user.name,
              email: a.user.email,
            })),
            comments: ticket.comments.map((c) => ({
              id: c.id,
              message: c.message,
              userId: c.userId,
              createdAt: c.createdAt?.toISOString?.() ?? c.createdAt,
            })),
          };
        },
      },
      {
        name: "listProjectLocations",
        description: "List locations for a project.",
        parameters: [
          {
            name: "projectId",
            type: "string",
            description: "Project id.",
            required: true,
          },
        ],
        handler: async ({ projectId }: { projectId: string }) => {
          const locations = await prisma.projectLocation.findMany({
            where: {
              projectId,
              deletedAt: null,
              ...(isAdmin ? {} : { project: { members: { some: { userId: user.sub } } } }),
            },
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              latitude: true,
              longitude: true,
              label: true,
              name: true,
              description: true,
              polygon: true,
              createdAt: true,
            },
          });
          return locations.map((l) => ({
            ...l,
            createdAt: l.createdAt?.toISOString?.() ?? l.createdAt,
          }));
        },
      },
    );
  }

  if (isInvestor) {
    actions.push(
      {
        name: "listMyInvestorRequests",
        description: "List investor requests submitted by the current investor.",
        parameters: [
          {
            name: "limit",
            type: "number",
            description: "Maximum number of requests to return.",
          },
        ],
        handler: async ({ limit }: { limit?: number }) => {
          const take = Math.min(50, Math.max(1, Number(limit ?? 10)));
          const requests = await prisma.investorRequest.findMany({
            take,
            orderBy: { createdAt: "desc" },
            where: { investorId: user.sub },
            select: {
              id: true,
              status: true,
              content: true,
              response: true,
              projectId: true,
              createdAt: true,
            },
          });
          return requests.map((r) => ({
            ...r,
            createdAt: r.createdAt?.toISOString?.() ?? r.createdAt,
          }));
        },
      },
    );
  }

  return new CopilotRuntime({ actions });
}
