import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-helpers";

export async function requireUser(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return { user: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user, response: null };
}
