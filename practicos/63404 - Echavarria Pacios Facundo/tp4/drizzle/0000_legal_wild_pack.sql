CREATE TABLE `actividades` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cliente_id` integer NOT NULL,
	`descripcion` text NOT NULL,
	`fecha` text,
	`completada_en` text,
	FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `clientes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`telefono` text DEFAULT '' NOT NULL,
	`direccion` text DEFAULT '' NOT NULL,
	`ciudad` text DEFAULT '' NOT NULL
);
