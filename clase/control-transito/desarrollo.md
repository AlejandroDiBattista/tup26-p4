# Desarrollo del proyecto

Bitácora resumida y referencia del estado actual de la aplicación de conteo de tránsito.

## Ejecutar el proyecto

Desde esta carpeta:

```bash
npm install
npm run dev
```

Para generar la versión de producción:

```bash
npm run build
```

El proyecto usa Vite, React con TypeScript y Zustand.

## Estructura principal

```text
src/
├── App.tsx
├── components/
│   ├── Contador.tsx
│   ├── Cronometro.tsx
│   ├── Listar.tsx
│   ├── Resultado.tsx
│   └── Sesiones.tsx
├── hooks/
│   ├── sesiones.ts
│   └── usePersistenciaLocalStorage.ts
└── store/
    ├── contadorStore.ts
    ├── constants.ts
    ├── types.ts
    └── slices/
        ├── contadoresSlice.ts
        └── cronometroSlice.ts
```

Cada componente mantiene sus estilos en un archivo CSS asociado. `App.tsx` monta la pantalla y activa la persistencia; `Listar.tsx` compone el cronómetro, los contadores, los resultados, la distribución y las sesiones.

## Funcionamiento actual

### Conteo y resultados

- Los tipos de vehículo se definen en `src/store/slices/contadoresSlice.ts` y se muestran desde un array: Motos, Autos, Camionetas, Camiones, Colectivos, Bicicletas, Tractores y Otros.
- Cada contador tiene emoji, etiqueta y cuenta. Solo acepta incrementos mientras el cronómetro está corriendo.
- Zustand separa las cuentas y el cronómetro en slices. `reiniciarTodo` restablece las cuentas y el tiempo del cronómetro juntos.
- Se muestran el total y el flujo en vehículos por hora. El flujo se calcula con el total y los segundos de observación, y se redondea al entero más cercano.
- La barra de distribución muestra la proporción de cada vehículo, con su icono superpuesto. Los segmentos usan tonos pastel; los colores originales de cada categoría se conservan en el store.

### Cronómetro

- La observación dura como máximo cinco minutos (300 segundos). Al terminar, el cronómetro se detiene y los contadores quedan deshabilitados.
- La pantalla muestra el tiempo como `mm:ss.d`, actualizado cada 100 ms. El store conserva el residuo entre actualizaciones para no perder tiempo por redondeo.
- Los controles permiten prender, pausar y parar; reiniciar vuelve a cero el cronómetro y los contadores.
- La barra muestra el avance en segundos y marcas cada diez segundos y cada minuto.

### Persistencia y sesiones

- El muestreo actual se guarda automáticamente en `localStorage` con la clave `contador-vehiculos-v1`. Al volver a abrir la aplicación, un cronómetro que estaba corriendo se restaura pausado.
- Las sesiones con nombre se guardan aparte, con `contador-vehiculos-sesiones-v1`. Cada sesión conserva cuentas y tiempo, sin guardar el estado del cronómetro.
- Guardar una sesión requiere que el cronómetro esté detenido. Se pueden recorrer las sesiones cuando no está corriendo; la selección muestra sus valores como vista previa sin reemplazar el muestreo actual.
- El icono de inicio vuelve a los datos actuales. El tacho elimina la sesión mostrada; si era la última, se vuelve al muestreo actual.

### Interfaz y accesibilidad

- La pantalla usa superficies translúcidas inspiradas en Liquid Glass, con el azul como color de marca y versiones claro/oscuro según el tema del sistema.
- Los tonos de las barras por vehículo se mantienen y se suavizan para la distribución porcentual. Los botones de conteo conservan fondos pastel relacionados con cada vehículo.
- Si el navegador no admite `backdrop-filter`, se muestran superficies opacas. La interfaz también contempla colores forzados, foco de teclado y preferencia de movimiento reducido.
- La lista pasa a una columna en pantallas de hasta 820 px.

## Registro de avances

1. Se creó el proyecto Vite con React y TypeScript y se instalaron sus dependencias.
2. Se organizaron `Contador`, `Listar`, `Cronometro`, `Resultado` y `Sesiones` en componentes separados, con estilos asociados.
3. Los contadores se ampliaron desde tres categorías hasta ocho y se configuraron desde un array.
4. El estado compartido se implementó con Zustand y se separó en slices de contadores y cronómetro.
5. Se incorporaron total, flujo horario, distribución porcentual y reinicio conjunto.
6. Se agregó el período de observación de cinco minutos, sus controles, marcas de tiempo y actualización en décimas.
7. Se añadió persistencia del muestreo actual y gestión de varias sesiones con nombre.
8. Se refinó la interfaz con el tema Liquid Glass, marca azul, colores pastel en la distribución, estados de confirmación y ajustes de accesibilidad.
9. Se normalizaron radios, sombras y estados de borrado con tokens compartidos para los temas claro y oscuro; se quitaron reglas CSS sin uso y se completó el comportamiento de movimiento reducido.

## Verificación

La compilación de producción se verificó con `npm run build` después de los últimos cambios funcionales y visuales.
