import { Link, useNavigate, useParams } from "react-router";
import { useApiREST } from "../hooks/useApiREST.js";
import { useForm } from "../hooks/useForm.js";

const VACIO = { nombre: "", apellido: "", telefono: "" };

export default function Formulario() {
  const { id = null } = useParams();
  const { datos, cargando, error } = useApiREST("contactos", id);

  if (cargando) return <p className="aviso">Cargando…</p>;
  if (error) return <p className="error">{error} <Link to="/">Volver</Link></p>;
  return <Campos id={id} inicial={datos ?? VACIO} />;
}

function Campos({ id, inicial }) {
  const navegar = useNavigate();
  const { guardar, borrar } = useApiREST("contactos", id);
  const { campo, enviar } = useForm(inicial, async (valores) => {
    await guardar(valores);
    navegar("/");
  });

  const eliminar = async () => {
    if (!confirm("¿Eliminar este contacto?")) return;
    await borrar();
    navegar("/");
  };

  return (
    <form onSubmit={enviar}>
      <h1>{id ? "Editar contacto" : "Nuevo contacto"}</h1>
      <label>Nombre  <input required {...campo("nombre")} /></label>
      <label>Apellido<input required {...campo("apellido")} /></label>
      <label>Teléfono<input required type="tel" {...campo("telefono")} /></label>
      <div className="acciones">
        <button className="boton primario">Guardar</button>
        <Link to="/" className="boton">Cancelar</Link>
        {id && <button type="button" className="boton peligro" onClick={eliminar}>Eliminar</button>}
      </div>
    </form>
  );
}
