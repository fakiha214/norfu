// Seeds the Neon database from src/data/catalog.json plus default
// banners, announcements and settings. Idempotent: existing rows
// (matched by slug/slot/key) are left untouched.
// Run: node scripts/seed.mjs
import "dotenv/config";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(readFileSync(join(root, "src/data/catalog.json"), "utf8"));

const sql = neon(process.env.DATABASE_URL);

const DEFAULT_STOCK = 20;

const titleCase = (s) =>
  s
    .split("-")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");

// Distinct categories from the catalog become top-level categories. (The shop
// is men/unisex only — there is no gender axis; sub-categories can be arranged
// afterwards in the admin panel.) A few get a placeholder tile image so the
// homepage category tiles render out of the box.
const TILE_IMAGES = [
  "/banners/cat-men.svg",
  "/banners/cat-women.svg",
  "/banners/cat-juniors.svg",
  "/banners/cat-sale.svg",
];
const categorySlugs = [...new Set(catalog.products.map((p) => p.category))];

let categoryCount = 0;
for (const [i, slug] of categorySlugs.entries()) {
  const rows = await sql`
    INSERT INTO categories (slug, name, parent_id, image_url, sort_order, is_active)
    VALUES (${slug}, ${titleCase(slug)}, NULL, ${TILE_IMAGES[i] ?? ""}, ${i}, true)
    ON CONFLICT (slug) DO NOTHING
    RETURNING id`;
  categoryCount += rows.length;
}
const catRows = await sql`SELECT id, slug FROM categories`;
const categoryIdBySlug = Object.fromEntries(catRows.map((c) => [c.slug, c.id]));
console.log(`categories: ${categoryCount} inserted, ${categorySlugs.length - categoryCount} already present`);

let inserted = 0;
for (const [i, p] of catalog.products.entries()) {
  const categoryId = categoryIdBySlug[p.category] ?? null;
  const rows = await sql`
    INSERT INTO products
      (slug, name, category_id, fit, price, sale_price, badge,
       description, colors, image_a, image_b, is_active, sort_order)
    VALUES
      (${p.slug}, ${p.name}, ${categoryId}, ${p.fit},
       ${p.price}, ${p.salePrice}, ${p.badge}, ${p.description},
       ${JSON.stringify(p.colors)},
       ${`/products/${p.id}-a.svg`}, ${`/products/${p.id}-b.svg`},
       true, ${i})
    ON CONFLICT (slug) DO NOTHING
    RETURNING id`;
  inserted += rows.length;
  if (rows.length > 0) {
    for (const [j, size] of p.sizes.entries()) {
      await sql`
        INSERT INTO product_sizes (product_id, size, stock, sort_order)
        VALUES (${rows[0].id}, ${size}, ${DEFAULT_STOCK}, ${j})
        ON CONFLICT (product_id, size) DO NOTHING`;
    }
  }
  // Idempotently link (or re-link) the product to its category by slug, so
  // re-seeding after the migration also files pre-existing rows.
  await sql`UPDATE products SET category_id = ${categoryId} WHERE slug = ${p.slug}`;
}
console.log(`products: ${inserted} inserted, ${catalog.products.length - inserted} already present`);

const banners = [
  {
    slot: "hero-1",
    kicker: "Summer '26 Collection",
    title: "WEAR THE EVERYDAY",
    copy: "",
    ctaLabel: "Shop New In",
    href: "/collections/new-in",
    imageUrl: "/banners/hero-1.svg",
  },
  {
    slot: "promo-1",
    kicker: "The Fabric Edit",
    title: "Linen, All Summer",
    copy: "Breathable weaves cut loose for 40° afternoons.",
    ctaLabel: "Shop Now",
    href: "/collections/new-in",
    imageUrl: "/banners/promo-1.svg",
  },
  {
    slot: "promo-2",
    kicker: "Denim Lab",
    title: "Washed To Order",
    copy: "Rigid denim, stone-washed and broken in for you.",
    ctaLabel: "Shop Now",
    href: "/collections/sale",
    imageUrl: "/banners/promo-2.svg",
  },
];

let bannerCount = 0;
for (const b of banners) {
  const rows = await sql`
    INSERT INTO banners (slot, kicker, title, copy, cta_label, href, image_url, is_active)
    VALUES (${b.slot}, ${b.kicker ?? ""}, ${b.title ?? ""}, ${b.copy ?? ""}, ${b.ctaLabel ?? ""}, ${b.href}, ${b.imageUrl}, true)
    ON CONFLICT (slot) DO NOTHING
    RETURNING id`;
  bannerCount += rows.length;
}
console.log(`banners: ${bannerCount} inserted`);

const announcements = [
  "SUMMER SALE — UP TO 50% OFF",
  "FREE SHIPPING ON ORDERS ABOVE PKR 4,000",
  "NEW DROP EVERY FRIDAY",
  "EASY 7-DAY RETURNS NATIONWIDE",
];
const existing = await sql`SELECT count(*)::int AS n FROM announcements`;
if (existing[0].n === 0) {
  for (const [i, message] of announcements.entries()) {
    await sql`INSERT INTO announcements (message, is_active, sort_order) VALUES (${message}, true, ${i})`;
  }
  console.log(`announcements: ${announcements.length} inserted`);
} else {
  console.log("announcements: already present, skipped");
}

const settingsRows = [
  ["free_shipping_threshold", "4000"],
  ["shipping_fee", "250"],
  ["sale_rail_title", "Summer Sale — Up to 50% Off"],
  ["new_rail_title", "New This Week"],
  ["featured_rail_title", "Best of Norfu"],
];
for (const [key, value] of settingsRows) {
  await sql`INSERT INTO settings (key, value) VALUES (${key}, ${value}) ON CONFLICT (key) DO NOTHING`;
}
console.log(`settings: ensured ${settingsRows.length} keys`);

console.log("Seed complete.");
