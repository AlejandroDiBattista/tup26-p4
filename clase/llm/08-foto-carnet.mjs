// Desde clase/llm: node --env-file-if-exists=.env 08-foto-carnet.mjs
import { fileURLToPath } from "node:url";
import { readFile, writeFile } from "node:fs/promises";
import { extname } from "node:path";
import { access } from "node:fs/promises";

if (!process.env.OPENAI_API_KEY?.trim()) {
  throw new Error("Falta OPENAI_API_KEY. Definila en el entorno o en clase/llm/.env.");
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

const FORMATOS_SALIDA = {
  ".png": "png",
  ".jpg": "jpeg",
  ".jpeg": "jpeg",
  ".webp": "webp",
};

const URL_EDICIONES  = "https://api.openai.com/v1/images/edits";
const MODELO_EDICION = "gpt-image-2.5-sunburst";

async function transformarImagen(rutaOriginal, prompt, rutaNueva, opciones = {}) {
  const formato = FORMATOS_SALIDA[extname(rutaNueva).toLowerCase()];
  if (!formato) {
    throw new Error(`Formato de salida no admitido: ${rutaNueva}`);
  }
  const original = await leerImagen(rutaOriginal);

  const respuesta = await fetch(URL_EDICIONES, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODELO_EDICION,
      prompt,
      images: [{ image_url: original }],
      size: opciones.dimensiones ?? "auto",
      quality: opciones.calidad ?? "medium",
      output_format: formato,
    }),
  });

  if (!respuesta.ok) {
    const detalle = await respuesta.text();
    throw new Error(`La API respondió ${respuesta.status}: ${detalle}`);
  }

  const datos = await respuesta.json();
  await writeFile(rutaNueva, Buffer.from(datos.data[0].b64_json, "base64"));
  return rutaNueva;
}

async function fotoCarnet(rutaSelfie, rutaFoto) {
  const prompt = `
    Genera un retrato profesional editorial, altamente realista, utilizando la fotografía proporcionada estrictamente como referencia de identidad. Conserva con máxima fidelidad la identidad de la persona: estructura y proporciones exactas del rostro, forma de la cabeza, tono de piel, edad aparente, líneas naturales de expresión, ojos, cabello, vello facial y demás rasgos distintivos. No rejuvenecer, embellecer artificialmente, adelgazar, modificar las facciones ni convertirlo en una persona simplemente parecida.
    La expresión debe ser tranquila, inteligente, segura y accesible, con una sonrisa muy leve y natural, mirando directamente hacia la cámara.
    El resultado debe transmitir profesionalidad sin rigidez: un retrato apropiado para LinkedIn, perfil universitario, página profesional, biografía de conferencista o publicación editorial.
    Utilizar iluminación clásica profesional de estudio: luz principal grande y suave aproximadamente a 45 grados del rostro, relleno delicado para controlar las sombras y una sutil luz de separación del fondo. Mantener reflejos naturales en los ojos, exposición equilibrada y textura auténtica de la piel. Evitar sombras duras y piel excesivamente suavizada.
    Encuadre vertical de cabeza y hombros, incluyendo aproximadamente hasta la parte superior del pecho. Hombros ligeramente girados respecto de la cámara y rostro orientado naturalmente hacia ella. Cámara colocada aproximadamente a la altura de los ojos.
    Simular la estética óptica de una fotografía realizada con un objetivo profesional para retratos de aproximadamente 85 mm, con profundidad de campo reducida. Los ojos y el rostro deben estar perfectamente enfocados mientras el fondo permanece elegantemente desenfocado.
    Utilizar como fondo un estudio, despacho u oficina contemporánea elegante, en tonos neutros y ligeramente oscuros, completamente desenfocado. Incorporar de manera muy discreta elementos como madera cálida, una biblioteca, una planta, una lámpara con luz cálida y alguna obra gráfica enmarcada. Estos elementos deben aparecer solamente como formas y luces desenfocadas, aportando profundidad sin distraer del rostro.
    Fotografía profesional fotorrealista de alta resolución, calidad editorial, textura natural de la piel, poros visibles de manera sutil, iluminación realista, tonos de piel naturales, gradación de color elegante, contraste moderado, gran rango dinámico y excelente detalle óptico. Evitar el aspecto plástico, el exceso de retoque, la piel artificialmente perfecta, efectos cinematográficos exagerados o cualquier apariencia típica de una imagen generada por IA.
    `;

  return transformarImagen(rutaSelfie, prompt, rutaFoto, {
    dimensiones: "1024x1024",
    calidad: "high",
  });
}

const rutaSelfie = fileURLToPath(new URL("./selfie.jpg", import.meta.url));
const rutaFoto = fileURLToPath(new URL("./foto-carnet.jpg", import.meta.url));

try {
  await access(rutaSelfie);
} catch {
  console.error("Poné una foto tuya llamada selfie.jpg en la carpeta 11-foto-carnet.");
  process.exit(1);
}

await fotoCarnet(rutaSelfie, rutaFoto);
console.log("Foto carnet guardada en ./foto-carnet.jpg");
