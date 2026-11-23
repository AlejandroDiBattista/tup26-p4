// Conexión con la base de datos.
// - En desarrollo: DATABASE_URL="file:./local.db" (un archivo SQLite local).
// - En producción (Vercel): DATABASE_URL="libsql://....turso.io" y DATABASE_AUTH_TOKEN (o copia segura a /tmp).
// La aplicación sabe cuál usar SOLO por las variables de entorno.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as esquema from "./esquema";
import { BASE_DATOS_SEMILLA_B64 } from "./semilla-base64";

let urlBaseDatos =
  process.env.DATABASE_URL ||
  process.env.TURSO_DATABASE_URL ||
  "file:./local.db";

const tokenBaseDatos =
  process.env.DATABASE_AUTH_TOKEN ||
  process.env.TURSO_AUTH_TOKEN;

// Si estamos en Vercel o en un entorno serverless y usando archivo SQLite local,
// aseguramos que exista una base de datos con todas las tablas y datos sembrados en un directorio escribible:
if (urlBaseDatos.startsWith("file:") && (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)) {
  const rutaTmp = path.join(os.tmpdir(), "local.db");
  try {
    const dirTmp = path.dirname(rutaTmp);
    if (!fs.existsSync(dirTmp)) {
      fs.mkdirSync(dirTmp, { recursive: true });
    }
    const existeYTieneDatos = fs.existsSync(rutaTmp) && fs.statSync(rutaTmp).size > 0;
    if (!existeYTieneDatos) {
      // Intentar copiar desde disco si existe el archivo
      const rutaArchivo = urlBaseDatos.replace("file:", "");
      const candidatos = [
        path.resolve(process.cwd(), rutaArchivo),
        path.resolve(process.cwd(), "local.db"),
        path.resolve(__dirname, "local.db"),
        path.resolve(__dirname, "../local.db"),
      ];
      const archivoEncontrado = candidatos.find((p) => fs.existsSync(p) && fs.statSync(p).size > 0);
      if (archivoEncontrado) {
        fs.copyFileSync(archivoEncontrado, rutaTmp);
      } else {
        // Si no está en disco (típico en lambdas de Vercel), materializarla desde el base64 embebido
        fs.writeFileSync(rutaTmp, Buffer.from(BASE_DATOS_SEMILLA_B64, "base64"));
      }
    }
    urlBaseDatos = `file:${rutaTmp}`;
  } catch (error) {
    console.error("Error preparando base de datos en directorio temporal:", error);
  }
}

const clienteSql = createClient({
  url: urlBaseDatos,
  authToken: tokenBaseDatos || undefined,
});

// "db" es el objeto que usan todos los servicios para leer y escribir.
export const db = drizzle(clienteSql, { schema: esquema });

// Tipo de "db" o de una transacción: los servicios aceptan cualquiera de los dos.
export type BaseDatos = typeof db;
export type Transaccion = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type Conexion = BaseDatos | Transaccion;
