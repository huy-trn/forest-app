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

export function BlogPostClient({ locale, post }: { locale: string; post: Post | null }) {
  const { t } = useTranslation();

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-10 space-y-4">
          <Link href={`/${locale}/blog`} className="text-sm text-green-700 hover:text-green-900">
            ← {t("blog.back", { defaultValue: "Back to blog" })}
          </Link>
          <h1 className="text-2xl font-semibold">{t("blog.notFound", { defaultValue: "Post not found" })}</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-10 space-y-6">
        <Link href={`/${locale}/blog`} className="text-sm text-green-700 hover:text-green-900">
          ← {t("blog.back", { defaultValue: "Back to blog" })}
        </Link>
        <article className="bg-white rounded-lg border p-6 shadow-sm space-y-4">
          <h1 className="text-3xl font-semibold">{post.title}</h1>
          {post.imageUrl ? (
            <div className="rounded-lg overflow-hidden">
              <img src={post.imageUrl} alt={post.title} className="w-full h-auto object-cover" />
            </div>
          ) : null}
          <p className="text-base leading-relaxed text-gray-700 whitespace-pre-line">{post.body}</p>
        </article>
      </div>
    </div>
  );
}
