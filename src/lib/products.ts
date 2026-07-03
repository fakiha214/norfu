import type { ProductRow } from "@/db/schema";

export type SizeStock = { size: string; stock: number };

// Products are always served with their per-size stock attached.
export type Product = ProductRow & { sizes: SizeStock[] };

export type {
  ProductColor,
  BannerRow,
  AnnouncementRow,
  OrderRow,
  OrderItemRow,
} from "@/db/schema";

export const totalStock = (p: Pick<Product, "sizes">) =>
  p.sizes.reduce((sum, s) => sum + s.stock, 0);

export const isSoldOut = (p: Pick<Product, "sizes">) => totalStock(p) === 0;

export const DEFAULT_SHIPPING_FEE = 250;
export const MAX_QTY_PER_LINE = 10;

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
