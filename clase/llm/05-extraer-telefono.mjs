// Desde clase/llm: node --env-file-if-exists=.env 05-extraer-telefono.mjs
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

async function extraerTelefono(texto) {
  const instrucciones = `
    Encontrá todos los números de teléfono que aparecen en el texto.
    Ignorá otros números, como documentos, precios o fechas.
    Respondé en JSON con la forma {"telefonos": ["..."]}, copiando cada teléfono tal como aparece en el texto.
    Si no hay ninguno, respondé {"telefonos": []}.
`;
  const respuesta = await completar(texto, instrucciones, { json: true });

  let datos;
  try {
    datos = JSON.parse(respuesta);
  } catch {
    return [];
  }
  if (!Array.isArray(datos.telefonos)) {
    return [];
  }

  return datos.telefonos.map((telefono) => ({
    original: telefono,
    normalizado: telefono.replace(/[^\d+]/g, ""),
  }));
}

const texto = `Hola, soy Laura. Mi celular es 381 15-555-1234 y el fijo de la oficina
es (0381) 421-5678. Mi DNI es 30.123.456 y el alquiler sale $450.000.`;

console.log(await extraerTelefono(texto));
