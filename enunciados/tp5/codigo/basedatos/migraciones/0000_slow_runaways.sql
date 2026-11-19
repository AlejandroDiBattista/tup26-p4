CREATE TABLE `categorias` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`activa` integer DEFAULT true NOT NULL,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categorias_nombre_unique` ON `categorias` (`nombre`);--> statement-breakpoint
CREATE TABLE `clientes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tipo_doc` text NOT NULL,
	`nro_doc` text NOT NULL,
	`nombre` text NOT NULL,
	`domicilio` text,
	`telefono` text,
	`email` text,
	`cuenta_corriente` integer DEFAULT false NOT NULL,
	`limite_credito` integer,
	`activo` integer DEFAULT true NOT NULL,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clientes_nro_doc_unique` ON `clientes` (`nro_doc`);--> statement-breakpoint
CREATE TABLE `factura_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`factura_id` integer NOT NULL,
	`producto_id` integer NOT NULL,
	`codigo` text NOT NULL,
	`descripcion` text NOT NULL,
	`cantidad` integer NOT NULL,
	`precio_unitario` integer NOT NULL,
	`subtotal` integer NOT NULL,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`factura_id`) REFERENCES `facturas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `facturas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`punto_venta` integer NOT NULL,
	`numero` integer NOT NULL,
	`fecha` integer NOT NULL,
	`cliente_id` integer,
	`usuario_id` integer NOT NULL,
	`total` integer NOT NULL,
	`forma_pago` text NOT NULL,
	`monto_recibido` integer,
	`tarjeta_tipo` text,
	`tarjeta_marca` text,
	`tarjeta_ultimos4` text,
	`estado` text DEFAULT 'emitida' NOT NULL,
	`motivo_anulacion` text,
	`fecha_anulacion` integer,
	`usuario_anulacion_id` integer,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`usuario_anulacion_id`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `facturas_numero_unico` ON `facturas` (`punto_venta`,`numero`);--> statement-breakpoint
CREATE TABLE `movimientos_cuenta` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cliente_id` integer NOT NULL,
	`factura_id` integer,
	`pago_id` integer,
	`tipo` text NOT NULL,
	`importe` integer NOT NULL,
	`descripcion` text NOT NULL,
	`fecha` integer NOT NULL,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`factura_id`) REFERENCES `facturas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`pago_id`) REFERENCES `pagos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `movimientos_stock` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`producto_id` integer NOT NULL,
	`usuario_id` integer NOT NULL,
	`factura_id` integer,
	`tipo` text NOT NULL,
	`cantidad` integer NOT NULL,
	`existencia_resultante` integer NOT NULL,
	`motivo` text NOT NULL,
	`observacion` text,
	`fecha` integer NOT NULL,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`factura_id`) REFERENCES `facturas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `pagos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`punto_venta` integer NOT NULL,
	`numero_recibo` integer NOT NULL,
	`fecha` integer NOT NULL,
	`cliente_id` integer NOT NULL,
	`usuario_id` integer NOT NULL,
	`importe` integer NOT NULL,
	`medio` text NOT NULL,
	`observacion` text,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pagos_numero_unico` ON `pagos` (`punto_venta`,`numero_recibo`);--> statement-breakpoint
CREATE TABLE `productos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`codigo` text NOT NULL,
	`descripcion` text NOT NULL,
	`categoria_id` integer NOT NULL,
	`precio` integer NOT NULL,
	`existencia` integer DEFAULT 0 NOT NULL,
	`stock_minimo` integer DEFAULT 0 NOT NULL,
	`activo` integer DEFAULT true NOT NULL,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`categoria_id`) REFERENCES `categorias`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `productos_codigo_unique` ON `productos` (`codigo`);--> statement-breakpoint
CREATE TABLE `usuarios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`nombre` text NOT NULL,
	`hash_contrasena` text NOT NULL,
	`rol` text NOT NULL,
	`activo` integer DEFAULT true NOT NULL,
	`creado_en` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `usuarios_email_unique` ON `usuarios` (`email`);