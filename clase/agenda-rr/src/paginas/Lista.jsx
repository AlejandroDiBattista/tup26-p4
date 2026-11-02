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
      <input type="search" placeholder="Buscar…"
        value={q}
        onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
      />
      {error && <p className="error">{error}</p>}
      {cargando 
        ? ( <p className="aviso">Cargando…</p> ) 
        : ( <table>
              <tbody>
                {visibles.map((c) => (
                  <tr key={c.id}>
                    <td>{c.nombre}</td>
                    <td>{c.apellido}</td>
                    <td>{c.telefono}</td>
                    <td><Link to={`/editar/${c.id}`} className="boton">Editar</Link></td>
                  </tr>
                ))}
                {!visibles.length && (
                  <tr><td colSpan="4" className="aviso">Sin resultados</td></tr>
                )}
              </tbody>
            </table>
        )}
    </>
  );
}
