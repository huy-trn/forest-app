import { BlogPostClient } from "@/components/blog/BlogPostClient";

type Post = {
  id: string;
  title: string;
  body: string;
  imageUrl?: string | null;
  locale?: string | null;
};

async function loadPost(id: string): Promise<Post | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/posts/${id}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  return res.json() as Promise<Post>;
}

export default async function BlogPostPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const locale = (params.locale || "en").toLowerCase();
  const post = await loadPost(params.id);

  return <BlogPostClient locale={locale} post={post} />;
}
