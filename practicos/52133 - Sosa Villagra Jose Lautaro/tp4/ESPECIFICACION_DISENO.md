# Especificación de Diseño: MiniCRM

Esta especificación detalla de forma exhaustiva y precisa los lineamientos visuales, componentes de interfaz, estructura de maquetación, paleta de colores, tipografía, comportamientos y estados interactivos necesarios para replicar con exactitud pixel-perfect la interfaz del sistema mostrada en `minicrm.jpg` conforme a los requerimientos de `enunciado.md`.

---

## 1. Arquitectura Visual y Layout General

### 1.1 Comportamiento de Pantalla (App Viewport)
* **Contenedor Raíz**: Diseñado como Single Page Application (SPA) que ocupa exactamente el 100% del alto y ancho de la ventana del navegador (`100vw` x `100vh`).
* **Bloqueo de Scroll Global**: La página general **no** debe tener barras de desplazamiento horizontal ni vertical (`body { overflow: hidden; height: 100vh; }`).
* **Fondo General del Lienzo**: Gris azulado muy claro (`#f1f5f9`).
* **Tipografía Base**: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`. Renderizado suavizado de fuentes (`-webkit-font-smoothing: antialiased`).

### 1.2 Estructura del Layout
El layout se compone de dos áreas principales en sentido vertical:
1. **Barra Superior (Top Header / Navbar)**: Ancho completo (`100%`), fija en la parte superior.
2. **Área Principal de Contenido**: `display: flex; gap: 16px; padding: 16px; height: calc(100vh - 54px); box-sizing: border-box;`.
   * **Columna Izquierda (Panel Maestro - Clientes)**: Ancho fijo de `340px` (o `flex: 0 0 340px`), altura total del área de contenido.
   * **Columna Derecha (Panel Detalle - Ficha y Actividades)**: Ancho flexible (`flex: 1`), altura total del área de contenido.

---

## 2. Paleta de Colores y Tokens de Estilo

### 2.1 Colores Primarios y Neutros
| Token / Elemento | Valor HEX | Descripción de Uso |
| :--- | :--- | :--- |
| **Header Navbar** | `#1e3a5f` | Fondo de la barra superior principal |
| **Background Lienzo** | `#f1f5f9` | Fondo general de la aplicación |
| **Card Background** | `#ffffff` | Fondo blanco de los paneles y tarjetas |
| **Borde General** | `#e2e8f0` | Bordes de paneles, tarjetas de actividad y divisores |
| **Borde de Inputs** | `#cbd5e1` | Bordes de campos de texto y búsqueda |
| **Texto Principal** | `#0f172a` | Nombres de clientes, títulos, descripciones |
| **Texto Secundario** | `#64748b` | Correos electrónicos, fechas, textos secundarios |
| **Texto Placeholder / IDs** | `#94a3b8` | Placeholders de inputs, identificador `#123`, "Sin fecha" |

### 2.2 Colores de Interacción y Acciones
| Acción / Componente | Fondo (Normal) | Hover | Borde | Texto |
| :--- | :--- | :--- | :--- | :--- |
| **Botón Primario (+ Agregar, Guardar)** | `#1d68bd` | `#18559d` | Ninguno | `#ffffff` |
| **Botón Secundario (Cancelar, Editar)** | `#ffffff` | `#f8fafc` | `#cbd5e1` | `#334155` |
| **Botón Peligro (Eliminar Cliente / Actividad)** | `#ffffff` | `#fef2f2` | `#fecaca` | `#dc2626` |
| **Cliente Seleccionado (Fila activa)** | `#e8f2fc` | `#e8f2fc` | Ninguno | `#0f172a` |
| **Checkbox Actividad Pendiente** | `#ffffff` | `#f8fafc` | `#94a3b8` | N/A |
| **Checkbox Actividad Completada** | `#10b981` | `#10b981` | `#10b981` | `#ffffff` (icono check) |
| **Estado Vencido (Alerta)** | Transparente | N/A | Ninguno | `#dc2626` (rojo) |

