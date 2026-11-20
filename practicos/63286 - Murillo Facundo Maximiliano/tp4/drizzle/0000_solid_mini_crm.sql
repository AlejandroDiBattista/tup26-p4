CREATE TABLE `clientes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`apellido` text NOT NULL,
	`email` text NOT NULL,
	`domicilio` text,
	`localidad` text,
	`telefono` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clientes_email_unique` ON `clientes` (`email`);
--> statement-breakpoint
CREATE TABLE `actividades` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`descripcion` text NOT NULL,
	`fecha_compromiso` text,
	`fecha_finalizacion` text,
	`cliente_id` integer NOT NULL,
	FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON UPDATE no action ON DELETE cascade
);
