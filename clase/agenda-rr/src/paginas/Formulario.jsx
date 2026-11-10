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
      <Campo etiqueta="Nombre" required {...campo("nombre")} />
      <Campo etiqueta="Apellido" required {...campo("apellido")} />
      <Campo etiqueta="Teléfono" required type="tel" {...campo("telefono")} />
      <div className="acciones">
        <Boton variante="primario">Guardar</Boton>
        <Link to="/" className="boton">Cancelar</Link>
        {id && <Boton type="button" variante="peligro" onClick={eliminar}>Eliminar</Boton>}
      </div>
    </form>
  );
}

function Campo({ etiqueta, ...props }) {
  return <label>{etiqueta}<input {...props} /></label>;
}

function Boton({ children, variante = "", className = "", ...props }) {
  return <button className={`boton ${variante} ${className}`.trim()} {...props}>{children}</button>;
}
