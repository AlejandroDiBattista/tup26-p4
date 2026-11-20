const fs = require("node:fs");
const path = require("node:path");
const { sqlite } = require("./index");

const migrationsDirectory = path.join(__dirname, "..", "..", "drizzle");

function migrar() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const appliedMigrations = new Set(
    sqlite
      .prepare("SELECT name FROM schema_migrations")
      .all()
      .map((migration) => migration.name),
  );
  const migrationFiles = fs
    .readdirSync(migrationsDirectory)
    .filter((file) => /^\d+.*\.sql$/i.test(file))
    .sort();

  for (const name of migrationFiles) {
    if (appliedMigrations.has(name)) {
      continue;
    }

    const contents = fs.readFileSync(
      path.join(migrationsDirectory, name),
      "utf8",
    );
    const applyMigration = sqlite.transaction(() => {
      sqlite.exec(contents);
      sqlite
        .prepare("INSERT INTO schema_migrations (name) VALUES (?)")
        .run(name);
    });

    applyMigration();
  }
}

if (require.main === module) {
  migrar();
  console.log("Migraciones aplicadas correctamente.");
  sqlite.close();
}

module.exports = { migrar };
