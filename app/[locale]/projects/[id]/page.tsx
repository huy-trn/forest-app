import ProjectDetailClient from "@/app/(dashboard)/[locale]/projects/[id]/client";

export default function PublicProjectDetailPage({ params }: { params: { locale: string; id: string } }) {
  return <ProjectDetailClient projectId={params.id} isPublic />;
}
