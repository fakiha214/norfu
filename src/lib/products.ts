import catalog from "@/data/catalog.json";

export type ProductColor = { name: string; hex: string };

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  gender: "men" | "women" | "juniors";
  fit: string;
  price: number;
  salePrice: number | null;
  badge: "sale" | "new" | null;
  silhouette: string;
  colors: ProductColor[];
  sizes: string[];
  description: string;
};

export const products = catalog.products as Product[];

export const imageA = (p: Product) => `/products/${p.id}-a.svg`;
export const imageB = (p: Product) => `/products/${p.id}-b.svg`;

export const formatPKR = (n: number) => `PKR ${n.toLocaleString("en-PK")}`;

export const discountPercent = (p: Product) =>
  p.salePrice ? Math.round((1 - p.salePrice / p.price) * 100) : 0;

export const bySlug = (slug: string) => products.find((p) => p.slug === slug);

export type Collection = {
  slug: string;
  title: string;
  tagline: string;
  filter: (p: Product) => boolean;
};

export const collections: Collection[] = [
  {
    slug: "men",
    title: "Men",
    tagline: "Everyday essentials, built to last past the season.",
    filter: (p) => p.gender === "men",
  },
  {
    slug: "women",
    title: "Women",
    tagline: "Fluid silhouettes and staples with intent.",
    filter: (p) => p.gender === "women",
  },
  {
    slug: "juniors",
    title: "Juniors",
    tagline: "Made for play, washed for parents.",
    filter: (p) => p.gender === "juniors",
  },
  {
    slug: "new-in",
    title: "New In",
    tagline: "This week's drop, fresh off the line.",
    filter: (p) => p.badge === "new",
  },
  {
    slug: "sale",
    title: "Summer Sale",
    tagline: "Up to 50% off, while sizes last.",
    filter: (p) => p.salePrice !== null,
  },
];

export const collectionBySlug = (slug: string) =>
  collections.find((c) => c.slug === slug);

export const FREE_SHIPPING_THRESHOLD = 4000;
