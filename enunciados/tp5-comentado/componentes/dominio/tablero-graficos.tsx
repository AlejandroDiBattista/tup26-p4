// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// [Línea 1] Directiva de Next.js: marca este archivo como Client Component (se ejecuta en el navegador con estado e interactividad).
"use client";
// Gráficos del tablero de inicio con Chart.js y react-chartjs-2 (RF-T2, sección 9).
// 1. Ventas diarias de los últimos 30 días (siempre 30 puntos, sin huecos).
// 2. Ventas del mes en curso por forma de pago.
// [Línea 5] Inicia un bloque de importación de dependencias.
import {
  // [Línea 6] Importa 'Chart as ChartJS' desde el módulo.
  Chart as ChartJS,
  // [Línea 7] Importa 'CategoryScale' desde el módulo.
  CategoryScale,
  // [Línea 8] Importa 'LinearScale' desde el módulo.
  LinearScale,
  // [Línea 9] Importa 'BarElement' desde el módulo.
  BarElement,
  // [Línea 10] Importa 'PointElement' desde el módulo.
  PointElement,
  // [Línea 11] Importa 'LineElement' desde el módulo.
  LineElement,
  // [Línea 12] Importa 'ArcElement' desde el módulo.
  ArcElement,
  // [Línea 13] Importa 'Tooltip' desde el módulo.
  Tooltip,
  // [Línea 14] Importa 'Legend' desde el módulo.
  Legend,
  // [Línea 15] Importa 'Filler' desde el módulo.
  Filler,
// [Línea 16] Cierra la lista de importaciones provenientes del módulo 'chart.js'.
} from "chart.js";
// [Línea 17] Importa elementos desde 'react-chartjs-2'.
import { Line, Doughnut } from "react-chartjs-2";
// [Línea 18] Importa elementos desde '@/componentes/ui/card'.
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/card";
// [Línea 19] Importa elementos desde '@/componentes/primitivas/maquetacion'.
import { Grilla, Caja } from "@/componentes/primitivas/maquetacion";
// [Línea 20] Importa elementos desde '@/lib/formato'.
import { formatearMoneda, NOMBRES_FORMA_PAGO } from "@/lib/formato";

// [Línea 22] Ejecuta o evalúa: ChartJS.register(
ChartJS.register(
  // [Línea 23] Ejecuta o evalúa: CategoryScale,
  CategoryScale,
  // [Línea 24] Ejecuta o evalúa: LinearScale,
  LinearScale,
  // [Línea 25] Ejecuta o evalúa: BarElement,
  BarElement,
  // [Línea 26] Ejecuta o evalúa: PointElement,
  PointElement,
  // [Línea 27] Ejecuta o evalúa: LineElement,
  LineElement,
  // [Línea 28] Ejecuta o evalúa: ArcElement,
  ArcElement,
  // [Línea 29] Ejecuta o evalúa: Tooltip,
  Tooltip,
  // [Línea 30] Ejecuta o evalúa: Legend,
  Legend,
  // [Línea 31] Ejecuta o evalúa: Filler,
  Filler,
// [Línea 32] Cierra el bloque o estructura ();).
);

