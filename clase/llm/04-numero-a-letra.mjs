// Desde clase/llm: node --env-file-if-exists=.env 04-numero-a-letra.mjs
if (!process.env.OPENAI_API_KEY?.trim()) {
  throw new Error("Falta OPENAI_API_KEY. Definila en el entorno o en clase/llm/.env.");
}

const URL_API = "https://api.openai.com/v1/chat/completions";
const MODELO  = "gpt-6-luna";

async function completar(texto, instrucciones = "", opciones = {}) {
  const mensajes = [];
  if (instrucciones) {
    mensajes.push({ role: "developer", content: instrucciones });
  }
  mensajes.push({ role: "user", content: texto });

  const cuerpo = {
    model: MODELO,
    messages: mensajes,
    reasoning_effort: "low",
  };
  if (opciones.json) {
    cuerpo.response_format = { type: "json_object" };
  }

  const respuesta = await fetch(URL_API, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cuerpo),
  });

  if (!respuesta.ok) {
    const detalle = await respuesta.text();
    throw new Error(`La API respondió ${respuesta.status}: ${detalle}`);
  }

  const datos = await respuesta.json();
  return (datos.choices[0].message.content ?? "").trim();
}

async function convertirNumeroALetra(numero) {
  if (!Number.isFinite(numero)) {
    throw new TypeError("Se esperaba un número");
  }
  const instrucciones = `
    Escribí en palabras, en español, el número que te paso.
    Usá minúsculas y la palabra coma para los decimales.
    Respondé solo con el número escrito, sin punto final.
  `;
  return completar(String(numero), instrucciones);
}

for (const numero of [21, 1234, 1000000, 3.5]) {
  console.log(numero, "→", await convertirNumeroALetra(numero));
}
