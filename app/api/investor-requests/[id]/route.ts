import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RequestStatus } from "@prisma/client";
import { requireUser, requireRole, ADMIN_ROLES } from "@/lib/api-auth";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { user, response: authResponse } = await requireUser(request);
  if (!user) return authResponse!;
  const forbidden = requireRole(user, ADMIN_ROLES);
  if (forbidden) return forbidden;

  const body = await request.json();
  const { status, response: responseText } = body as { status?: RequestStatus; response?: string };

  const updated = await prisma.investorRequest.update({
    where: { id: params.id },
    data: {
      status,
      response: responseText,
    },
  });

  return NextResponse.json(updated);
}
