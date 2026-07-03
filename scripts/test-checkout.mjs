// End-to-end checkout smoke test against the local dev server.
// Places a real order, verifies stock decremented, then cleans up
// (deletes the order and restores stock).
import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
const base = "http://localhost:3000";

const before = await sql`
  SELECT ps.stock FROM product_sizes ps
  JOIN products p ON p.id = ps.product_id
  WHERE p.slug = 'heavyweight-boxy-tee-ecru' AND ps.size = 'M'`;
console.log("stock before:", before[0].stock);

// 1. Invalid payload should 400
const bad = await fetch(`${base}/api/checkout`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ customer: { name: "x" }, lines: [] }),
});
console.log("invalid payload status (expect 400):", bad.status);

// 2. Excessive quantity should 409
const tooMany = await fetch(`${base}/api/checkout`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    customer: {
      name: "Test Customer", email: "test@example.com", phone: "0300-1234567",
      address: "House 1, Test Street, Test Area", city: "Karachi",
    },
    lines: [{ slug: "heavyweight-boxy-tee-ecru", size: "M", qty: 9999 }],
  }),
});
console.log("huge qty status (expect 409 or clamped ok):", tooMany.status);
if (tooMany.status === 409) console.log("  issues:", JSON.stringify((await tooMany.json()).issues));

// 3. Valid order should succeed
const good = await fetch(`${base}/api/checkout`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    customer: {
      name: "Test Customer", email: "test@example.com", phone: "0300-1234567",
      address: "House 1, Test Street, Test Area", city: "Karachi", notes: "smoke test",
    },
    lines: [
      { slug: "heavyweight-boxy-tee-ecru", size: "M", color: "Ecru", qty: 2 },
      { slug: "textured-knit-polo", size: "L", color: "Olive", qty: 1 },
    ],
  }),
});
const result = await good.json();
console.log("valid order status (expect 200):", good.status, JSON.stringify(result));

const after = await sql`
  SELECT ps.stock FROM product_sizes ps
  JOIN products p ON p.id = ps.product_id
  WHERE p.slug = 'heavyweight-boxy-tee-ecru' AND ps.size = 'M'`;
console.log("stock after (expect -2):", after[0].stock);

// 4. Confirmation page should render
if (result.orderNumber) {
  const page = await fetch(`${base}/order-confirmed/${result.orderNumber}`);
  const html = await page.text();
  console.log(
    "confirmation page (expect 200 + order number):",
    page.status,
    html.includes(result.orderNumber)
  );

  // Cleanup: delete test order, restore stock
  await sql`DELETE FROM orders WHERE order_number = ${result.orderNumber}`;
  await sql`
    UPDATE product_sizes ps SET stock = stock + 2
    FROM products p WHERE p.id = ps.product_id
      AND p.slug = 'heavyweight-boxy-tee-ecru' AND ps.size = 'M'`;
  await sql`
    UPDATE product_sizes ps SET stock = stock + 1
    FROM products p WHERE p.id = ps.product_id
      AND p.slug = 'textured-knit-polo' AND ps.size = 'L'`;
  console.log("cleanup done — test order removed, stock restored");
}
