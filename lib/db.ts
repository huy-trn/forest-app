import { Pool } from "pg";

let pool: Pool | null = null;

export function getDbPool() {
  if (pool) return pool;

  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error("POSTGRES_URL is not set. Check your environment variables.");
  }

  pool = new Pool({ connectionString });
  return pool;
}
