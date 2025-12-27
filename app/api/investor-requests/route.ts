import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RequestStatus } from "@prisma/client";

export async function GET() {
  const requests = await prisma.investorRequest.findMany({
    include: {
      investor: true,
      project: true,
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
      projectName: req.project?.title ?? "",
    }))
  );
}

export async function POST(request: Request) {
  const body = await request.json();
  const { content, fromName, fromEmail, status, response, investorId, projectId } = body as {
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
      response,
      investorId,
      projectId,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
