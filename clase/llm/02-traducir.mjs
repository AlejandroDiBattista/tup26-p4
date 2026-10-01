// Desde clase/llm: node --env-file-if-exists=.env 02-traducir.mjs
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

async function traducir(texto, idioma = "inglés") {
  const instrucciones = `
  Traducí el texto que te paso al ${idioma}.
  Conservá el tono, los nombres propios y el formato.
  Respondé solo con la traducción, sin comillas ni comentarios.
  `;
  return completar(texto, instrucciones);
}

const original = "Mañana a primera hora te paso el presupuesto, así lo mirás con calma.";
const ingles = await traducir(original, "inglés");
const vuelta = await traducir(ingles, "español");

console.log("Original:", original);
console.log("Inglés:  ", ingles);
console.log("Vuelta:  ", vuelta);
