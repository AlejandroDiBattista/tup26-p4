CREATE TABLE `clientes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`apellido` text NOT NULL,
	`telefono` text,
	`email` text NOT NULL,
	`fecha_creacion` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clientes_email_unique` ON `clientes` (`email`);
--> statement-breakpoint
CREATE TABLE `actividades` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cliente_id` integer NOT NULL,
	`descripcion` text NOT NULL,
	`estado` text DEFAULT 'pendiente' NOT NULL,
	`fecha` integer,
	`fecha_creacion` integer NOT NULL,
	`fecha_completada` integer,
	FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON UPDATE no action ON DELETE cascade
);