### 2.3 Paleta de Avatares Circulares (Iniciales de Clientes)
Cada cliente tiene un avatar circular con iniciales generado dinámicamente con pares de colores pastel de alto contraste:
* **Azul**: Fondo `#dbeafe`, Texto `#1d4ed8` (ej. Ana García -> `AG`)
* **Verde**: Fondo `#dcfce7`, Texto `#15803d` (ej. Bruno López -> `BL`)
* **Púrpura**: Fondo `#ede9fe`, Texto `#6d28d9` (ej. Carla Pérez -> `CP`)
* **Naranja**: Fondo `#ffedd5`, Texto `#c2410c` (ej. Diego Ruiz -> `DR`)
* **Rosa**: Fondo `#ffe4e6`, Texto `#be123c` (ej. Elena Torres -> `ET`)
* **Teal / Cian**: Fondo `#ccfbf1`, Texto `#0f766e` (ej. Federico Díaz -> `FD`)
* **Índigo**: Fondo `#e0e7ff`, Texto `#4338ca` (ej. Gabriela Sosa -> `GS`)

---

## 3. Especificación Detallada de Componentes

### 3.1 Barra Superior (Header Navbar)
* **Dimensiones**: Altura de `54px`, ancho `100%`.
* **Fondo**: `#1e3a5f`.
* **Disposición**: `display: flex; align-items: center; padding: 0 24px;`.
* **Título**:
  * Texto: `MiniCRM`.
  * Tipografía: `font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.2px;`.

---

### 3.2 Panel Maestro: Listado de Clientes (Columna Izquierda)
* **Contenedor**:
  * Ancho: `340px`.
  * Fondo: `#ffffff`.
  * Bordes: `border: 1px solid #e2e8f0; border-radius: 12px;`.
  * Sombra: `box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);`.
  * Layout: `display: flex; flex-direction: column; height: 100%; overflow: hidden;`.

#### 3.2.1 Cabecera del Panel Clientes
* **Fila Superior**:
  * Disposición: `display: flex; justify-content: space-between; align-items: center; padding: 20px 20px 0 20px;`.
  * **Título**: `Clientes` (`font-size: 22px; font-weight: 700; color: #0f172a;`).
  * **Botón `+ Agregar`**:
    * Fondo: `#1d68bd`.
    * Texto: `+ Agregar` (`color: #ffffff; font-size: 13.5px; font-weight: 600;`).
    * Dimensiones: Altura `34px`, padding `0 14px`, border-radius `6px`, borde ninguno, cursor pointer.
    * Hover: `background-color: #18559d;`.

#### 3.2.2 Barra de Búsqueda
* **Ubicación**: Debajo de la fila superior, con padding `14px 20px 10px 20px`.
* **Contenedor del Input**: `position: relative; width: 100%;`.
* **Icono de Búsqueda**:
  * Lupa SVG en posición absoluta: `left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; stroke: #94a3b8;`.
* **Campo Input**:
  * Dimensiones: Ancho `100%`, altura `38px`, box-sizing `border-box`.
  * Padding: `8px 12px 8px 36px`.
  * Borde: `1px solid #cbd5e1; border-radius: 8px;`.
  * Placeholder: `Buscar por cualquier campo...` (`color: #94a3b8; font-size: 13.5px;`).
  * Focus: `border-color: #1d68bd; outline: none; box-shadow: 0 0 0 2px rgba(29, 104, 189, 0.15);`.

#### 3.2.3 Lista Desplazable de Clientes
* **Contenedor**: `flex: 1; overflow-y: auto; padding: 6px 12px 16px 16px;`.
* **Barra de Scroll Interna**:
  * Ancho: `6px`.
  * Track: `background: transparent;`.
  * Thumb: `background: #cbd5e1; border-radius: 4px;`.
* **Fila / Tarjeta de Cliente**:
  * Disposición: `display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 8px; margin-bottom: 4px; cursor: pointer; transition: background-color 0.15s ease;`.
  * Estado Normal: Fondo transparente.
  * Estado Hover: `background-color: #f8fafc;`.
  * Estado Seleccionado (ej. Ana García): `background-color: #e8f2fc;`.
* **Avatar**:
  * Dimensiones: `40px` x `40px`, circular (`border-radius: 50%`).
  * Disposición: `display: flex; align-items: center; justify-content: center; flex-shrink: 0;`.
  * Texto: Iniciales en mayúscula (ej. `AG`), `font-size: 14px; font-weight: 700;`.
  * Color: Fondo y texto según la paleta de avatares.
