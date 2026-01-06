import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-helpers";

export async function GET(req: Request) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json([]);
  }
  try {
    const base = process.env.NOMINATIM_URL?.replace(/\/$/, "") || "https://nominatim.openstreetmap.org";
    const url = `${base}/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(q)}`;
    try {
      const r = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 3600 },
      });
      if (r.ok) {
        const data = await r.json();
        return NextResponse.json(Array.isArray(data) ? data : []);
      }
    } catch {
      // ignore and try fallback
    }

    // Fallback to public Nominatim if self-hosted is not ready or errors
    const email = process.env.NOMINATIM_EMAIL || "admin@example.com";
    const publicUrl = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&email=${encodeURIComponent(email)}&q=${encodeURIComponent(q)}`;
    try {
      const r2 = await fetch(publicUrl, {
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 3600 },
      });
      if (r2.ok) {
        const data2 = await r2.json();
        return NextResponse.json(Array.isArray(data2) ? data2 : []);
      }
      return NextResponse.json([], { status: r2.status });
    } catch {
      return NextResponse.json([], { status: 502 });
    }
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
