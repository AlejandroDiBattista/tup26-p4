# TP4: MiniCRM

**Alumna:** Oriana Daniela Gordillo  
**Legajo:** 63660  
**Materia:** Programación 4 - TUP (UTN FRT)  

---

## 📌 Descripción del Proyecto

MiniCRM es una aplicación full-stack modular, minimalista y legible para la gestión de clientes y sus actividades / compromisos. El sistema implementa una arquitectura por capas desacoplada:
1. **Capa de Datos:** Base de datos SQLite gestionada a través de **Drizzle ORM** y cliente `@libsql/client` (compatible tanto en desarrollo local con archivo `.db` como en producción con Turso).
2. **Capa de Negocio:** Servicio con la clase `Clientes` y métodos estáticos con validaciones, normalización y reglas de negocio.
3. **Capa de Presentación (API REST):** Servidor HTTP con **Express**, controladores y enrutadores desacoplados.
4. **Interfaz de Usuario (SPA):** Página web autocontenida en `public/MiniCRM.html` construida con **React 18**, JSX embebido mediante **Babel Standalone** y **CSS moderno puro** (sin dependencias de frameworks CSS).

---

## 🚀 Requisitos y Características Implementadas

- **Maestro-Detalle sin desplazamiento de ventana:** Diseño estilo aplicación de escritorio (`height: 100vh; overflow: hidden`), con scroll vertical independiente en el listado de clientes (maestro) y en el detalle de actividades.
- **Búsqueda en vivo:** Filtrado instantáneo e insensible a mayúsculas/tildes por cualquier campo (nombre, apellido, email, localidad, domicilio, teléfono o ID).
- **Ficha del cliente:** Muestra datos de contacto y el ID en formato `#123` en la esquina superior derecha.
- **Alta y Edición de Clientes en el Detalle:** Formulario integrado con filas organizadas (Nombre/Apellido, Email/Teléfono, Domicilio/Localidad, Guardar/Cancelar).
- **Subformulario de Actividades:** Subformulario con borde punteado redondeado dentro del detalle para agregar o editar compromisos sin etiquetas visibles.
- **Orden de Compromisos y Actividades:**
  - **Compromisos pendientes:** Ordenados primero los que **no tienen fecha**, luego los **vencidos** (destacados visualmente) y finalmente los de **fecha actual o futura** de manera ascendente.
  - **Actividades completadas:** Al marcar el check se completa la actividad asignando la fecha de hoy y se mueve al grupo de completadas.
  - **Regla estricta:** Las actividades completadas no pueden editarse ni eliminarse individualmente.
  - Mensajes de listas vacías con espacio vertical mínimo.
- **Normalización de datos:** Los nombres y apellidos se capitalizan prolijamente y los emails se almacenan en minúsculas sin espacios redundantes.
- **Eliminación en cascada:** Al borrar un cliente se eliminan automáticamente todas sus actividades asociadas.
- **Seeding automático:** Al iniciar por primera vez, se cargan 10 clientes de ejemplo con actividades completadas, pendientes, vencidas y sin fecha.

---

## 📁 Estructura del Código

```text
tp4/
├── minicrm.db                 # Base de datos SQLite generada
├── package.json               # Configuración de dependencias y scripts
├── tsconfig.json              # Configuración de TypeScript
├── test-tp4.mjs               # Suite de pruebas automatizadas
├── README.md                  # Documentación del proyecto
├── public/
│   └── MiniCRM.html           # SPA en React 18 con JSX embebido y CSS
└── src/
    ├── server.ts              # Servidor Express y arranque
    ├── db/
    │   ├── schema.ts          # Definición de tablas y tipos Drizzle
    │   ├── connection.ts      # Conexión LibSQL / SQLite y auto-migración
    │   └── seed.ts            # Datos iniciales (10 clientes y actividades)
    ├── services/
    │   └── clientes.service.ts # Lógica de negocio, CRUD y normalización
    ├── controllers/
    │   └── clientes.controller.ts # Controlador de peticiones REST
    └── routes/
        └── clientes.routes.ts # Enrutador de Express
```

---

## 🛠️ Instalación y Ejecución

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar en modo desarrollo
```bash
npm run dev
```
La aplicación se iniciará en [http://localhost:3000](http://localhost:3000) y abrirá automáticamente la interfaz web en `/MiniCRM.html`.

### 3. Ejecutar las pruebas automatizadas
```bash
npm test
```

### 4. Compilar a JavaScript y ejecutar en producción
```bash
npm run build
npm start
```

---

## 📡 Endpoints de la API REST

### Clientes:
- `GET /api/clientes` - Lista todos los clientes. Soporta búsqueda con `?q=termino`.
- `GET /api/clientes/:id` - Obtiene un cliente por ID junto con sus actividades ordenadas.
- `POST /api/clientes` - Registra un nuevo cliente (normaliza campos).
- `PUT /api/clientes/:id` - Actualiza los datos de un cliente.
- `DELETE /api/clientes/:id` - Elimina un cliente y sus actividades en cascada.

### Actividades:
- `GET /api/clientes/:clienteId/actividades` - Lista las actividades ordenadas de un cliente.
- `POST /api/clientes/:clienteId/actividades` - Crea una nueva actividad pendiente.
- `PUT /api/clientes/:clienteId/actividades/:actividadId` - Edita una actividad (solo si no está completada).
- `DELETE /api/clientes/:clienteId/actividades/:actividadId` - Elimina una actividad (solo si no está completada).
- `POST /api/clientes/:clienteId/actividades/:actividadId/completar` - Marca la actividad como completada con la fecha de hoy.
