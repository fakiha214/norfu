import { and, asc, desc, eq, ilike, inArray, isNotNull, or } from "drizzle-orm";
import { db } from "@/db";
import {
  announcements,
  banners,
  orderItems,
  orders,
  products,
  productSizes,
  settings,
  type ProductRow,
} from "@/db/schema";
import type { Product, SizeStock } from "@/lib/products";

const activeOrder = [asc(products.sortOrder), asc(products.id)];

// Attach per-size stock to product rows in a single extra query.
async function attachSizes(rows: ProductRow[]): Promise<Product[]> {
  if (rows.length === 0) return [];
  const sizeRows = await db
    .select()
    .from(productSizes)
    .where(inArray(productSizes.productId, rows.map((r) => r.id)))
    .orderBy(asc(productSizes.sortOrder), asc(productSizes.id));

  const byProduct = new Map<number, SizeStock[]>();
  for (const s of sizeRows) {
    const list = byProduct.get(s.productId) ?? [];
    list.push({ size: s.size, stock: s.stock });
    byProduct.set(s.productId, list);
  }
  return rows.map((r) => ({ ...r, sizes: byProduct.get(r.id) ?? [] }));
}

export async function getSaleProducts(limit = 8): Promise<Product[]> {
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.isActive, true), isNotNull(products.salePrice)))
    .orderBy(...activeOrder)
    .limit(limit);
  return attachSizes(rows);
}

export async function getNewProducts(limit = 8): Promise<Product[]> {
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.isActive, true), eq(products.badge, "new")))
    .orderBy(...activeOrder)
    .limit(limit);
  return attachSizes(rows);
}

export async function getProductsByGender(
  gender: "men" | "women" | "juniors",
  limit = 100
): Promise<Product[]> {
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.isActive, true), eq(products.gender, gender)))
    .orderBy(...activeOrder)
    .limit(limit);
  return attachSizes(rows);
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
  return (await attachSizes(rows))[0];
}

export async function getRelatedProducts(product: Product, limit = 6): Promise<Product[]> {
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.isActive, true), eq(products.gender, product.gender)))
    .orderBy(...activeOrder)
    .limit(limit + 1);
  return attachSizes(rows.filter((p) => p.id !== product.id).slice(0, limit));
}

export async function searchProducts(query: string, limit = 6): Promise<ProductRow[]> {
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

export async function getOrderByNumber(orderNumber: string) {
  const orderRows = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .limit(1);
  const order = orderRows[0];
  if (!order) return undefined;
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id))
    .orderBy(asc(orderItems.id));
  return { order, items };
}

export async function getLatestProducts(limit = 8): Promise<Product[]> {
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(desc(products.createdAt))
    .limit(limit);
  return attachSizes(rows);
}
