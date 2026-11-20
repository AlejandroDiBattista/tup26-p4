import { useEffect, useState } from "react";

// Sin id carga la lista, con id carga ese elemento y con null no carga nada.
export function useApiREST(recurso, id) {
  const url = `/api/${recurso}` + (id ? `/${id}` : "");
  const [datos, setDatos] = useState(id === undefined ? [] : null);
  const [cargando, setCargando] = useState(id !== null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id === null) return;
    fetch(url)
      .then((res) => res.json())
      .then(setDatos)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, [url, id]);

  const enviar = (metodo, cuerpo) =>
    fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: cuerpo && JSON.stringify(cuerpo),
    });

  const guardar = (valores) => enviar(id ? "PUT" : "POST", valores);
  const borrar  = () => enviar("DELETE");

  return { datos, cargando, error, guardar, borrar };
}
