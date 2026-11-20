CREATE TABLE `actividades` (
	`id` integer PRIMARY KEY NOT NULL,
	`cliente_id` integer NOT NULL,
	`descripcion` text NOT NULL,
	`fecha` text,
	`completada` integer DEFAULT false NOT NULL,
	`completada_el` text,
	FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `clientes` (
	`id` integer PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`email` text NOT NULL,
	`telefono` text,
	`direccion` text,
	`ciudad` text
);
