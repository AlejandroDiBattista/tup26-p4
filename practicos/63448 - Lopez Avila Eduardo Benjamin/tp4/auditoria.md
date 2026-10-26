# Informe de Auditoría Técnica — TP4: MiniCRM

> **Fecha de auditoría:** 24 de octubre de 2026  
> **Alumno:** Eduardo Benjamin Lopez Avila (Legajo 63448)  
> **Estado general:** **APROBADO (9/9 pruebas integrales superadas, 0 errores de compilación)**

---

## 1. Matriz de Cumplimiento del Enunciado

| Requisito de `enunciado.md` | Implementación verificada | Estado |
| :--- | :--- | :---: |
| **Node.js, TypeScript, Drizzle y SQLite** | Configurado con `typescript`, `tsx`, `drizzle-orm` y `@libsql/client` en [`src/db.ts`](./src/db.ts). | ✅ |
| **Proyecto modular, minimalista y legible** | Estructura plana en `src/` sin capas redundantes (`db.ts`, `clientes.service.ts`, `clientes.controller.ts`, `clientes.routes.ts`, `server.ts`). | ✅ |
| **Clase `Clientes` con métodos estáticos para CRUD** | Implementada en [`src/clientes.service.ts`](./src/clientes.service.ts) con métodos estáticos (`listar`, `obtenerPorId`, `crear`, `actualizar`, `eliminar`, `agregarActividad`, `actualizarActividad`, `completarActividad`, `eliminarActividad`). | ✅ |
| **Búsqueda flexible por cualquier campo** | `Clientes.listar(buscar)` normaliza tildes/mayúsculas (`NFD`) y busca en `id`, `nombre`, `email`, `telefono`, `direccion` y textos/fechas de `actividades`. | ✅ |
| **API REST con Express separando controladores y routers** | Controladores en [`src/clientes.controller.ts`](./src/clientes.controller.ts) y rutas en [`src/clientes.routes.ts`](./src/clientes.routes.ts), dejando todas las reglas de negocio en `Clientes`. | ✅ |
| **Interfaz en `public/MiniCRM.html` con React, JSX embebido y CDN con versiones fijas** | [`public/MiniCRM.html`](./public/MiniCRM.html) carga `react@18.3.1`, `react-dom@18.3.1` y `@babel/standalone@7.26.2` desde CDN y consume toda la funcionalidad vía `fetch` al API REST. | ✅ |
| **Organización Maestro-Detalle sin desplazamiento de página** | `html, body, #root` con `height: 100vh; overflow: hidden;`. Scroll vertical interno independiente (`overflow-y: auto`) en la lista de clientes (Maestro) y en el área de actividades (Detalle). | ✅ |
| **Regla: actividades completadas no se pueden editar ni borrar individualmente** | Validado tanto en la interfaz (sección *Actividades completadas* de solo lectura, sin botones de acción) como en el backend (`Clientes.actualizarActividad` y `Clientes.eliminarActividad` rechazan con `400 Bad Request` si `completada === true`). | ✅ |
| **Edición del cliente en el detalle y actividades en subformulario** | El alta/edición de clientes se renderiza dentro del panel de detalle derecho, y el alta/edición de compromisos se realiza en el subformulario punteado dentro de la ficha del cliente. | ✅ |

---

## 2. Verificación Técnica y Pruebas Ejecutadas

### 2.1. Chequeo Estático de Tipos (TypeScript)
- Comando ejecutado: `npx tsc --noEmit`
- Resultado: **0 errores, 0 advertencias**.

### 2.2. Pruebas Automatizadas de Integración (API REST + SQLite)
Se ejecutó una batería de 9 pruebas de punta a punta contra el servidor levantado:

1. **PASS**: `GET /` redirige a `/MiniCRM.html` y sirve React 18 / Babel con versiones fijas.
2. **PASS**: `GET /api/clientes` inicializa automáticamente las tablas y devuelve los clientes semilla con sus actividades.
3. **PASS**: `GET /api/clientes?q=...` filtra por nombre sin tildes (`garcia` → *Ana García*), teléfono (`0456` → *Bruno López*), dirección (`munecas` → *Elena Torres*) y actividad (`presupuesto` → *Ana García*).
4. **PASS**: `POST /api/clientes` rechaza nombres vacíos (`400`) y crea clientes válidos (`201`).
5. **PASS**: `PUT /api/clientes/:id` actualiza correctamente los datos de contacto (`200`).
6. **PASS**: `POST` y `PUT /api/clientes/:id/actividades` crean y editan compromisos pendientes (`201` / `200`).
7. **PASS**: `DELETE /api/clientes/:id/actividades/:actId` elimina compromisos pendientes (`204`).
8. **PASS**: `PATCH /api/clientes/:id/actividades/:actId/completar` marca la actividad como completada con fecha actual y bloquea cualquier intento posterior de `PUT` (`400`) o `DELETE` individual (`400`).
9. **PASS**: `DELETE /api/clientes/:id` elimina el cliente (`204`) y ejecuta el borrado en cascada (`ON DELETE CASCADE` con `PRAGMA foreign_keys = ON`) sin dejar actividades huérfanas en SQLite.
