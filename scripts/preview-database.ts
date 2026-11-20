import { readFile } from "node:fs/promises";
import pg from "pg";

const [command, pullRequest] = process.argv.slice(2);
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL est requis.");
if (!pullRequest || !/^\d+$/.test(pullRequest)) throw new Error("Le numéro de PR est requis.");

const schema = `preview_pr_${pullRequest}`;
const quotedSchema = `"${schema}"`;
const pool = new pg.Pool({ connectionString: databaseUrl });
const client = await pool.connect();

try {
  await client.query("BEGIN");
  if (command === "provision") {
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${quotedSchema}`);
    await client.query(`SET LOCAL search_path TO ${quotedSchema}, public`);
    await client.query(await readFile(new URL("../migrations/001_safety_sheet.sql", import.meta.url), "utf8"));
    console.log(`Schéma Supabase ${schema} provisionné.`);
  } else if (command === "cleanup") {
    await client.query(`DROP SCHEMA IF EXISTS ${quotedSchema} CASCADE`);
    console.log(`Schéma Supabase ${schema} supprimé.`);
  } else {
    throw new Error("Commande attendue : provision ou cleanup.");
  }
  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await pool.end();
}
