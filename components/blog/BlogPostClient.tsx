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
          <Link href={`/${locale}`} className="text-sm text-green-700 hover:text-green-900">
            ← {t("blog.back", { defaultValue: "Back to blog" })}
          </Link>
          <h1 className="text-2xl font-semibold">{t("blog.notFound", { defaultValue: "Post not found" })}</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <Link href={`/${locale}`} className="text-sm text-green-700 hover:text-green-900">
            ← {t("blog.back", { defaultValue: "Back to blog" })}
          </Link>
        </div>
        <article className="bg-white rounded-2xl border shadow-sm max-w-4xl mx-auto overflow-hidden">
          {post.imageUrl ? (
            <div className="w-full h-72 md:h-80 lg:h-96 bg-gray-100 overflow-hidden">
              <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
            </div>
          ) : null}
          <div className="p-6 md:p-8 space-y-6">
            <h1 className="text-3xl font-semibold leading-tight">{post.title}</h1>
            <div
              className="prose prose-gray max-w-none text-gray-800"
              dangerouslySetInnerHTML={{ __html: post.body || "" }}
            />
          </div>
        </article>
      </div>
    </div>
  );
}
