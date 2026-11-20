import { Link, useSearchParams } from "react-router";
import { useApiREST } from "../hooks/useApiREST.js";

export default function Lista() {
  const { datos, cargando, error } = useApiREST("contactos");
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";

  const buscado = q.toLowerCase();
  const visibles = datos.filter((c) =>
    `${c.nombre} ${c.apellido} ${c.telefono}`.toLowerCase().includes(buscado),
  );

  return (
    <>
      <header>
        <h1>Contactos</h1>
        <Link to="/nuevo" className="boton primario">Agregar</Link>
      </header>
      <Buscar valor={q} alCambiar={(texto) => setParams(texto ? { q: texto } : {}, { replace: true })} />
      {error && <p className="error">{error}</p>}
      {cargando 
        ? ( <Cargando /> )
        : ( <table>
              <tbody>
                {visibles.map((c) => <MostrarContacto key={c.id} contacto={c} />)}
                {!visibles.length && <SinResultados />}
              </tbody>
            </table>
        )}
    </>
  );
}

function Buscar({ valor, alCambiar }) {
  return (
    <input type="search" placeholder="Buscar…" aria-label="Buscar contactos"
      value={valor} onChange={(e) => alCambiar(e.target.value)} />
  );
}

function MostrarContacto({ contacto }) {
  return (
    <tr>
      <td>{contacto.nombre}</td>
      <td>{contacto.apellido}</td>
      <td>{contacto.telefono}</td>
      <td><Link to={`/editar/${contacto.id}`} className="boton">Editar</Link></td>
    </tr>
  );
}

function SinResultados() {
  return <tr><td colSpan="4" className="aviso">Sin resultados</td></tr>;
}

function Cargando() {
  return <p className="aviso">Cargando…</p>;
}
