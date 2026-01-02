import { BlogIndexClient } from "@/components/blog/BlogIndexClient";

type Post = {
  id: string;
  title: string;
  body: string;
  imageUrl?: string | null;
  locale?: string | null;
};

export default async function BlogIndex({ params }: { params: { locale: string } }) {
  const locale = (params.locale || "en").toLowerCase();
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/posts?locale=${locale}`, {
    next: { revalidate: 60 },
  });
  const posts = (res.ok ? ((await res.json()) as Post[]) : []) || [];

  return <BlogIndexClient locale={locale} posts={posts} />;
}
