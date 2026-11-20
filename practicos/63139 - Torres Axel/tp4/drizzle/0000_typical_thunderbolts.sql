CREATE TABLE `actividades` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cliente_id` integer NOT NULL,
	`descripcion` text NOT NULL,
	`fecha_compromiso` text,
	`fecha_finalizacion` text,
	FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `actividades_cliente_idx` ON `actividades` (`cliente_id`);--> statement-breakpoint
CREATE TABLE `clientes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`apellido` text NOT NULL,
	`email` text NOT NULL,
	`telefono` text,
	`domicilio` text,
	`localidad` text
);
