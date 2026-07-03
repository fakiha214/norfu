// Removes smoke-test residue: test orders and restores seeded stock.
import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
const deleted = await sql`DELETE FROM orders WHERE email = 'test@example.com' RETURNING order_number`;
console.log("deleted test orders:", deleted.map((r) => r.order_number).join(", ") || "none");
await sql`UPDATE product_sizes SET stock = 20 WHERE stock <> 20`;
const check = await sql`SELECT count(*)::int AS n, sum(stock)::int AS total FROM product_sizes`;
console.log("size rows:", check[0].n, "| total stock:", check[0].total);
