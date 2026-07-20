import { and, asc, desc, eq, ilike, inArray, isNotNull, or } from "drizzle-orm";
import { db } from "@/db";
import {
  announcements,
  banners,
  categories,
  orderItems,
  orders,
  products,
  productSizes,
  settings,
  type CategoryRow,
  type ProductRow,
} from "@/db/schema";
import type {
  CategoryNode,
  CategoryRef,
  Product,
  SizeStock,
} from "@/lib/products";

const activeOrder = [asc(products.sortOrder), asc(products.id)];

// ---- Categories -----------------------------------------------------------

// Every active category, ordered for display. Small table — safe to load whole.
export async function getAllCategories(): Promise<CategoryRow[]> {
  return db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

function toRef(c: CategoryRow): CategoryRef {
  return { id: c.id, slug: c.slug, name: c.name, parentId: c.parentId };
}

// Build the top-level → sub-category tree used by the header and footer.
export async function getNavCategories(): Promise<CategoryNode[]> {
  const all = await getAllCategories();
  const tops = all.filter((c) => c.parentId === null);
  return tops.map((t) => ({
    ...t,
    children: all.filter((c) => c.parentId === t.id),
  }));
}

// Top-level categories that have a tile image — powers the homepage tiles.
export async function getCategoryTiles(limit = 4): Promise<CategoryRow[]> {
  const all = await getAllCategories();
  return all
    .filter((c) => c.parentId === null && c.imageUrl.trim() !== "")
    .slice(0, limit);
}

export async function getSubcategories(parentId: number): Promise<CategoryRow[]> {
  return db
    .select()
    .from(categories)
    .where(and(eq(categories.parentId, parentId), eq(categories.isActive, true)))
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function getCategoryBySlug(
  slug: string
): Promise<CategoryRow | undefined> {
  const rows = await db
    .select()
    .from(categories)
    .where(and(eq(categories.slug, slug), eq(categories.isActive, true)))
    .limit(1);
  return rows[0];
}

// ---- Product enrichment ---------------------------------------------------

// Attach per-size stock and the (light) category reference to product rows.
async function enrich(rows: ProductRow[]): Promise<Product[]> {
  if (rows.length === 0) return [];

  const sizeRows = await db
    .select()
    .from(productSizes)
    .where(inArray(productSizes.productId, rows.map((r) => r.id)))
    .orderBy(asc(productSizes.sortOrder), asc(productSizes.id));

  const sizesByProduct = new Map<number, SizeStock[]>();
  for (const s of sizeRows) {
    const list = sizesByProduct.get(s.productId) ?? [];
    list.push({ size: s.size, stock: s.stock });
    sizesByProduct.set(s.productId, list);
  }

  const catIds = [...new Set(rows.map((r) => r.categoryId).filter((v): v is number => v !== null))];
  const catById = new Map<number, CategoryRef>();
  if (catIds.length > 0) {
    const catRows = await db
      .select()
      .from(categories)
      .where(inArray(categories.id, catIds));
    for (const c of catRows) catById.set(c.id, toRef(c));
  }

  return rows.map((r) => ({
    ...r,
    sizes: sizesByProduct.get(r.id) ?? [],
    category: r.categoryId !== null ? catById.get(r.categoryId) ?? null : null,
  }));
}

// ---- Product queries ------------------------------------------------------

export async function getSaleProducts(limit = 8): Promise<Product[]> {
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.isActive, true), isNotNull(products.salePrice)))
    .orderBy(...activeOrder)
    .limit(limit);
  return enrich(rows);
}

export async function getNewProducts(limit = 8): Promise<Product[]> {
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.isActive, true), eq(products.badge, "new")))
    .orderBy(...activeOrder)
    .limit(limit);
  return enrich(rows);
}

// A generic "featured" rail — most recently added active products.
export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(desc(products.createdAt))
    .limit(limit);
  return enrich(rows);
}

// Products filed under a category. For a top-level category this includes every
// product in it and in any of its sub-categories; for a sub-category it is just
// that sub-category.
export async function getProductsByCategory(
  category: CategoryRow,
  limit = 200
): Promise<Product[]> {
  const ids = [category.id];
  if (category.parentId === null) {
    const children = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.parentId, category.id));
    ids.push(...children.map((c) => c.id));
  }
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.isActive, true), inArray(products.categoryId, ids)))
    .orderBy(...activeOrder)
    .limit(limit);
  return enrich(rows);
}

export async function getCollectionProducts(slug: string): Promise<Product[]> {
  if (slug === "sale") return getSaleProducts(200);
  if (slug === "new-in") return getNewProducts(200);
  const category = await getCategoryBySlug(slug);
  if (!category) return [];
  return getProductsByCategory(category);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.isActive, true)))
    .limit(1);
  return (await enrich(rows))[0];
}

// Related products: other active products sharing the same category (falling
// back to the parent category so a sub-category still surfaces siblings).
export async function getRelatedProducts(
  product: Product,
  limit = 6
): Promise<Product[]> {
  let rows: ProductRow[] = [];
  if (product.category) {
    const parentId = product.category.parentId ?? product.category.id;
    const kin = await db
      .select({ id: categories.id })
      .from(categories)
      .where(or(eq(categories.id, parentId), eq(categories.parentId, parentId)));
    const ids = kin.map((c) => c.id);
    if (ids.length > 0) {
      rows = await db
        .select()
        .from(products)
        .where(and(eq(products.isActive, true), inArray(products.categoryId, ids)))
        .orderBy(...activeOrder)
        .limit(limit + 1);
    }
  }
  if (rows.length === 0) {
    rows = await db
      .select()
      .from(products)
      .where(eq(products.isActive, true))
      .orderBy(...activeOrder)
      .limit(limit + 1);
  }
  const related = await enrich(rows.filter((p) => p.id !== product.id).slice(0, limit));
  return related;
}

export async function searchProducts(query: string, limit = 6): Promise<Product[]> {
  const term = `%${query}%`;
  // Match product name/fit, or a category (top-level or sub) whose name matches.
  const matchedCats = await db
    .select({ id: categories.id })
    .from(categories)
    .where(ilike(categories.name, term));
  const catIds = matchedCats.map((c) => c.id);

  const rows = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.isActive, true),
        or(
          ilike(products.name, term),
          ilike(products.fit, term),
          ...(catIds.length > 0 ? [inArray(products.categoryId, catIds)] : [])
        )
      )
    )
    .orderBy(...activeOrder)
    .limit(limit);
  return enrich(rows);
}

// ---- Other content --------------------------------------------------------

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
  return enrich(rows);
}
