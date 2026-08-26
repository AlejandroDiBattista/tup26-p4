# Visual Design Contract

## Product mode

- Mode: `operate`
- Audience and cadence: un docente que trabaja varias veces por semana, principalmente desde una computadora y ocasionalmente desde el teléfono durante la clase.
- Primary workflow: localizar un alumno, mantener su ficha y registrar asistencia o resultados con la menor cantidad posible de pasos.

## Visual direction

- Direction name: **Cuaderno institucional**.
- Visual world: una herramienta académica clara y confiable, con la precisión de una planilla bien organizada y el ritmo de una agenda docente.
- Palette family: cobalto institucional como acento, neutros fríos levemente azulados y estados semánticos sobrios. El color identifica selección, foco y estado; no decora.
- Type treatment: Inter sans-first, jerarquía compacta y números tabulares para legajos, horarios, fechas y notas.
- Composition: mesa de trabajo densa y escaneable. Lista de alumnos como superficie principal; herramientas masivas por comisión en vistas secundarias; edición progresiva en contexto.
- Shape language: geometría limpia, radios discretos, divisores suaves y superficies utilitarias. Evitar contenedores innecesarios y tarjetas anidadas.
- Motion: transiciones breves de estado, sólo en opacidad o transformación; respetar reducción de movimiento.

## Accessibility

- Objetivo WCAG AA en tema claro y oscuro.
- Foco visible, navegación completa por teclado y objetivos táctiles cómodos.
- Ningún estado depende solamente del color: siempre incluye texto o iconografía.
- Tablas con encabezados semánticos, leyendas claras y alternativa utilizable en ancho reducido.

## Anti-references

- Tablero SaaS genérico basado en mosaicos de tarjetas equivalentes.
- Gradientes, glassmorphism, métricas heroicas o decoración tecnológica sin función.
- Formularios largos en modales, controles diminutos y acciones que aparecen sólo al pasar el mouse.
- Exceso de badges y colores compitiendo dentro de las grillas.

## Guardrails

- Preservar los tokens semánticos y componentes locales del scaffold.
- Mantener Chat como destino independiente y la gestión académica en rutas de dominio.
- Usar acciones como contrato único para la interfaz y el agente.
- Verificar escritorio, móvil, teclado, tema oscuro, estados vacíos y errores antes de entregar.
