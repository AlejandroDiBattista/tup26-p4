// Desde clase/llm: node --env-file-if-exists=.env 06-factura.mjs
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { extname } from "node:path";

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

const TIPOS_IMAGEN = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

async function leerImagen(ruta) {
  const tipo = TIPOS_IMAGEN[extname(ruta).toLowerCase()];
  if (!tipo) {
    throw new Error(`Formato de imagen no admitido: ${ruta}`);
  }
  const bytes = await readFile(ruta);
  return `data:${tipo};base64,${bytes.toString("base64")}`;
}

async function extraerFactura(ruta) {
  const imagen = await leerImagen(ruta);

  const instrucciones = `
    Extraé los datos de la factura de la imagen.
    Respondé en JSON con esta forma:

    {
      "tipo":    "A",
      "numero":  "0001-00001234",
      "fecha":   "AAAA-MM-DD",
      "emisor":  { "nombre": "", "cuit": "" },
      "cliente": { "nombre": "", "cuit": "" },
      "items":   [{ "descripcion": "", "cantidad": 0, "precioUnitario": 0, "subtotal": 0 }],
      "neto":    0,
      "iva":     0,
      "total":   0
    }

    Los importes van como números JSON, con punto decimal y sin separador de miles.
    Si un dato no aparece o no se puede leer, usá null.
  `;

  const contenido = [
    { type: "text", text: "Esta es la factura." },
    { type: "image_url", image_url: { url: imagen, detail: "high" } },
  ];

  const respuesta = await completar(contenido, instrucciones, { json: true });
  const factura = JSON.parse(respuesta);
  factura.advertencias = revisarFactura(factura);
  return factura;
}

function revisarFactura(factura) {
  const advertencias = [];
  const cerca = (a, b) => Math.abs(a - b) < 0.01;

  for (const item of factura.items ?? []) {
    if (!cerca(item.cantidad * item.precioUnitario, item.subtotal)) {
      advertencias.push(`El subtotal de "${item.descripcion}" no coincide con cantidad por precio`);
    }
  }

  const sumaItems = (factura.items ?? []).reduce((suma, item) => suma + item.subtotal, 0);
  if (!cerca(sumaItems, factura.neto)) {
    advertencias.push("La suma de los ítems no coincide con el neto");
  }

  if (!cerca(factura.neto + factura.iva, factura.total)) {
    advertencias.push("El neto más el IVA no coincide con el total");
  }

  return advertencias;
}

const factura = await extraerFactura(fileURLToPath(new URL("./factura.jpg", import.meta.url)));
console.log(factura);

console.log(factura.advertencias.length === 0
  ? "Las cuentas cierran."
  : "Revisá la factura: hay advertencias.");
