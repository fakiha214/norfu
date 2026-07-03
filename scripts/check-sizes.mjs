// Quick sanity check for the product_sizes backfill.
import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
const r = await sql`SELECT count(*)::int AS n, sum(stock)::int AS total FROM product_sizes`;
console.log("size rows:", r[0].n, "| total stock:", r[0].total);
