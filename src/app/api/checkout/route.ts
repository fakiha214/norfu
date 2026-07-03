import { NextResponse } from "next/server";
import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, products, productSizes, settings } from "@/db/schema";
import {
  DEFAULT_FREE_SHIPPING_THRESHOLD,
  DEFAULT_SHIPPING_FEE,
  MAX_QTY_PER_LINE,
} from "@/lib/products";

type CheckoutLine = { slug: string; size: string; color?: string; qty: number };

type Issue = { slug: string; size: string; reason: string; available?: number };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-() ]{7,20}$/;

function generateOrderNumber() {
  // Unguessable order number, e.g. NF-8F3K2Q7C
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let suffix = "";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  for (const b of bytes) suffix += alphabet[b % alphabet.length];
  return `NF-${suffix}`;
}

export async function POST(request: Request) {
  let body: {
    customer?: Record<string, unknown>;
    lines?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // ---- Validate customer details -------------------------------------
  const c = body.customer ?? {};
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const customer = {
    name: str(c.name),
    email: str(c.email).toLowerCase(),
    phone: str(c.phone),
    address: str(c.address),
    city: str(c.city),
    notes: str(c.notes).slice(0, 1000),
  };

  const fieldErrors: Record<string, string> = {};
  if (customer.name.length < 2) fieldErrors.name = "Please enter your full name.";
  if (!EMAIL_RE.test(customer.email))
    fieldErrors.email = "Please enter a valid email — we confirm orders by email.";
  if (!PHONE_RE.test(customer.phone))
    fieldErrors.phone = "Please enter a valid phone number.";
  if (customer.address.length < 8)
    fieldErrors.address = "Please enter your complete street address.";
  if (customer.city.length < 2) fieldErrors.city = "Please enter your city.";
  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json({ error: "Invalid details.", fieldErrors }, { status: 400 });
  }

  // ---- Validate + normalize lines ------------------------------------
  if (!Array.isArray(body.lines) || body.lines.length === 0) {
    return NextResponse.json({ error: "Your basket is empty." }, { status: 400 });
  }
  if (body.lines.length > 50) {
    return NextResponse.json({ error: "Too many items in one order." }, { status: 400 });
  }

  // Merge duplicate slug+size lines; reject absurd quantities outright.
  const merged = new Map<string, CheckoutLine>();
  for (const raw of body.lines as Record<string, unknown>[]) {
    const slug = str(raw?.slug);
    const size = str(raw?.size);
    const qty = Math.round(Number(raw?.qty));
    if (!slug || !size || !Number.isFinite(qty) || qty < 1) continue;
    if (qty > MAX_QTY_PER_LINE) {
      return NextResponse.json(
        { error: `Maximum ${MAX_QTY_PER_LINE} pieces per item per order.` },
        { status: 400 }
      );
    }
    const key = `${slug}::${size}`;
    const existing = merged.get(key);
    const nextQty = Math.min(MAX_QTY_PER_LINE, (existing?.qty ?? 0) + qty);
    merged.set(key, { slug, size, color: str(raw?.color), qty: nextQty });
  }
  const lines = [...merged.values()];
  if (lines.length === 0) {
    return NextResponse.json({ error: "Your basket is empty." }, { status: 400 });
  }

  // ---- Check products + stock ----------------------------------------
  const slugs = [...new Set(lines.map((l) => l.slug))];
  const productRows = await db
    .select()
    .from(products)
    .where(and(inArray(products.slug, slugs), eq(products.isActive, true)));
  const bySlug = new Map(productRows.map((p) => [p.slug, p]));

  const sizeRows = productRows.length
    ? await db
        .select()
        .from(productSizes)
        .where(inArray(productSizes.productId, productRows.map((p) => p.id)))
    : [];
  const stockOf = (productId: number, size: string) =>
    sizeRows.find((s) => s.productId === productId && s.size === size);

  const issues: Issue[] = [];
  for (const line of lines) {
    const product = bySlug.get(line.slug);
    if (!product) {
      issues.push({ slug: line.slug, size: line.size, reason: "no-longer-available" });
      continue;
    }
    const sizeRow = stockOf(product.id, line.size);
    if (!sizeRow) {
      issues.push({ slug: line.slug, size: line.size, reason: "size-unavailable" });
    } else if (sizeRow.stock < line.qty) {
      issues.push({
        slug: line.slug,
        size: line.size,
        reason: "insufficient-stock",
        available: sizeRow.stock,
      });
    }
  }
  if (issues.length > 0) {
    return NextResponse.json(
      { error: "Some items are no longer available.", issues },
      { status: 409 }
    );
  }

  // ---- Decrement stock (conditional updates guard against races) ------
  const decremented: { productId: number; size: string; qty: number }[] = [];
  const rollback = async () => {
    for (const d of decremented) {
      await db
        .update(productSizes)
        .set({ stock: sql`${productSizes.stock} + ${d.qty}` })
        .where(
          and(eq(productSizes.productId, d.productId), eq(productSizes.size, d.size))
        );
    }
  };

  for (const line of lines) {
    const product = bySlug.get(line.slug)!;
    const updated = await db
      .update(productSizes)
      .set({ stock: sql`${productSizes.stock} - ${line.qty}` })
      .where(
        and(
          eq(productSizes.productId, product.id),
          eq(productSizes.size, line.size),
          gte(productSizes.stock, line.qty)
        )
      )
      .returning({ id: productSizes.id });
    if (updated.length === 0) {
      // Someone bought the last pieces between our check and now.
      await rollback();
      return NextResponse.json(
        {
          error: "Some items sold out while you were checking out.",
          issues: [{ slug: line.slug, size: line.size, reason: "insufficient-stock" }],
        },
        { status: 409 }
      );
    }
    decremented.push({ productId: product.id, size: line.size, qty: line.qty });
  }

  // ---- Totals (always server-side prices) ------------------------------
  const subtotal = lines.reduce((sum, l) => {
    const p = bySlug.get(l.slug)!;
    return sum + (p.salePrice ?? p.price) * l.qty;
  }, 0);

  const settingRows = await db.select().from(settings);
  const settingMap = Object.fromEntries(settingRows.map((s) => [s.key, s.value]));
  const threshold =
    Number(settingMap.free_shipping_threshold) || DEFAULT_FREE_SHIPPING_THRESHOLD;
  const shippingFee =
    subtotal >= threshold ? 0 : Number(settingMap.shipping_fee) || DEFAULT_SHIPPING_FEE;
  const total = subtotal + shippingFee;

  // ---- Create the order ------------------------------------------------
  try {
    let order;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const inserted = await db
          .insert(orders)
          .values({
            orderNumber: generateOrderNumber(),
            customerName: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            city: customer.city,
            notes: customer.notes,
            paymentMethod: "cod",
            subtotal,
            shippingFee,
            total,
          })
          .returning();
        order = inserted[0];
        break;
      } catch (e) {
        // Retry only on the (astronomically unlikely) order-number collision.
        if (attempt === 2) throw e;
      }
    }
    if (!order) throw new Error("order insert failed");

    await db.insert(orderItems).values(
      lines.map((l) => {
        const p = bySlug.get(l.slug)!;
        return {
          orderId: order.id,
          productId: p.id,
          slug: p.slug,
          name: p.name,
          size: l.size,
          color: l.color ?? "",
          image: p.imageA,
          unitPrice: p.salePrice ?? p.price,
          qty: l.qty,
        };
      })
    );

    return NextResponse.json({
      ok: true,
      orderNumber: order.orderNumber,
      subtotal,
      shippingFee,
      total,
    });
  } catch (e) {
    await rollback();
    console.error("checkout failed", e);
    return NextResponse.json(
      { error: "Something went wrong placing your order. You have not been charged — please try again." },
      { status: 500 }
    );
  }
}
