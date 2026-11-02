import { useState } from "react";

export function useForm(inicial, alEnviar) {
  const [valores, setValores] = useState(inicial);

  const campo = (nombre) => ({
    name: nombre,
    value: valores[nombre] ?? "",
    onChange: (e) => setValores((v) => ({ ...v, [nombre]: e.target.value })),
  });

  const enviar = (e) => {
    e.preventDefault();
    alEnviar(valores);
  };

  return { campo, enviar };
}
