# Aforo urbano

Contador de tránsito para registrar motos, autos y camionetas que circulan por un punto de la ciudad. Desarrollado con Vite, React, TypeScript, Tailwind CSS y componentes de shadcn/ui.

## Ejecutar

```bash
npm ci
npm run dev
```

Abrir la dirección que muestra Vite en la terminal.

## Uso

1. Escribir el punto de observación (calle o intersección).
2. Pulsar **Iniciar** para activar el cronómetro y los botones de conteo.
3. Pulsar **+** en la categoría de cada vehículo que pase. **−** corrige un registro y nunca permite cantidades negativas.
4. Pulsar **Pausar** para congelar el tiempo y el flujo. Durante la pausa se pueden corregir conteos con **−**. **Continuar** retoma la misma medición y excluye el tiempo de pausa.
5. Con la medición pausada, pulsar **Nueva medición** (icono de reinicio en el celular) y confirmar para borrar tiempo y conteos. Se conserva el nombre del punto de observación.

## Flujo vehicular

Se muestra el promedio estimado por categoría y el total en vehículos por hora:

```text
flujo (v/h) = cantidad de vehículos × 3.600.000 / tiempo medido en milisegundos
```

Ejemplo: 120 vehículos en 5 minutos equivalen a 1.440 v/h. Es una tasa extrapolada del intervalo observado, no la cantidad realmente contada durante una hora. Cuanto más breve la observación, más variable es la estimación.

El flujo aparece tras el primer segundo para evitar dividir por cero. El cronómetro muestra horas, minutos y segundos; el cálculo usa los milisegundos completos. El tiempo se obtiene del reloj monotónico del navegador y las pausas se excluyen.

La medición se conserva mientras la página está abierta. Recargar la página borra la medición actual.

## Comandos

```bash
npm run build    # Comprobar TypeScript y generar dist/
npm run lint     # Revisar el código
npm run preview  # Servir la compilación
```

## Estructura

- `src/App.tsx`: coordina el estado de la medición y compone la pantalla.
- `src/components/Cabecera.tsx`: título y estado de la medición.
- `src/components/PuntoObservacion.tsx`: entrada del punto de observación.
- `src/components/ControlMedicion.tsx`: cronómetro, controles y confirmación de reinicio.
- `src/components/RegistroVehiculos.tsx`: categorías y lista de contadores.
- `src/components/ContadorVehiculo.tsx`: fila reutilizable por categoría.
- `src/components/ResumenMedicion.tsx`: total de vehículos y flujo horario sin decimales.
- `src/hooks/useCronometro.ts`: iniciar, pausar, continuar y reiniciar el cronómetro.
- `src/lib/medicion.ts`: cálculo de flujo y formato de tiempo/números.
- `src/types/medicion.ts`: tipos compartidos de categorías y conteos.
- `src/components/ui/`: Button, Card, Input y Label de shadcn/ui.
- `src/index.css`: Tailwind CSS y tema.

Para agregar componentes:

```bash
npx shadcn@latest add nombre-del-componente
```

La dependencia `shadcn` está fijada en `4.22.1`: provee `shadcn/tailwind.css`, importado por el tema. La versión `1.0.0` no incluye ese archivo.
