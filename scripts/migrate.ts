import { readdir, readFile } from "node:fs/promises";
import pg from "pg";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL est requis.");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();
try {
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock(31213001)");
  await client.query("CREATE TABLE IF NOT EXISTS schema_migration (filename text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())");
  const directory = new URL("../migrations/", import.meta.url);
  const files = (await readdir(directory)).filter(filename => filename.endsWith(".sql")).sort();
  for (const filename of files) {
    const { rowCount } = await client.query(
      "INSERT INTO schema_migration (filename) VALUES ($1) ON CONFLICT DO NOTHING", [filename],
    );
    if (rowCount) await client.query(await readFile(new URL(filename, directory), "utf8"));
  }
  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await pool.end();
}
