import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions } from "./auth-options";
import type { TokenPayload } from "./auth-types";

const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

const toPayload = (token: any): TokenPayload | null => {
  if (!token?.sub) return null;
  return {
    sub: String(token.sub),
    role: token.role ?? null,
    email: token.email ?? null,
    name: token.name ?? null,
    phone: token.phone ?? null,
  };
};

export async function getUserFromRequest(req: Request): Promise<TokenPayload | null> {
  if (!authSecret) return null;
  let nextReq: NextRequest;
  try {
    nextReq = req instanceof NextRequest ? req : new NextRequest(req);
  } catch {
    nextReq = req as NextRequest;
  }
  const token = await getToken({ req: nextReq, secret: authSecret });
  return toPayload(token);
}

export async function getUserFromCookies(): Promise<TokenPayload | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return {
    sub: session.user.id,
    role: session.user.role ?? null,
    email: session.user.email ?? null,
    name: session.user.name ?? null,
    phone: session.user.phone ?? null,
  };
}