* **Información de Texto del Cliente**:
  * Disposición: `display: flex; flex-direction: column; overflow: hidden; min-width: 0;`.
  * **Nombre**: `font-size: 14.5px; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`.
  * **Email**: `font-size: 12.5px; font-weight: 400; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`.

---

### 3.3 Panel Detalle: Ficha del Cliente y Actividades (Columna Derecha)
* **Contenedor**:
  * Ancho: `flex: 1`.
  * Fondo: `#ffffff`.
  * Bordes: `border: 1px solid #e2e8f0; border-radius: 12px;`.
  * Sombra: `box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);`.
  * Disposición: `display: flex; flex-direction: column; height: 100%; padding: 24px 28px; box-sizing: border-box; overflow: hidden;`.

#### 3.3.1 Cabecera de la Ficha
* **Fila Superior**:
  * Disposición: `display: flex; justify-content: space-between; align-items: flex-start;`.
  * **Nombre del Cliente**: `font-size: 26px; font-weight: 700; color: #0f172a; margin: 0;`.
  * **Bloque Derecho de Identificador y Acciones**:
    * Disposición: `display: flex; flex-direction: column; align-items: flex-end; gap: 8px;`.
    * **Identificador `#ID`**: `color: #94a3b8; font-size: 14px; font-weight: 500;` (ej. `#123`).
    * **Botones de Acción**:
      * Disposición: `display: flex; gap: 8px;`.
      * **Botón `Editar`**:
        * Estilo: Outline neutro.
        * Fondo `#ffffff`, borde `1px solid #cbd5e1`, color `#334155`.
        * Icono: Lápiz SVG (`14px` x `14px`, stroke `#334155`).
        * Texto: `Editar` (`font-size: 13px; font-weight: 500;`).
        * Dimensiones: Altura `32px`, padding `0 12px`, border-radius `6px`.
        * Hover: `background-color: #f8fafc;`.
      * **Botón `Eliminar`**:
        * Estilo: Outline de peligro / eliminación.
        * Fondo `#ffffff`, borde `1px solid #fecaca`, color `#dc2626`.
        * Icono: Papelera SVG (`14px` x `14px`, stroke `#dc2626`).
        * Texto: `Eliminar` (`font-size: 13px; font-weight: 500;`).
        * Dimensiones: Altura `32px`, padding `0 12px`, border-radius `6px`.
        * Hover: `background-color: #fef2f2; border-color: #fca5a5;`.

#### 3.3.2 Datos de Contacto y Dirección
* **Disposición**: `display: grid; grid-template-columns: 1fr 1fr; gap: 10px 32px; margin-top: 14px; margin-bottom: 24px;`.
* **Columna Izquierda (Contacto)**:
  * **Email**: Icono sobre SVG (`16px`, stroke `#64748b`) seguido de texto `ana.garcia@example.com` (`font-size: 14px; color: #334155;`).
  * **Teléfono**: Icono teléfono SVG (`16px`, stroke `#64748b`) seguido de texto `381 555 0123` (`font-size: 14px; color: #334155;`).
* **Columna Derecha (Ubicación)**:
  * **Dirección**: Icono pin de ubicación SVG (`16px`, stroke `#64748b`).
  * Texto en dos líneas:
    * Línea 1: `San Martín 450` (`font-size: 14px; color: #334155;`).
    * Línea 2: `Yerba Buena` (`font-size: 14px; color: #334155; margin-left: 24px;`).

---

### 3.4 Subformulario: Agregar / Editar Actividad
* **Contenedor**:
  * Borde: `1px solid #e2e8f0; border-radius: 8px;`.
  * Fondo: `#ffffff`.
  * Padding: `16px; margin-bottom: 20px;`.
