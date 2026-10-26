CREATE TABLE `actividades` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cliente_id` integer NOT NULL,
	`descripcion` text NOT NULL,
	`fecha` text NOT NULL,
	`completada` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `actividades_cliente_idx` ON `actividades` (`cliente_id`);--> statement-breakpoint
CREATE TABLE `clientes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`telefono` text DEFAULT '' NOT NULL,
	`empresa` text DEFAULT '' NOT NULL,
	`direccion` text DEFAULT '' NOT NULL,
	`notas` text DEFAULT '' NOT NULL
);
