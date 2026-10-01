// Desde clase/llm: node --env-file-if-exists=.env 07-generar-imagen.mjs
import { writeFile } from "node:fs/promises";
import { extname } from "node:path";

if (!process.env.OPENAI_API_KEY?.trim()) {
  throw new Error("Falta OPENAI_API_KEY. Definila en el entorno o en clase/llm/.env.");
}

const FORMATOS_SALIDA = {
  ".png": "png",
  ".jpg": "jpeg",
  ".jpeg": "jpeg",
  ".webp": "webp",
};

const URL_IMAGENES  = "https://api.openai.com/v1/images/generations";
const MODELO_IMAGEN = "gpt-image-2.5-flare";

async function generarImagen(prompt, ruta, opciones = {}) {
  const formato = FORMATOS_SALIDA[extname(ruta).toLowerCase()];
  if (!formato) {
    throw new Error(`Formato de salida no admitido: ${ruta}`);
  }

  const respuesta = await fetch(URL_IMAGENES, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODELO_IMAGEN,
      prompt,
      size: opciones.dimensiones ?? "1024x1024",
      quality: opciones.calidad ?? "medium",
      output_format: formato,
    }),
  });

  if (!respuesta.ok) {
    const detalle = await respuesta.text();
    throw new Error(`La API respondió ${respuesta.status}: ${detalle}`);
  }

  const datos = await respuesta.json();
  const bytes = Buffer.from(datos.data[0].b64_json, "base64");
  await writeFile(ruta, bytes);
  return ruta;
}

await generarImagen(
  "Ilustración plana de una computadora antigua con una lupa encima, colores pastel, fondo liso, sin texto",
  "portada.png",
  { dimensiones: "1536x1024" }
);
console.log("Imagen guardada en portada.png");
