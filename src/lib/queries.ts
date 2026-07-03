import { and, asc, desc, eq, ilike, isNotNull, or } from "drizzle-orm";
import { db } from "@/db";
import { announcements, banners, products, settings } from "@/db/schema";
import type { Product } from "@/lib/products";

const activeOrder = [asc(products.sortOrder), asc(products.id)];

export async function getSaleProducts(limit = 8): Promise<Product[]> {
  return db
    .select()
    .from(products)
    .where(and(eq(products.isActive, true), isNotNull(products.salePrice)))
    .orderBy(...activeOrder)
    .limit(limit);
}

export async function getNewProducts(limit = 8): Promise<Product[]> {
  return db
    .select()
    .from(products)
    .where(and(eq(products.isActive, true), eq(products.badge, "new")))
    .orderBy(...activeOrder)
    .limit(limit);
}

export async function getProductsByGender(
  gender: "men" | "women" | "juniors",
  limit = 100
): Promise<Product[]> {
  return db
    .select()
    .from(products)
    .where(and(eq(products.isActive, true), eq(products.gender, gender)))
    .orderBy(...activeOrder)
    .limit(limit);
}

export async function getCollectionProducts(slug: string): Promise<Product[]> {
  if (slug === "sale") return getSaleProducts(200);
  if (slug === "new-in") return getNewProducts(200);
  if (slug === "men" || slug === "women" || slug === "juniors") {
    return getProductsByGender(slug, 200);
  }
  return [];
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.isActive, true)))
    .limit(1);
  return rows[0];
}

export async function getRelatedProducts(product: Product, limit = 6): Promise<Product[]> {
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.isActive, true), eq(products.gender, product.gender)))
    .orderBy(...activeOrder)
    .limit(limit + 1);
  return rows.filter((p) => p.id !== product.id).slice(0, limit);
}

export async function searchProducts(query: string, limit = 6): Promise<Product[]> {
  const term = `%${query}%`;
  return db
    .select()
    .from(products)
    .where(
      and(
        eq(products.isActive, true),
        or(
          ilike(products.name, term),
          ilike(products.category, term),
          ilike(products.gender, term)
        )
      )
    )
    .orderBy(...activeOrder)
    .limit(limit);
}

export async function getBannerMap() {
  const rows = await db.select().from(banners).where(eq(banners.isActive, true));
  return Object.fromEntries(rows.map((b) => [b.slot, b]));
}

export async function getAnnouncements(): Promise<string[]> {
  const rows = await db
    .select()
    .from(announcements)
    .where(eq(announcements.isActive, true))
    .orderBy(asc(announcements.sortOrder), asc(announcements.id));
  return rows.map((a) => a.message);
}

export async function getSettings(): Promise<Record<string, string>> {
  const rows = await db.select().from(settings);
  return Object.fromEntries(rows.map((s) => [s.key, s.value]));
}

export async function getLatestProducts(limit = 8): Promise<Product[]> {
  return db
    .select()
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(desc(products.createdAt))
    .limit(limit);
}
