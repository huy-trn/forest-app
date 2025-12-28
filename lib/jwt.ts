import { jwtVerify, SignJWT } from "jose";

const secret = process.env.JWT_SECRET || "dev-secret-change-me";
const key = new TextEncoder().encode(secret);

export type TokenPayload = {
  sub: string;
  role: string;
  email?: string | null;
  name?: string | null;
  phone?: string | null;
};

export async function signToken(payload: TokenPayload, expiresIn = "1d") {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresIn)
    .sign(key);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as TokenPayload;
  } catch {
    return null;
  }
}
