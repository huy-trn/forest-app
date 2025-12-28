import { cookies, headers } from "next/headers";
import { verifyToken, TokenPayload } from "./jwt";

export async function getAuthTokenFromRequest(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7);
  }
  return null;
}

export async function getAuthTokenFromCookies(): Promise<string | null> {
  const cookieStore = cookies();
  return cookieStore.get("token")?.value ?? null;
}

export async function getUserFromRequest(req: Request): Promise<TokenPayload | null> {
  const headerToken = await getAuthTokenFromRequest(req);
  if (headerToken) {
    const verified = await verifyToken(headerToken);
    if (verified) return verified;
  }
  const cookieToken = await getAuthTokenFromCookies();
  if (cookieToken) {
    return verifyToken(cookieToken);
  }
  return null;
}

export async function getUserFromCookies(): Promise<TokenPayload | null> {
  const token = await getAuthTokenFromCookies();
  if (!token) return null;
  return verifyToken(token);
}