// [Línea 34] Declara la función o componente 'GraficosTablero'.
export function GraficosTablero({
  // [Línea 35] Ejecuta o evalúa: ventasDiarias,
  ventasDiarias,
  // [Línea 36] Ejecuta o evalúa: porFormaDePago,
  porFormaDePago,
// [Línea 37] Ejecuta o evalúa: }: {
}: {
  // [Línea 38] Define o asigna el campo/parámetro 'ventasDiarias'.
  ventasDiarias: { fecha: string; importe: number }[];
  // [Línea 39] Define o asigna el campo/parámetro 'porFormaDePago'.
  porFormaDePago: { forma: string; importe: number }[];
// [Línea 40] Ejecuta o evalúa: }) {
}) {
  // [Línea 41] Declara 'etiquetasDias' y le asigna el valor resultante.
  const etiquetasDias = ventasDiarias.map((item) => {
    // [Línea 42] Declara '[, mes, dia]' y le asigna el valor resultante.
    const [, mes, dia] = item.fecha.split("-");
    // [Línea 43] Devuelve el valor: `${dia}/${mes}`;
    return `${dia}/${mes}`;
  // [Línea 44] Cierra el bloque o estructura (});).
  });
  // [Línea 45] Declara 'valoresPesosDias' y le asigna el valor resultante.
  const valoresPesosDias = ventasDiarias.map((item) => item.importe / 100);

  // [Línea 47] Declara 'datosLinea' y le asigna el valor resultante.
  const datosLinea = {
    // [Línea 48] Define o asigna el campo/parámetro 'labels'.
    labels: etiquetasDias,
    // [Línea 49] Define o asigna el campo/parámetro 'datasets'.
    datasets: [
      // [Línea 50] Ejecuta o evalúa: {
      {
        // [Línea 51] Define o asigna el campo/parámetro 'label'.
        label: "Ventas del día ($)",
        // [Línea 52] Define o asigna el campo/parámetro 'data'.
        data: valoresPesosDias,
        // [Línea 53] Define o asigna el campo/parámetro 'borderColor'.
        borderColor: "#0f766e",
        // [Línea 54] Define o asigna el campo/parámetro 'backgroundColor'.
        backgroundColor: "rgba(15, 118, 110, 0.14)",
        // [Línea 55] Define o asigna el campo/parámetro 'fill'.
        fill: true,
        // [Línea 56] Define o asigna el campo/parámetro 'tension'.
        tension: 0.3,
        // [Línea 57] Define o asigna el campo/parámetro 'pointRadius'.
        pointRadius: 3,
      // [Línea 58] Cierra el bloque o estructura (},).
      },
    // [Línea 59] Ejecuta o evalúa: ],
    ],
  // [Línea 60] Cierra el bloque o estructura (};).
  };

  // [Línea 62] Declara 'datosDona' y le asigna el valor resultante.
  const datosDona = {
    // [Línea 63] Define o asigna el campo/parámetro 'labels'.
    labels: porFormaDePago.map((item) => NOMBRES_FORMA_PAGO[item.forma] ?? item.forma),
    // [Línea 64] Define o asigna el campo/parámetro 'datasets'.
    datasets: [
      // [Línea 65] Ejecuta o evalúa: {
      {
        // [Línea 66] Define o asigna el campo/parámetro 'data'.
        data: porFormaDePago.map((item) => item.importe / 100),
        // [Línea 67] Define o asigna el campo/parámetro 'backgroundColor'.
        backgroundColor: ["#0f766e", "#0284c7", "#d97706"],
        // [Línea 68] Define o asigna el campo/parámetro 'borderWidth'.
        borderWidth: 2,
        // [Línea 69] Define o asigna el campo/parámetro 'borderColor'.
        borderColor: "#ffffff",
      // [Línea 70] Cierra el bloque o estructura (},).
      },
    // [Línea 71] Ejecuta o evalúa: ],
    ],
  // [Línea 72] Cierra el bloque o estructura (};).
  };

  // [Línea 74] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <Grilla className="grid-cols-1 lg:grid-cols-3"> // [Línea 75] Abre o renderiza el componente visual <Grilla>.
      <Card className="lg:col-span-2"> // [Línea 76] Abre o renderiza el componente visual <Card>.
        <CardHeader> // [Línea 77] Abre o renderiza el componente visual <CardHeader>.
          <CardTitle>Ventas diarias (últimos 30 días)</CardTitle> // [Línea 78] Abre o renderiza el componente visual <CardTitle>.
          <CardDescription> // [Línea 79] Abre o renderiza el componente visual <CardDescription>.
            // [Línea 80] Ejecuta o evalúa: Evolución diaria de las facturas emitidas en pesos argentinos
            Evolución diaria de las facturas emitidas en pesos argentinos
          </CardDescription> // [Línea 81] Cierra el componente visual </CardDescription>.
        </CardHeader> // [Línea 82] Cierra el componente visual </CardHeader>.
        <CardContent> // [Línea 83] Abre o renderiza el componente visual <CardContent>.
          <Caja className="h-64 w-full"> // [Línea 84] Abre o renderiza el componente visual <Caja>.
            <Line // [Línea 85] Abre o renderiza el componente visual <Line>.
              // [Línea 86] Ejecuta o evalúa: data={datosLinea}
              data={datosLinea}
              // [Línea 87] Ejecuta o evalúa: options={{
              options={{
                // [Línea 88] Define o asigna el campo/parámetro 'responsive'.
                responsive: true,
                // [Línea 89] Define o asigna el campo/parámetro 'maintainAspectRatio'.
                maintainAspectRatio: false,
                // [Línea 90] Define o asigna el campo/parámetro 'plugins'.
                plugins: {
                  // [Línea 91] Define o asigna el campo/parámetro 'legend'.
                  legend: { display: false },
                  // [Línea 92] Define o asigna el campo/parámetro 'tooltip'.
                  tooltip: {
                    // [Línea 93] Define o asigna el campo/parámetro 'callbacks'.
                    callbacks: {
                      // [Línea 94] Define o asigna el campo/parámetro 'label'.
                      label: (ctx) => formatearMoneda(Math.round(Number(ctx.raw ?? 0) * 100)),
                    // [Línea 95] Cierra el bloque o estructura (},).
                    },
                  // [Línea 96] Cierra el bloque o estructura (},).
                  },
                // [Línea 97] Cierra el bloque o estructura (},).
                },
                // [Línea 98] Define o asigna el campo/parámetro 'scales'.
                scales: {
                  // [Línea 99] Define o asigna el campo/parámetro 'y'.
                  y: {
                    // [Línea 100] Define o asigna el campo/parámetro 'beginAtZero'.
                    beginAtZero: true,
                    // [Línea 101] Define o asigna el campo/parámetro 'ticks'.
                    ticks: {
                      // [Línea 102] Define o asigna el campo/parámetro 'callback'.
                      callback: (valor) => `$ ${Number(valor).toLocaleString("es-AR")}`,
                    // [Línea 103] Cierra el bloque o estructura (},).
                    },
                  // [Línea 104] Cierra el bloque o estructura (},).
                  },
                // [Línea 105] Cierra el bloque o estructura (},).
                },
              // [Línea 106] Ejecuta o evalúa: }}
              }}
            // [Línea 107] Ejecuta o evalúa: />
            />
          </Caja> // [Línea 108] Cierra el componente visual </Caja>.
        </CardContent> // [Línea 109] Cierra el componente visual </CardContent>.
      </Card> // [Línea 110] Cierra el componente visual </Card>.

      <Card> // [Línea 112] Abre o renderiza el componente visual <Card>.
        <CardHeader> // [Línea 113] Abre o renderiza el componente visual <CardHeader>.
          <CardTitle>Ventas del mes por forma de pago</CardTitle> // [Línea 114] Abre o renderiza el componente visual <CardTitle>.
          <CardDescription>Distribución entre contado, tarjeta y cuenta corriente</CardDescription> // [Línea 115] Abre o renderiza el componente visual <CardDescription>.
        </CardHeader> // [Línea 116] Cierra el componente visual </CardHeader>.
        <CardContent> // [Línea 117] Abre o renderiza el componente visual <CardContent>.
          <Caja className="h-64 w-full flex items-center justify-center"> // [Línea 118] Abre o renderiza el componente visual <Caja>.
            <Doughnut // [Línea 119] Abre o renderiza el componente visual <Doughnut>.
              // [Línea 120] Ejecuta o evalúa: data={datosDona}
              data={datosDona}
              // [Línea 121] Ejecuta o evalúa: options={{
              options={{
                // [Línea 122] Define o asigna el campo/parámetro 'responsive'.
                responsive: true,
                // [Línea 123] Define o asigna el campo/parámetro 'maintainAspectRatio'.
                maintainAspectRatio: false,
                // [Línea 124] Define o asigna el campo/parámetro 'plugins'.
                plugins: {
                  // [Línea 125] Define o asigna el campo/parámetro 'legend'.
                  legend: { position: "bottom" },
                  // [Línea 126] Define o asigna el campo/parámetro 'tooltip'.
                  tooltip: {
                    // [Línea 127] Define o asigna el campo/parámetro 'callbacks'.
                    callbacks: {
                      // [Línea 128] Define o asigna el campo/parámetro 'label'.
                      label: (ctx) =>
                        // [Línea 129] Ejecuta o evalúa: `${ctx.label}: ${formatearMoneda(Math.round(Number(ctx.raw ?? 0) * 100))}`,
                        `${ctx.label}: ${formatearMoneda(Math.round(Number(ctx.raw ?? 0) * 100))}`,
                    // [Línea 130] Cierra el bloque o estructura (},).
                    },
                  // [Línea 131] Cierra el bloque o estructura (},).
                  },
                // [Línea 132] Cierra el bloque o estructura (},).
                },
              // [Línea 133] Ejecuta o evalúa: }}
              }}
            // [Línea 134] Ejecuta o evalúa: />
            />
          </Caja> // [Línea 135] Cierra el componente visual </Caja>.
        </CardContent> // [Línea 136] Cierra el componente visual </CardContent>.
      </Card> // [Línea 137] Cierra el componente visual </Card>.
    </Grilla> // [Línea 138] Cierra el componente visual </Grilla>.
  // [Línea 139] Cierra el bloque o estructura ();).
  );
// [Línea 140] Cierra el bloque o estructura (}).
}