* **Título**: `Agregar actividad` (`font-size: 15px; font-weight: 600; color: #0f172a; margin-bottom: 12px;`).
* **Fila de Controles**:
  * Disposición: `display: flex; gap: 10px; align-items: center;`.
  * **Input Descripción**:
    * Flex: `flex: 2;`.
    * Altura: `38px`, border-radius `6px`, borde `1px solid #cbd5e1`, padding `8px 12px`.
    * Placeholder: `Descripción de la actividad` (`color: #94a3b8; font-size: 13.5px;`).
  * **Input Fecha**:
    * Flex: `flex: 1; min-width: 160px;`.
    * Altura: `38px`, border-radius `6px`, borde `1px solid #cbd5e1`, padding `8px 12px`.
    * Placeholder: `Fecha opcional` (`color: #94a3b8; font-size: 13.5px;`).
    * Icono de calendario en el extremo derecho.
  * **Botón `Guardar`**:
    * Fondo: `#1d68bd`, texto `#ffffff`, borde ninguno, border-radius `6px`.
    * Altura: `38px`, padding `0 16px`, cursor pointer.
    * Icono: Disquete SVG blanco (`15px` x `15px`).
    * Texto: `Guardar` (`font-size: 13.5px; font-weight: 500;`).
    * Hover: `background-color: #18559d;`.
  * **Botón `Cancelar`**:
    * Fondo: `#ffffff`, borde `1px solid #cbd5e1`, texto `#334155`, border-radius `6px`.
    * Altura: `38px`, padding `0 14px`, cursor pointer.
    * Icono: Cruz / X SVG (`14px` x `14px`).
    * Texto: `Cancelar` (`font-size: 13.5px; font-weight: 500;`).
    * Hover: `background-color: #f8fafc;`.

---

### 3.5 Sección Desplazable de Actividades
* **Contenedor**: `flex: 1; overflow-y: auto; padding-right: 8px;`.
* **Barra de Scroll Interna**: Idéntica a la del maestro (`width: 6px; thumb: #cbd5e1; track: transparent;`).

#### 3.5.1 Bloque "Compromisos" (Actividades Pendientes)
* **Encabezado**: `Compromisos` (`font-size: 16.5px; font-weight: 700; color: #0f172a; margin-bottom: 10px;`).
* **Tarjeta de Compromiso**:
  * Disposición: `display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 8px;`.
  * **Lado Izquierdo (Checkbox y Datos)**:
    * Disposición: `display: flex; align-items: center; gap: 14px;`.
    * **Checkbox Pendiente**:
      * Cuadro cuadrado: `width: 18px; height: 18px; border: 2px solid #94a3b8; border-radius: 4px; background: #ffffff; cursor: pointer;`.
      * Al hacer clic: marca la actividad como completada mediante la API.
    * **Detalles**:
      * Disposición: `display: flex; flex-direction: column; gap: 2px;`.
      * **Título**: `font-size: 14.5px; font-weight: 500; color: #0f172a;` (ej. "Consultar nuevas necesidades", "Enviar presupuesto", "Llamar para seguimiento").
      * **Meta / Fecha y Estado**:
        * Sin fecha: `Sin fecha` (`font-size: 12.5px; color: #94a3b8;`).
        * Con fecha vigente: `22 oct 2026` (`font-size: 12.5px; color: #64748b;`).
        * Con fecha vencida: `16 oct 2026 · Vencido` (la fecha en color `#64748b`, el separador `·` en `#94a3b8`, y la palabra `Vencido` en color rojo `#dc2626` con `font-weight: 600`).
  * **Lado Derecho (Acciones Individuales)**:
    * Disposición: `display: flex; gap: 6px;`.
    * **Botón Editar Actividad**:
      * Icono lápiz SVG (`stroke: #64748b; width: 14px; height: 14px;`).
      * Estilo: `background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 5px 8px; cursor: pointer;`.
      * Hover: `border-color: #cbd5e1; background: #f8fafc;`.
      * Comportamiento: Carga los datos de la actividad en el subformulario para su modificación.
    * **Botón Eliminar Actividad**:
      * Icono papelera SVG (`stroke: #dc2626; width: 14px; height: 14px;`).
      * Estilo: `background: #ffffff; border: 1px solid #fecaca; border-radius: 6px; padding: 5px 8px; cursor: pointer;`.
      * Hover: `background: #fef2f2;`.
      * Comportamiento: Elimina individualmente la actividad pendiente previa confirmación.

