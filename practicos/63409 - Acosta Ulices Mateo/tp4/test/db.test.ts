import { test } from "node:test";
import assert from "node:assert/strict";
import { sql } from "drizzle-orm";
import { db } from "../src/db/index.js";

test("se conecta a la base de datos", async () => {
  const result = await db.run(sql`select 1 as ok`);
  assert.equal(result.rows[0].ok, 1);
});
