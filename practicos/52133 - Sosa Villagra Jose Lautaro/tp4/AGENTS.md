# AGENTS.md: Directivas para el Desarrollo de MiniCRM

Este documento define la arquitectura, lineamientos de implementación y directivas técnicas para agentes y modelos encargados de desarrollar el proyecto MiniCRM, ubicado en `D:\.01_Facultad\Tecnicatura programacion\Segundo año\Segundo cuatrimestre 2026\03- Programacion 4\tup26-p4\practicos\52133 - Sosa Villagra Jose Lautaro\tp4`.

---

## 1. Stack Tecnológico Estricto

En estricto cumplimiento con lo establecido en `enunciado.md`, únicamente se utilizarán las tecnologías exigidas, sin agregar ni remover ninguna:

* **Entorno de Ejecución**: Node.js
* **Lenguaje de Programación**: TypeScript
* **Base de Datos**: SQLite
* **Mapeo Objeto-Relacional (ORM)**: Drizzle ORM
* **Servidor y API REST**: Express
* **Interfaz Web**: React cargado mediante CDN con versiones fijas
* **Sintaxis de Vistas**: JSX embebido (interpretado en el navegador)
* **Hojas de Estilo**: CSS nativo

---

## 2. Arquitectura del Proyecto

El proyecto debe ser modular, minimalista y legible, dividiendo responsabilidades conforme a las pautas del enunciado:

```text
tp4/
├── public/
│   └── MiniCRM.html          # Interfaz web React con JSX embebido, CSS y librerías CDN fijas
├── src/
│   ├── db/
│   │   ├── schema.ts         # Definición de tablas SQLite con Drizzle
│   │   └── index.ts          # Inicialización de la base de datos SQLite y cliente Drizzle
│   ├── services/
│   │   └── clientes.service.ts # Clase Clientes con métodos estáticos para CRUD y búsqueda
│   ├── controllers/
│   │   ├── clientes.controller.ts   # Controladores HTTP de Clientes
│   │   └── actividades.controller.ts # Controladores HTTP de Actividades
│   ├── routes/
│   │   ├── clientes.routes.ts       # Router Express para /api/clientes
│   │   ├── actividades.routes.ts    # Router Express para /api/actividades
│   │   └── index.ts                 # Router principal que agrupa las rutas
│   └── server.ts             # Configuración del servidor Express y servicio de estáticos
├── drizzle.config.ts         # Configuración de Drizzle ORM
├── package.json              # Definición de scripts y dependencias
├── tsconfig.json             # Configuración de TypeScript
├── ESPECIFICACION_DISENO.md  # Especificación de diseño pixel-perfect
├── enunciado.md              # Requisitos y consignas del trabajo práctico
└── minicrm.jpg               # Referencia visual de la interfaz
```

---

## 3. Modelo de Datos (Drizzle + SQLite)

### 3.1 Tabla `clientes`
* `id`: Entero autoincremental, clave primaria.
* `nombre`: Texto, obligatorio.
* `email`: Texto, obligatorio.
* `telefono`: Texto, opcional.
* `direccion`: Texto, opcional.
* `ciudad`: Texto, opcional.
* `createdAt`: Timestamp o texto ISO.

### 3.2 Tabla `actividades`
* `id`: Entero autoincremental, clave primaria.
* `clienteId`: Entero, clave foránea hacia `clientes(id)` con eliminación en cascada (`ON DELETE CASCADE`).
* `descripcion`: Texto, obligatorio.
* `fecha`: Texto ISO (YYYY-MM-DD), opcional.
* `completada`: Entero / booleano (0 = falso, 1 = verdadero), valor por defecto 0.
* `fechaCompletada`: Texto ISO o fecha de culminación, opcional.

---

## 4. Reglas de Negocio y Módulo de Servicio

1. **Clase `Clientes` con Métodos Estáticos**:
   * Toda la lógica de negocio y las consultas Drizzle a SQLite deben residir en la clase `Clientes` del módulo de servicio (`src/services/clientes.service.ts`).
   * Métodos requeridos:
     * `listar(busqueda?: string)`: Obtiene todos los clientes. Si se recibe `busqueda`, ejecuta un filtrado flexible por cualquier campo (`nombre`, `email`, `telefono`, `direccion`, `ciudad`).
     * `obtenerPorId(id: number)`: Retorna la ficha completa del cliente junto con sus actividades (compromisos y completadas).
     * `crear(data)`: Da de alta un nuevo cliente.
     * `actualizar(id: number, data)`: Modifica los datos del cliente.
     * `eliminar(id: number)`: Borra el cliente y todas sus actividades asociadas.
     * `agregarActividad(clienteId: number, data)`: Crea un compromiso para el cliente.
     * `actualizarActividad(actividadId: number, data)`: Edita la descripción y fecha de una actividad no completada.
     * `completarActividad(actividadId: number)`: Marca la actividad como completada y asigna fecha actual.
     * `eliminarActividad(actividadId: number)`: Elimina una actividad individualmente solo si no está completada.
2. **Inmutabilidad de Actividades Completadas**:
   * Una vez que una actividad tiene `completada = 1`, el servicio debe rechazar cualquier intento de edición o borrado individual.
3. **Controladores y Routers**:
   * Los controladores deben limitarse a recibir el `req`, llamar a los métodos estáticos de `Clientes`, gestionar códigos de estado HTTP y responder el `res.json()`.

---

## 5. Especificaciones para la Interfaz Web (`public/MiniCRM.html`)

1. **Entorno de Frontend**:
   * Se carga en un único archivo HTML (`public/MiniCRM.html`) servido por Express como archivo estático.
   * Utiliza React 18 y React-DOM 18 mediante etiquetas `<script src="...">` con versiones fijas desde CDN.
   * Utiliza Babel Standalone desde CDN con versión fija para compilar JSX embebido directamente en el navegador.
   * Estilos CSS nativos contenidos en etiquetas `<style>` respetando al 100% las medidas, colores y disposiciones de `ESPECIFICACION_DISENO.md`.
2. **Estructura Maestro-Detalle y Comportamiento de App**:
   * Sin desplazamiento de página (`overflow: hidden` global).
   * Columna izquierda (Maestro): barra de búsqueda en vivo y lista de clientes con scroll vertical independiente.
   * Columna derecha (Detalle): Ficha del cliente, subformulario de actividades y listas de "Compromisos" y "Actividades completadas" con scroll vertical independiente.
3. **Formularios de Creación y Edición**:
   * La edición y creación de clientes se realiza dentro del panel de detalle.
   * La creación y modificación de actividades se realiza en el subformulario superior del panel de detalle.
