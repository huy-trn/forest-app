import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RequestStatus } from "@prisma/client";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const { status, response } = body as { status?: RequestStatus; response?: string };

  const updated = await prisma.investorRequest.update({
    where: { id: params.id },
    data: {
      status,
      response,
    },
  });

  return NextResponse.json(updated);
}
