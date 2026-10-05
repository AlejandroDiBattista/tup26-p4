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
  "como se veria el cuerpo de un atleta de elite, con un cuerpo muy musculoso y definido, con una gran fuerza y resistencia, en un estilo hiperrealista, con una iluminación dramática y un fondo oscuro, en una pose de acción, mostrando su poder y determinación, con un enfoque en los detalles anatómicos y la textura de la piel, como si fuera una pintura digital de alta calidad y comparalo por una persona con sobrepeso",
  "portada.png",
  { dimensiones: "1536x1024" }
);
console.log("Imagen guardada en portada.png");
