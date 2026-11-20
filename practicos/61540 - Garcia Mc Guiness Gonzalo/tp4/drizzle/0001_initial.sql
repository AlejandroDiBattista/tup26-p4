CREATE TABLE IF NOT EXISTS clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  direccion TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS actividades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL REFERENCES clientes (id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  fecha TEXT,
  completada INTEGER NOT NULL DEFAULT 0 CHECK (completada IN (0, 1)),
  fecha_completada TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS actividades_cliente_id_idx
  ON actividades (cliente_id);
