import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { signToken } from "@/lib/jwt";

export async function POST(request: Request) {
  const { email, password } = (await request.json().catch(() => ({}))) as { email?: string; password?: string };
  if (!email || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const ok = await compare(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await signToken({
    sub: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
    phone: user.phone,
  });

  const res = NextResponse.json({ token, user: { id: user.id, role: user.role, email: user.email, name: user.name, phone: user.phone } });
  res.cookies.set("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
  return res;
}
