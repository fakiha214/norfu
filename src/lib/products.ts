import type { ProductRow } from "@/db/schema";

export type Product = ProductRow;
export type { ProductColor, BannerRow, AnnouncementRow } from "@/db/schema";

export const formatPKR = (n: number) => `PKR ${n.toLocaleString("en-PK")}`;

export const discountPercent = (p: Pick<Product, "price" | "salePrice">) =>
  p.salePrice ? Math.round((1 - p.salePrice / p.price) * 100) : 0;

export type CollectionMeta = {
  slug: string;
  title: string;
  tagline: string;
};

export const collections: CollectionMeta[] = [
  {
    slug: "men",
    title: "Men",
    tagline: "Everyday essentials, built to last past the season.",
  },
  {
    slug: "women",
    title: "Women",
    tagline: "Fluid silhouettes and staples with intent.",
  },
  {
    slug: "juniors",
    title: "Juniors",
    tagline: "Made for play, washed for parents.",
  },
  {
    slug: "new-in",
    title: "New In",
    tagline: "This week's drop, fresh off the line.",
  },
  {
    slug: "sale",
    title: "Summer Sale",
    tagline: "Up to 50% off, while sizes last.",
  },
];

export const collectionBySlug = (slug: string) =>
  collections.find((c) => c.slug === slug);

export const DEFAULT_FREE_SHIPPING_THRESHOLD = 4000;
