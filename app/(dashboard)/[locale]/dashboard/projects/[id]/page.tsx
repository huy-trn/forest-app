import ProjectDetailClient from "@/app/(dashboard)/[locale]/projects/[id]/client";

export default function PrivateProjectDetailPage({ params }: { params: { locale: string; id: string } }) {
  return <ProjectDetailClient projectId={params.id} isPublic={false} />;
}
