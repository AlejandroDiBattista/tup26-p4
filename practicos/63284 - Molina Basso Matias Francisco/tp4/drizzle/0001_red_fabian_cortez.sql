PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_actividades` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cliente_id` integer NOT NULL,
	`descripcion` text NOT NULL,
	`fecha_compromiso` text,
	`fecha_finalizacion` text,
	FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
-- El modelo anterior no guardaba cuándo se completó. Para esas actividades
-- se registra el momento de migración, conservando su estado de solo lectura.
INSERT INTO `__new_actividades`("id", "cliente_id", "descripcion", "fecha_compromiso", "fecha_finalizacion")
SELECT "id", "cliente_id", "descripcion", NULLIF("fecha", ''),
  CASE WHEN "completada" = 1 THEN strftime('%Y-%m-%dT%H:%M:%fZ', 'now') ELSE NULL END
FROM `actividades`;--> statement-breakpoint
DROP TABLE `actividades`;--> statement-breakpoint
ALTER TABLE `__new_actividades` RENAME TO `actividades`;--> statement-breakpoint
CREATE INDEX `actividades_cliente_idx` ON `actividades` (`cliente_id`);--> statement-breakpoint
CREATE TABLE `__new_clientes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`apellido` text NOT NULL,
	`email` text NOT NULL,
	`domicilio` text,
	`localidad` text,
	`telefono` text
);
--> statement-breakpoint
-- Separa el antiguo nombre completo en el primer espacio; revisar apellidos
-- compuestos o nombres antiguos que no incluían apellido desde la ficha.
INSERT INTO `__new_clientes`("id", "nombre", "apellido", "email", "domicilio", "localidad", "telefono")
SELECT "id",
  CASE WHEN instr(trim("nombre"), ' ') > 0 THEN substr(trim("nombre"), 1, instr(trim("nombre"), ' ') - 1) ELSE trim("nombre") END,
  CASE WHEN instr(trim("nombre"), ' ') > 0 THEN trim(substr(trim("nombre"), instr(trim("nombre"), ' ') + 1)) ELSE '' END,
  "email", NULLIF("direccion", ''), NULL, NULLIF("telefono", '')
FROM `clientes`;--> statement-breakpoint
DROP TABLE `clientes`;--> statement-breakpoint
ALTER TABLE `__new_clientes` RENAME TO `clientes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
