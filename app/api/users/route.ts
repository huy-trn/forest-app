import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, Role } from "@prisma/client";
import { hash } from "bcryptjs";
import { sendEmail } from "@/lib/email";
import { sendSms } from "@/lib/sms";
import crypto from "node:crypto";
import { requireUser, requireRole, ADMIN_ROLES } from "@/lib/api-auth";

export async function GET(request: Request) {
  const { user, response } = await requireUser(request);
  if (!user) return response!;
  const forbidden = requireRole(user, ADMIN_ROLES);
  if (forbidden) return forbidden;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(
    100,
    Math.max(1, Number.parseInt(searchParams.get("pageSize") ?? "10", 10))
  );
  const search = searchParams.get("search")?.trim();
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search } },
        ],
      }
    : undefined;

  const [total, users] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { joinDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({ items: users, page, pageSize, total });
}

export async function POST(request: Request) {
  const { user: authUser, response: authResponse } = await requireUser(request);
  if (!authUser) return authResponse!;
  const forbidden = requireRole(authUser, ADMIN_ROLES);
  if (forbidden) return forbidden;

  const body = await request.json();
  const { name, email, phone, role, password } = body as {
    name?: string;
    email?: string;
    phone?: string;
    role?: Role;
    password?: string;
  };

  const emailValue = email?.trim() || null;
  const phoneValue = phone?.trim() || null;

  if (!name || !role || (!emailValue && !phoneValue)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (emailValue) {
    const existingEmail = await prisma.user.findFirst({ where: { email: emailValue } });
    if (existingEmail) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 });
    }
  }

  if (phoneValue) {
    const existingPhone = await prisma.user.findFirst({ where: { phone: phoneValue } });
    if (existingPhone) {
      return NextResponse.json({ error: "User with this phone already exists" }, { status: 409 });
    }
  }

  const rawPassword = password || "";
  const passwordHash = rawPassword ? await hash(rawPassword, 10) : null;
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  let createdUser;
  try {
    createdUser = await prisma.user.create({
      data: {
        name,
        ...(emailValue ? { email: emailValue } : {}),
        ...(phoneValue ? { phone: phoneValue } : {}),
        role,
        status: "pending",
        passwordHash,
      },
    });

    await prisma.verificationToken.create({
      data: {
        identifier: emailValue ?? phoneValue ?? "",
        token,
        expires,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "User with this email/phone already exists" }, { status: 409 });
    }
    console.error("Failed to create user", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const identifier = emailValue ?? phoneValue ?? "";
  const resetLink = `${baseUrl}/onboarding?token=${token}&identifier=${encodeURIComponent(identifier)}`;

  if (emailValue) {
    await sendEmail({
      to: emailValue,
      subject: "Complete your account setup",
      text: `Hello ${name},\n\nSet your password and profile using this one-time link (expires in 24 hours):\n${resetLink}\n\nYour account stays pending until you finish onboarding.\n`,
    });
  }

  if (phoneValue) {
    await sendSms(
      phoneValue,
      `Hello ${name}, set your password with this link (24h): ${resetLink}`
    );
  }

  return NextResponse.json(createdUser, { status: 201 });
}

export async function DELETE(request: Request) {
  const { user, response } = await requireUser(request);
  if (!user) return response!;
  const forbidden = requireRole(user, ADMIN_ROLES);
  if (forbidden) return forbidden;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing user id" }, { status: 400 });

  const target = await prisma.user.findUnique({
    where: { id },
    select: { role: true },
  });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (target.role === Role.root) {
    return NextResponse.json({ error: "Cannot delete root user" }, { status: 403 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
