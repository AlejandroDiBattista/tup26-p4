import { useEffect, useState } from "react";
import Contador from "./Contador";
import Cronometro from "./Cronometro";
import Resumen from "./Resumen";
import "./App.css";
const tiposVehiculos = [
  { nombre: "Motos", emoji: "\u{1F3CD}\uFE0F" },
  { nombre: "Autos", emoji: "\u{1F697}" },
  { nombre: "Camionetas", emoji: "\u{1F6FB}" },
  { nombre: "Bicicletas", emoji: "\u{1F6B2}" },
  { nombre: "Colectivos", emoji: "\u{1F68C}" },
  { nombre: "Camiones", emoji: "\u{1F69A}" },
  { nombre: "Taxis", emoji: "\u{1F695}" },
  { nombre: "Otros", emoji: "\u{1F699}" }
];
function App() {
  const [cantidades, setCantidades] = useState(() => tiposVehiculos.map(() => 0));
  const [cronometroActivo, setCronometroActivo] = useState(false);
  const [milisegundos, setMilisegundos] = useState(0);
  const [inicioCronometro, setInicioCronometro] = useState(Date.now());
  const cantidadTotal = cantidades.reduce((total, cantidad) => total + cantidad, 0);
  function incrementarContador(indice) {
    setCantidades(
      (actuales) => actuales.map((cantidad, posicion) => posicion === indice ? cantidad + 1 : cantidad)
    );
  }
  let h = React.createElement;
  function reiniciarContadores() {
    setCantidades(tiposVehiculos.map(() => 0));
  }
  useEffect(() => {
    if (!cronometroActivo) return;
    const intervalo = window.setInterval(() => {
      setMilisegundos(Date.now() - inicioCronometro);
    }, 100);
    return () => window.clearInterval(intervalo);
  }, [cronometroActivo]);
  useEffect(() => {
    function manejarTecla(evento) {
      if (!cronometroActivo) return;
      const elemento = evento.target;
      if (elemento instanceof HTMLElement && (elemento.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(elemento.tagName))) return;
      const indice = Number(evento.key) - 1;
      if (Number.isInteger(indice) && indice >= 0 && indice < tiposVehiculos.length) {
        incrementarContador(indice);
      }
    }
    window.addEventListener("keydown", manejarTecla);
    return () => window.removeEventListener("keydown", manejarTecla);
  }, [cronometroActivo]);
  function alternarCronometro() {
    if (cronometroActivo) {
      setMilisegundos(Date.now() - inicioCronometro);
      setCronometroActivo(false);
      return;
    }
    setInicioCronometro(Date.now() - milisegundos);
    setCronometroActivo(true);
  }
  return h("main", null, h(
    Cronometro,
    {
      milisegundos,
      activo: cronometroActivo,
      alAlternar: alternarCronometro,
      alReiniciarContadores: reiniciarContadores
    }
  ), h("div", { className: "lista-contadores" }, tiposVehiculos.map((tipo, indice) => h(
    Contador,
    {
      key: tipo.nombre,
      texto: tipo.nombre,
      emoji: tipo.emoji,
      cuenta: cantidades[indice],
      habilitado: cronometroActivo,
      alIncrementar: () => incrementarContador(indice)
    }
  ))), h(Resumen, { cantidad: cantidadTotal, segundos: milisegundos / 1e3 }));
}
var App_default = App;
export {
  App_default as default
};
