import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RequestStatus } from "@prisma/client";
import { requireUser, ADMIN_ROLES, isRole } from "@/lib/api-auth";

export async function GET(request: Request) {
  const { user, response } = await requireUser(request);
  if (!user) return response!;

  const isAdmin = isRole(user, ADMIN_ROLES);
  const where = isAdmin ? {} : { investorId: user.sub };

  const requests = await prisma.investorRequest.findMany({
    where,
    include: {
      investor: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    requests.map((req) => ({
      id: req.id,
      content: req.content,
      status: req.status,
      response: req.response,
      createdDate: req.createdAt.toISOString(),
      from: req.fromName ?? req.investor?.name ?? "Unknown",
      fromEmail: req.fromEmail ?? req.investor?.email,
      investorId: req.investorId,
      projectId: req.projectId,
      projectName: "",
    }))
  );
}

export async function POST(request: Request) {
  const { user, response } = await requireUser(request);
  if (!user) return response!;
  const isAdmin = isRole(user, ADMIN_ROLES);
  if (!isAdmin && user.role !== "investor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { content, fromName, fromEmail, status, response: responseText, investorId, projectId } = body as {
    content?: string;
    fromName?: string;
    fromEmail?: string;
    status?: RequestStatus;
    response?: string;
    investorId?: string;
    projectId?: string;
  };

  const created = await prisma.investorRequest.create({
    data: {
      content,
      fromName,
      fromEmail,
      status: status ?? RequestStatus.pending,
      response: responseText,
      investorId: isAdmin ? investorId : user.sub,
      projectId,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