#### 3.5.2 Bloque "Actividades completadas"
* **Encabezado**: `Actividades completadas` (`font-size: 16.5px; font-weight: 700; color: #0f172a; margin-top: 20px; margin-bottom: 10px;`).
* **Tarjeta de Actividad Completada**:
  * Disposición: `display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 8px;`.
  * **Lado Izquierdo (Checkbox y Datos)**:
    * Disposición: `display: flex; align-items: center; gap: 14px;`.
    * **Checkbox Completada**:
      * Dimensiones: `width: 18px; height: 18px; border-radius: 4px; background: #10b981; border: 1px solid #10b981; display: flex; align-items: center; justify-content: center;`.
      * Icono interior: Tilde / Checkmark SVG blanco (`width: 12px; height: 12px; stroke: #ffffff; stroke-width: 3;`).
      * Estado: Deshabilitado / solo lectura (cursor default).
    * **Detalles**:
      * **Título**: `font-size: 14.5px; font-weight: 500; color: #0f172a;` (ej. "Enviar presentación", "Primera reunión").
      * **Subtítulo de Fecha**: `Completada el 15 oct 2026` (`font-size: 12.5px; color: #64748b;`).
  * **Lado Derecho (Acciones)**:
    * **Vacío**: Por requerimiento explícito, las actividades completadas **no** presentan botones de edición ni eliminación individual.

---

### 3.6 Formulario de Alta y Edición de Cliente
Conforme al enunciado, *"La edición del formulario debe ser en el detalle"*:
* Cuando el usuario pulsa `+ Agregar` (en el maestro) o `Editar` (en el detalle), el panel derecho sustituye la vista de ficha por el formulario de cliente:
  * **Título**: `Nuevo Cliente` o `Editar Cliente` (`font-size: 24px; font-weight: 700; color: #0f172a;`).
  * **Campos del Formulario** (dispuestos en una cuadrícula de dos columnas o campos verticales estructurados):
    1. **Nombre**: Input de texto obligatorio (`placeholder: "Nombre completo"`).
    2. **Email**: Input de email obligatorio (`placeholder: "correo@ejemplo.com"`).
    3. **Teléfono**: Input de texto (`placeholder: "381 555 0123"`).
    4. **Dirección**: Input de texto (`placeholder: "Calle y número"`).
    5. **Ciudad**: Input de texto (`placeholder: "Ciudad"`).
  * **Barra de Acciones Inferior**:
    * **Guardar**: Botón primario azul (`#1d68bd`).
    * **Cancelar**: Botón secundario outline (`#ffffff`, borde `#cbd5e1`).

---

## 4. Matriz de Iconografía SVG Requerida

Para garantizar consistencia sin dependencias externas pesadas, los iconos SVG deben utilizar trazos limpios (`fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;`):
1. **Lupa (Búsqueda)**: Círculo con mango inferior derecho.
2. **Lápiz (Editar)**: Contorno de lápiz inclinado.
3. **Papelera (Eliminar)**: Cubo de basura con tapa.
4. **Sobre (Email)**: Rectángulo con solapa triangular plegada.
5. **Teléfono (Contacto)**: Auricular clásico inclinado.
6. **Pin de Mapa (Dirección)**: Gota invertida con círculo central.
7. **Calendario (Fecha)**: Rectángulo con barra superior y cuadrícula.
8. **Disquete (Guardar)**: Contorno de disco flexible con muesca.
9. **Cruz (Cancelar)**: Dos líneas diagonales cruzadas en X.
10. **Tilde (Completada)**: Trazo de checkmark clásico en ángulo.

---

## 5. Reglas de Negocio en la Interfaz

1. **Selección Activa**: Solo un cliente puede estar seleccionado a la vez. Al seleccionarlo, se resalta en el panel maestro con fondo `#e8f2fc` y se carga su ficha en el panel detalle.
2. **Búsqueda en Vivo**: Al escribir en el buscador del maestro, la lista se filtra inmediatamente comparando el término ingresado contra nombre, email, teléfono, dirección o ciudad de cada cliente.
3. **Cálculo de "Vencido"**: Si una actividad en "Compromisos" tiene una fecha asignada y dicha fecha es anterior a la fecha actual del sistema, se renderiza la etiqueta roja `· Vencido`. Si la fecha es igual o posterior, o si no tiene fecha, no lleva la etiqueta de vencimiento.
4. **Inmutabilidad de Actividades Completadas**: Al marcar el checkbox de un compromiso, pasa a la sección "Actividades completadas", se registra su fecha de finalización y se remueven permanentemente sus botones de edición y borrado individual.
5. **Eliminación en Cascada**: Al eliminar un cliente desde el botón `Eliminar` del detalle, se eliminan tanto el cliente como todas sus actividades asociadas.
