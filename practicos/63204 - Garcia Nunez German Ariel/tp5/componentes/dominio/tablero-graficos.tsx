"use client";
// Gráficos del tablero de inicio con Chart.js y react-chartjs-2 (RF-T2, sección 9).
// 1. Ventas diarias de los últimos 30 días (siempre 30 puntos, sin huecos).
// 2. Ventas del mes en curso por forma de pago.
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/card";
import { Grilla, Caja } from "@/componentes/primitivas/maquetacion";
import { formatearMoneda, NOMBRES_FORMA_PAGO } from "@/lib/formato";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
);

export function GraficosTablero({
  ventasDiarias,
  porFormaDePago,
}: {
  ventasDiarias: { fecha: string; importe: number }[];
  porFormaDePago: { forma: string; importe: number }[];
}) {
  const etiquetasDias = ventasDiarias.map((item) => {
    const [, mes, dia] = item.fecha.split("-");
    return `${dia}/${mes}`;
  });
  const valoresPesosDias = ventasDiarias.map((item) => item.importe / 100);

  const datosLinea = {
    labels: etiquetasDias,
    datasets: [
      {
        label: "Ventas del día ($)",
        data: valoresPesosDias,
        borderColor: "#0f766e",
        backgroundColor: "rgba(15, 118, 110, 0.14)",
        fill: true,
        tension: 0.3,
        pointRadius: 3,
      },
    ],
  };

  const datosDona = {
    labels: porFormaDePago.map((item) => NOMBRES_FORMA_PAGO[item.forma] ?? item.forma),
    datasets: [
      {
        data: porFormaDePago.map((item) => item.importe / 100),
        backgroundColor: ["#0f766e", "#0284c7", "#d97706"],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  return (
    <Grilla className="grid-cols-1 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Ventas diarias (últimos 30 días)</CardTitle>
          <CardDescription>
            Evolución diaria de las facturas emitidas en pesos argentinos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Caja className="h-64 w-full">
            <Line
              data={datosLinea}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (ctx) => formatearMoneda(Math.round(Number(ctx.raw ?? 0) * 100)),
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (valor) => `$ ${Number(valor).toLocaleString("es-AR")}`,
                    },
                  },
                },
              }}
            />
          </Caja>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ventas del mes por forma de pago</CardTitle>
          <CardDescription>Distribución entre contado, tarjeta y cuenta corriente</CardDescription>
        </CardHeader>
        <CardContent>
          <Caja className="h-64 w-full flex items-center justify-center">
            <Doughnut
              data={datosDona}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "bottom" },
                  tooltip: {
                    callbacks: {
                      label: (ctx) =>
                        `${ctx.label}: ${formatearMoneda(Math.round(Number(ctx.raw ?? 0) * 100))}`,
                    },
                  },
                },
              }}
            />
          </Caja>
        </CardContent>
      </Card>
    </Grilla>
  );
}
