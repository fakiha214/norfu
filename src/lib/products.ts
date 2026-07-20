import type { CategoryRow, ProductRow } from "@/db/schema";

export type SizeStock = { size: string; stock: number };

// A lightweight category reference attached to products for display/filtering.
export type CategoryRef = {
  id: number;
  slug: string;
  name: string;
  parentId: number | null;
};

// A top-level category with its (active) sub-categories — powers navigation.
export type CategoryNode = CategoryRow & { children: CategoryRow[] };

// Products are always served with their per-size stock and category attached.
export type Product = ProductRow & {
  sizes: SizeStock[];
  category: CategoryRef | null;
};

export type { CategoryRow };
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

// Virtual, non-category collections. These are driven by product flags
// (badge / sale price), not by the categories table, and their slugs are
// reserved — the admin must not create a category using one of them.
export const virtualCollections: CollectionMeta[] = [
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

export const RESERVED_COLLECTION_SLUGS = virtualCollections.map((c) => c.slug);

export const virtualCollectionBySlug = (slug: string) =>
  virtualCollections.find((c) => c.slug === slug);

export const titleCaseSlug = (s: string) =>
  s
    .split("-")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");

export const DEFAULT_FREE_SHIPPING_THRESHOLD = 4000;
