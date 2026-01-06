export type ShowcaseProject = {
  id: string;
  title: string;
  description?: string | null;
  country?: string | null;
  province?: string | null;
  area?: string | null;
  forestType?: "natural" | "artificial";
  createdAt?: string;
  imageUrl?: string | null;
};

export type ShowcaseContent = {
  heroTitle: string;
  heroDescription: string;
  projects: ShowcaseProject[];
  stats?: {
    projects: string;
    area: string;
    trees: string;
  };
  features?: Array<{ title: string; description: string }>;
  featuredTitle?: string;
  featuredDescription?: string;
  impactTitle?: string;
  impactDescription?: string;
  impact?: Array<{ title: string; value: string; description?: string }>;
};
