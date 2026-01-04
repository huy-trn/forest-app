import { headers } from "next/headers";
import { BlogPostClient } from "@/components/blog/BlogPostClient";

type Post = {
  id: string;
  title: string;
  body: string;
  imageUrl?: string | null;
  locale?: string | null;
};

async function loadPost(id: string): Promise<Post | null> {
  const hdrs = headers();
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host");
  const base = process.env.NEXT_PUBLIC_BASE_URL || (host ? `${proto}://${host}` : "http://localhost:3000");

  const res = await fetch(new URL(`/api/posts/${id}`, base), {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  return res.json() as Promise<Post>;
}

export default async function PostPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const locale = (params.locale || "en").toLowerCase();
  const post = await loadPost(params.id);

  return <BlogPostClient locale={locale} post={post} />;
}
