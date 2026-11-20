# Pautas para desarrollar esta app

Este proyecto también se usa para enseñar a programar. Priorizar código que permita entender cómo funciona la aplicación, seguir sus cambios y probarlos en clase.

## Enfoque didáctico

- Explicar cada cambio desde el problema que resuelve. Introducir una idea nueva por vez y evitar refactorizaciones ajenas al pedido.
- Preferir nombres descriptivos y ejemplos concretos antes que abreviaturas, patrones abstractos o “magia” difícil de seguir.
- Mantener las explicaciones en español claro. El código ya usa nombres en español; conservar esa convención. La interfaz usa español rioplatense.
- Agregar comentarios cuando aclaren una decisión o un concepto que pueda resultar nuevo. No comentar línea por línea lo que el código ya expresa.
- Al proponer cambios, resumir qué se modificó, por qué y cómo se comprobó.

## Organización del código

- Mantener Vite, React, TypeScript y Zustand. No agregar dependencias si la solución puede expresarse con las herramientas existentes.
- Conservar la separación actual: componentes en `src/components/`, hooks en `src/hooks/` y estado compartido en `src/store/`.
- Mantener cada componente enfocado en una tarea. Compartir estado mediante props o selectores de Zustand según corresponda, sin duplicar la misma fuente de datos.
- Al añadir estado compartido, explicar su forma y sus acciones con tipos claros. Mantener cada slice asociado a su funcionalidad.
- En React, hacer visible el flujo de datos: de dónde viene una prop o selector, qué acción responde al evento y qué componente muestra el resultado.
- Para efectos y suscripciones, incluir su limpieza. Para persistencia, restaurar primero los datos y luego suscribirse a los cambios.
- Evitar `any` y las abstracciones genéricas que oculten el flujo de datos. Aprovechar la inferencia de TypeScript cuando el tipo sea evidente.

## Interfaz

- Conservar la marca azul y las superficies Liquid Glass, el tema claro/oscuro y los tonos pastel de los segmentos porcentuales. Los colores originales por vehículo se mantienen en el store.
- Priorizar la lectura de las cuentas y el cronómetro durante el registro. Mantener etiquetas comprensibles, foco visible, controles accesibles y adaptación a pantallas angostas.
- Respetar `prefers-reduced-motion`, colores forzados y el respaldo opaco para navegadores sin `backdrop-filter`.
- Evitar cambios decorativos que reduzcan contraste, agreguen ruido visual o compliquen explicar la pantalla.

## Registro y comprobación

- Actualizar `desarrollo.md` al completar un cambio: registrar el comportamiento vigente y el avance en pocas líneas. Si el archivo acumula alternativas ya reemplazadas, resumirlas para que no se contradiga con el estado actual.
- Después de cambios de código, ejecutar `npm run build` para comprobar TypeScript y la compilación de Vite. No afirmar que se verificó en navegador si no se observó el flujo real.
- Mantener este archivo enfocado en las pautas del proyecto; documentar las decisiones y los pasos realizados en `desarrollo.md`.
