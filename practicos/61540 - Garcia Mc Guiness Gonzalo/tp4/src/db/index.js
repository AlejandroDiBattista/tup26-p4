const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");
const { drizzle } = require("drizzle-orm/better-sqlite3");
const schema = require("./schema");

const projectRoot = path.resolve(__dirname, "../..");
const configuredPath = process.env.DATABASE_URL;
const databasePath =
  configuredPath === ":memory:"
    ? configuredPath
    : configuredPath
      ? path.resolve(projectRoot, configuredPath)
      : path.join(projectRoot, "data", "minicrm.sqlite");

if (databasePath !== ":memory:") {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
}

const sqlite = new Database(databasePath);
sqlite.pragma("foreign_keys = ON");

const db = drizzle(sqlite, { schema });

module.exports = { db, sqlite };
