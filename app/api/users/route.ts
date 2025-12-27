import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { joinDate: "desc" },
  });
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, phone, role } = body as {
    name?: string;
    email?: string;
    phone?: string;
    role?: Role;
  };

  if (!name || !role) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      role,
      status: "pending",
    },
  });

  return NextResponse.json(user, { status: 201 });
}
