export type ShowcasePost = {
  id?: string;
  title: string;
  body: string;
  imageUrl?: string;
  locale?: string;
};

export type ShowcaseContent = {
  heroTitle: string;
  heroDescription: string;
  posts: ShowcasePost[];
};
