import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: {
    rejectUnauthorized: false, // For local development, set to true in production
  },
});



export async function initDB() {
  try {
    await pool.query("SELECT NOW()");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS report_list (
        cid TEXT PRIMARY KEY
      );
    `);
  } catch (err) {
    console.error("❌ Error initializing DB:", err);
    process.exit(1);
  }
}

