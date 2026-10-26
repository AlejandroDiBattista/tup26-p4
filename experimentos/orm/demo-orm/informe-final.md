# Informe final de la demostración

Los 12 pasos de `prompts-demo.md` están implementados. Se instalaron las dependencias, se aplicó la migración y se cargó la semilla. El servidor quedó iniciado con `npm start` en el puerto 3100 y ambas páginas quedaron abiertas en Chrome:

- REST: <http://localhost:3100/clientes.html>
- MCP: <http://localhost:3100/clientes-mcp.html>
- Servidor MCP: <http://localhost:3100/mcp>, 12 herramientas con el SDK oficial y Streamable HTTP sin sesiones.

La base SQLite local contiene **10 clientes y 50 actividades**. El cliente temporal creado durante la comprobación de navegador se eliminó junto con sus actividades; se conservaron los datos originales de la semilla.

## Código generado

Conteo de líneas físicas, incluyendo líneas en blanco y comentarios dentro de los archivos de código:

| Parte | Líneas |
| --- | ---: |
| Backend TypeScript: `src/*.ts` | 402 |
| Página REST: HTML, CSS y JSX embebidos | 285 |
| Página MCP: HTML, CSS y JSX embebidos | 307 |
| Migración SQL | 20 |
| **Implementación** | **1.014** |
| Pruebas de integración | 117 |
| **Total de código con pruebas** | **1.131** |

No se cuentan bibliotecas, `node_modules`, lockfile, configuración, metadatos de Drizzle, archivos de datos ni documentación. Las dos páginas se cuentan completas: cada una contiene su interfaz para cumplir el requisito de HTML autocontenido.

Comando reproducible:

```sh
wc -l src/*.ts public/*.html pruebas/*.ts drizzle/*.sql
```

## Tiempo

Tiempo total aproximado de implementación y verificación: **11 minutos**. El intervalo con medición explícita fue del **15/10/2026, 00:43:09 al 00:53:14**, hora de Tucumán: **10 minutos y 5 segundos**. La lectura inicial de la consigna precedió al primer registro; el informe se redactó después del corte. Es tiempo transcurrido de esta ejecución, incluyendo instalación, código y comprobaciones.

## Verificación realizada

- `npm run check`: correcto.
- `npm test`: **3 pruebas de integración aprobadas, 0 fallidas**, en una base temporal independiente. Cubren CRUD por REST y MCP, datos compartidos, normalización, búsquedas por todos los campos, email único, fechas de calendario, pertenencia al cliente, vencimientos y corte del día en Tucumán, inmutabilidad de completadas, repetición del completado, borrado compuesto y semilla idempotente.
- Migración y semilla ejecutadas nuevamente sobre la base de la demostración: se conservan 10 clientes y 50 actividades.
- Chrome, REST: lista y ficha, alta de cliente, alta y edición de compromiso, guardado de fecha y lectura de los cambios hechos mediante MCP.
- Chrome, MCP: búsqueda en vivo por email, ficha del cliente creado por REST, edición de cliente, error por email duplicado con valores conservados, alta y edición de compromiso, completado y presentación en el grupo de completadas con check deshabilitado.
- Comprobación visual de las páginas de escritorio y de los estados vacíos del cliente temporal. La búsqueda y la ficha permanecen visibles con desplazamiento interno de las listas. No se comprobó un dispositivo móvil.
- Sin errores de ejecución en la consola de las páginas. Babel muestra su aviso esperado por compilar JSX en el navegador, tal como pide la demostración.
- `npm audit --omit=dev`: **0 vulnerabilidades**. La auditoría completa informa 4 avisos moderados en la cadena de desarrollo de `drizzle-kit`/`esbuild`; no se usan sus servidores de desarrollo.

Turso queda configurable mediante variables de entorno. No se verificó una conexión remota porque la consigna no proporciona credenciales. Las bibliotecas de las páginas requieren conexión al CDN. Ambas pestañas comparten datos persistidos; para ver cambios de la otra hay que recargar.

El [README](README.md) incluye instalación, estructura, reglas, endpoints REST, herramientas MCP, conexión desde el SDK y configuración de Turso.
