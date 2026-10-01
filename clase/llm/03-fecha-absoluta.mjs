// Desde clase/llm: node --env-file-if-exists=.env 03-fecha-absoluta.mjs
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

function formatearFecha(fecha) {
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

async function fechaAbsoluta(texto, hoy = new Date()) {
  const diaSemana = hoy.toLocaleDateString("es-AR", { weekday: "long" });
  const instrucciones = `
    Hoy es ${diaSemana} ${formatearFecha(hoy)}. Las fechas se escriben DD/MM/AAAA.
    Buscá en el texto que te paso la primera mención de una fecha, absoluta o relativa, y convertila en una fecha absoluta.
    Si la mención es una semana, usá su lunes: "la próxima semana" es el lunes de la semana siguiente.
    Si la mención es un mes, usá su primer día.
    Respondé en JSON con esta forma:

    { "expresion": "la próxima semana", "fecha": "DD/MM/AAAA" }

    En "expresion" copiá las palabras tal como aparecen en el texto.
    Si el texto no menciona ninguna fecha, respondé { "expresion": null, "fecha": null }.
  `;

  const respuesta = await completar(texto, instrucciones, { json: true });
  const { expresion, fecha } = JSON.parse(respuesta);
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(fecha ?? "")) return null;
  return { expresion, fecha };
}

const hoy = new Date(2026, 8, 28); // lunes 28 de septiembre de 2026

const frases = [
  "Nos vemos la próxima semana",
  "Pasado mañana te llamo",
  "El turno es el viernes que viene a las 10",
  "Entregá el TP dentro de 3 semanas",
  "El 9 de julio cerramos",
  "Te aviso cuando pueda",
];

for (const frase of frases) {
  console.log(frase, "→", await fechaAbsoluta(frase, hoy));
}
