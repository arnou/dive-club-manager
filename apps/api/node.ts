import { createHash, createHmac, randomUUID } from "node:crypto";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import pg from "pg";
import { safetySheets } from "../../packages/application/safety-sheets.ts";
import { postgresSafetyStore } from "../../packages/persistence-postgres/safety-store.ts";
import { createApi } from "./http.ts";

const { DATABASE_URL, SAFETY_SIGNING_KEY } = process.env;
if (!DATABASE_URL || !SAFETY_SIGNING_KEY || SAFETY_SIGNING_KEY.length < 32) {
  throw new Error("DATABASE_URL et SAFETY_SIGNING_KEY (32 caractères minimum) sont requis.");
}

const pool = new pg.Pool({ connectionString: DATABASE_URL });
const service = safetySheets({
  store: postgresSafetyStore(pool),
  now: () => new Date().toISOString(),
  id: randomUUID,
  digest: async data => createHmac("sha256", SAFETY_SIGNING_KEY).update(JSON.stringify(data)).digest("hex"),
});

const api = createApi(service, async token => {
  const digest = createHash("sha256").update(token).digest("hex");
  const { rows: [session] } = await pool.query<{ user_id: string }>(
    "SELECT user_id FROM app_session WHERE token_digest = $1 AND expires_at > now()", [digest],
  );
  return session?.user_id ?? null;
});

api.get("/", serveStatic({ path: "./apps/web/dist/index.html" }));
api.get("/assets/*", serveStatic({ root: "./apps/web/dist" }));

serve({
  fetch: api.fetch,
  hostname: process.env.HOST ?? "127.0.0.1",
  port: Number(process.env.PORT ?? 3000),
});
