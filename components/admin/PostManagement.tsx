"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { RichTextEditor } from "../ui/rich-text-editor";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { toast } from "sonner";

export function PostManagement({ locale }: { locale: string }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [postLocale, setPostLocale] = useState(locale);
  const [uploading, setUploading] = useState(false);
  const [heroLocale, setHeroLocale] = useState(locale);
  const [heroTitle, setHeroTitle] = useState("");
  const [heroDescription, setHeroDescription] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          imageUrl: imageUrl || undefined,
          locale: postLocale,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to create post");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success(t("admin.posts.created", { defaultValue: "Post created" }));
      setTitle("");
      setContent("");
      setImageUrl("");
      queryClient.invalidateQueries({ queryKey: ["posts", locale] });
    },
    onError: () => toast.error(t("common.error", { defaultValue: "Something went wrong" })),
  });

  const uploadInlineImage = async (file: File) => {
    const presignRes = await fetch("/api/uploads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: file.name, type: file.type }),
    });
    if (!presignRes.ok) throw new Error("presign_failed");
    const { uploadUrl, viewUrl } = await presignRes.json();

    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!uploadRes.ok) throw new Error("upload_failed");
    return viewUrl as string;
  };

  const listQuery = useQuery({
    queryKey: ["posts", locale, page],
    queryFn: async () => {
      const res = await fetch(`/api/posts?locale=${locale}`);
      if (!res.ok) throw new Error("Failed to load posts");
      return res.json() as Promise<
        { id: string; title: string; body: string; imageUrl?: string | null; locale?: string | null }[]
      >;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/posts?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      toast.success(t("admin.posts.deleted", { defaultValue: "Deleted" }));
      queryClient.invalidateQueries({ queryKey: ["posts", locale, page] });
    },
    onError: () => toast.error(t("common.error", { defaultValue: "Something went wrong" })),
  });

  const heroMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/showcase", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: heroLocale, heroTitle, heroDescription }),
      });
      if (!res.ok) throw new Error("Failed to save hero");
      return res.json();
    },
    onSuccess: () => {
      toast.success(t("admin.posts.heroSaved", { defaultValue: "Hero updated" }));
    },
    onError: () => toast.error(t("common.error", { defaultValue: "Something went wrong" })),
  });

  // Load current hero text on mount/locale change
  useQuery({
    queryKey: ["hero", heroLocale],
    queryFn: async () => {
      const res = await fetch(`/api/showcase?locale=${heroLocale}`);
      if (!res.ok) throw new Error("Failed to load hero");
      return res.json() as Promise<{ heroTitle?: string; heroDescription?: string }>;
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1 border border-green-100">
        <CardHeader>
          <CardTitle>{t("admin.posts.heroTitle", { defaultValue: "Hero text" })}</CardTitle>
          <p className="text-sm text-gray-600">
            {t("admin.posts.heroHint", { defaultValue: "Set the headline shown on the public showcase for this locale." })}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("admin.posts.heroLocale", { defaultValue: "Hero locale" })}</Label>
            <Input value={heroLocale} onChange={(e) => setHeroLocale(e.target.value)} placeholder="en" />
          </div>
          <div className="space-y-2">
            <Label>{t("admin.posts.heroTitle", { defaultValue: "Hero title" })}</Label>
            <Input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("admin.posts.heroDescription", { defaultValue: "Hero description" })}</Label>
            <Input value={heroDescription} onChange={(e) => setHeroDescription(e.target.value)} />
          </div>
          <Button variant="default" onClick={() => heroMutation.mutate()} disabled={heroMutation.isPending}>
            {heroMutation.isPending
              ? t("admin.posts.saving", { defaultValue: "Saving..." })
              : t("admin.posts.saveHero", { defaultValue: "Save hero" })}
          </Button>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 border">
        <CardHeader>
          <CardTitle>{t("admin.posts.title", { defaultValue: "Create post" })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{t("admin.posts.locale", { defaultValue: "Locale" })}</Label>
              <Input value={postLocale} onChange={(e) => setPostLocale(e.target.value)} placeholder="en" />
            </div>
            <div className="space-y-2">
              <Label>{t("admin.posts.postTitle", { defaultValue: "Title" })}</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("admin.posts.content", { defaultValue: "Content" })}</Label>
            <div className="rounded-lg border bg-gray-50 p-3 space-y-3">
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder={t("admin.posts.contentPlaceholder", { defaultValue: "Write your post..." })}
                onAttachUpload={async (files) => {
                  setUploading(true);
                  try {
                    const uploads = await Promise.all(files.map(uploadInlineImage));
                    return uploads.map((url) => ({ src: url }));
                  } finally {
                    setUploading(false);
                  }
                }}
              />
              <p className="text-xs text-gray-500">
                {uploading
                  ? t("admin.posts.uploading", { defaultValue: "Uploading..." })
                  : t("admin.posts.hint", { defaultValue: "Supports markdown. Paste or attach images." })}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("admin.posts.image", { defaultValue: "Image URL (optional)" })}</Label>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !title || !content}>
              {mutation.isPending
                ? t("admin.posts.saving", { defaultValue: "Saving..." })
                : t("admin.posts.save", { defaultValue: "Save post" })}
            </Button>
          </div>

          <div className="pt-4 border-t space-y-3">
            <h4 className="font-semibold text-sm">
              {t("admin.posts.list", { defaultValue: "Existing posts" })}
            </h4>
            {listQuery.isPending ? (
              <p className="text-sm text-gray-500">{t("admin.posts.loading", { defaultValue: "Loading..." })}</p>
            ) : null}
            {listQuery.data?.length ? (
              <div className="space-y-2">
                {listQuery.data.slice((page - 1) * pageSize, page * pageSize).map((post) => (
                  <div key={post.id} className="flex items-center justify-between border rounded p-3 bg-white">
                    <div className="space-y-1">
                      <p className="font-medium">{post.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{post.body}</p>
                      <Badge variant="outline" className="text-xs">{post.locale ?? "any"}</Badge>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate(post.id)}
                      disabled={deleteMutation.isPending}
                    >
                      {t("admin.posts.delete", { defaultValue: "Delete" })}
                    </Button>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    {t("common.back", { defaultValue: "Back" })}
                  </Button>
                  <p className="text-xs text-gray-600">
                    {page}/{Math.max(1, Math.ceil(listQuery.data.length / pageSize))}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((p) => Math.min(Math.max(1, Math.ceil(listQuery.data.length / pageSize)), p + 1))
                    }
                    disabled={page >= Math.ceil(listQuery.data.length / pageSize)}
                  >
                    {t("common.next", { defaultValue: "Next" })}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">{t("admin.posts.empty", { defaultValue: "No posts yet." })}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
