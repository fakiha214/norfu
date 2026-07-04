// One-off: update the returns-policy announcement in the DB.
import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);
const updated = await sql`
  UPDATE announcements
  SET message = 'EASY 7-DAY RETURNS NATIONWIDE'
  WHERE message LIKE '%14-DAY%'
  RETURNING id, message`;
console.log("updated:", JSON.stringify(updated));
