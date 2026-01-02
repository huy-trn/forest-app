"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

type Post = {
  id: string;
  title: string;
  body: string;
  imageUrl?: string | null;
  locale?: string | null;
};

export function BlogIndexClient({ locale, posts }: { locale: string; posts: Post[] }) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-10 space-y-6">
        <h1 className="text-3xl font-semibold">{t("blog.title", { defaultValue: "Blog" })}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/${locale}/blog/${post.id}`}
              className="block border rounded-lg bg-white p-4 hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-3">{post.body}</p>
            </Link>
          ))}
        </div>
        {posts.length === 0 ? (
          <p className="text-sm text-gray-600">
            {t("blog.empty", { defaultValue: "No posts yet." })}
          </p>
        ) : null}
      </div>
    </div>
  );
}
