import { DatabaseSync } from "node:sqlite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Octokit } from "octokit";

// Uso: GITHUB_TOKEN configurado en el entorno, node tools/leer-invitaciones.js
// Opcionales: ALUMNOS_DB_PATH, OWNER_EMAIL, GITHUB_OWNER y GITHUB_REPO.
// Por defecto solo consulta. --actualizar guarda es_colaborador; nunca envía invitaciones.
export function leerAlumnos() {
  const db = new DatabaseSync(
    process.env.ALUMNOS_DB_PATH ?? fileURLToPath(new URL("../data/app.db", import.meta.url)), // guard:allow-env-credential — CLI local del docente, fuera del servidor multiusuario.
    { readOnly: true },
  );
  try {
    let owner = process.env.OWNER_EMAIL?.trim(); // guard:allow-env-credential — CLI local del docente, fuera del servidor multiusuario.
    if (!owner) {
      const owners = db.prepare("SELECT DISTINCT owner_email FROM students").all();
      if (owners.length === 0) return [];
      if (owners.length !== 1) {
        throw new Error("Hay varios docentes: configurá OWNER_EMAIL para elegir el padrón.");
      }
      owner = owners[0].owner_email;
    }
    return db.prepare(`
      SELECT s.legajo, s.apellido, s.nombre, s.github, s.owner_email,
             COALESCE(c.commission, c.name, '-') AS comision
      FROM students s
      LEFT JOIN enrollments e ON e.student_id = s.id AND e.owner_email = s.owner_email
      LEFT JOIN courses c ON c.id = e.course_id AND c.owner_email = s.owner_email
      WHERE s.owner_email = ?
      ORDER BY comision, s.apellido, s.nombre, s.legajo
    `).all(owner);
  } finally {
    db.close();
  }
}

function usuarioGithub(value) {
  const raw = value?.trim() ?? "";
  if (!raw || raw === "-") return "";
  return (raw.match(/^(?:https?:\/\/)?github\.com\/([^/?#]+)/i)?.[1] ?? raw.replace(/^@/, "")).toLowerCase();
}

export function estadosAlumnos(alumnos, invitaciones, colaboradores) {
  const pendientes = new Map(
    invitaciones.filter((i) => i.invitee?.login).map((i) => [usuarioGithub(i.invitee.login), i]),
  );
  const conAcceso = new Set(colaboradores.map((c) => usuarioGithub(c.login)));
  return alumnos.map((alumno) => {
    const usuario = usuarioGithub(alumno.github);
    const invitacion = pendientes.get(usuario);
    const estado = !usuario ? "Sin GitHub"
      : conAcceso.has(usuario) ? "Con acceso (colaborador)"
      : invitacion ? (invitacion.expired ? "Invitación vencida" : "Invitación pendiente")
      : "Sin acceso ni invitación vigente";
    return {
      legajo: alumno.legajo,
      alumno: `${alumno.apellido}, ${alumno.nombre}`,
      comision: alumno.comision,
      usuario: usuario || "-",
      estado,
      fecha_invitacion: invitacion?.created_at ?? "-",
    };
  });
}

export function actualizarColaboradores(alumnos, colaboradores) {
  const conAcceso = new Set(colaboradores.map((c) => usuarioGithub(c.login)));
  const db = new DatabaseSync(
    process.env.ALUMNOS_DB_PATH ?? fileURLToPath(new URL("../data/app.db", import.meta.url)), // guard:allow-env-credential — CLI local del docente, fuera del servidor multiusuario.
  );
  try {
    db.exec("BEGIN IMMEDIATE");
    const update = db.prepare(`UPDATE students SET es_colaborador = ?, updated_at = CURRENT_TIMESTAMP
      WHERE owner_email = ? AND legajo = ? AND github IS ?`);
    const read = db.prepare("SELECT es_colaborador FROM students WHERE owner_email = ? AND legajo = ?");
    let total = 0;
    for (const alumno of alumnos) {
      const usuario = usuarioGithub(alumno.github);
      const valor = usuario && conAcceso.has(usuario) ? 1 : 0;
      const result = update.run(valor, alumno.owner_email, alumno.legajo, alumno.github);
      if (result.changes !== 1 || read.get(alumno.owner_email, alumno.legajo)?.es_colaborador !== valor) {
        throw new Error("El padrón cambió durante la consulta. Volvé a ejecutar la sincronización.");
      }
      total += valor;
    }
    db.exec("COMMIT");
    return { alumnos: alumnos.length, colaboradores: total };
  } catch (error) {
    if (db.isTransaction) db.exec("ROLLBACK");
    throw error;
  } finally {
    db.close();
  }
}

async function main() {
  const alumnos = leerAlumnos();
  if (!alumnos.length) {
    console.log("No hay alumnos en el padrón seleccionado.");
    return;
  }
  if (!process.env.GITHUB_TOKEN?.trim()) { // guard:allow-env-credential — CLI local del docente, fuera del servidor multiusuario.
    throw new Error("Configurá GITHUB_TOKEN con acceso de administración de lectura al repositorio.");
  }
  const github = new Octokit({ auth: process.env.GITHUB_TOKEN }); // guard:allow-env-credential — CLI local del docente, fuera del servidor multiusuario.
  const repo = {
    owner: process.env.GITHUB_OWNER ?? "AlejandroDiBattista", // guard:allow-env-credential — CLI local del docente, fuera del servidor multiusuario.
    repo: process.env.GITHUB_REPO ?? "tup26-p4", // guard:allow-env-credential — CLI local del docente, fuera del servidor multiusuario.
    per_page: 100,
  };
  const [invitaciones, colaboradores] = await Promise.all([
    github.paginate("GET /repos/{owner}/{repo}/invitations", repo),
    github.paginate("GET /repos/{owner}/{repo}/collaborators", { ...repo, affiliation: "all" }),
  ]);
  const filas = estadosAlumnos(alumnos, invitaciones, colaboradores);
  if (process.argv.includes("--actualizar")) {
    const resumen = actualizarColaboradores(alumnos, colaboradores);
    console.log(`Estado guardado y verificado: ${resumen.colaboradores} colaboradores de ${resumen.alumnos} alumnos.`);
  }
  console.table(filas);
  console.log(`Total: ${filas.length} alumnos.`);
  console.log("Sin acceso ni invitación vigente no distingue invitaciones rechazadas, eliminadas o nunca enviadas.");
  const sinUsuario = invitaciones.filter((i) => !i.invitee?.login).length;
  if (sinUsuario) console.log(`Hay ${sinUsuario} invitaciones sin usuario que no se pueden asociar al padrón.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main().catch((error) => {
    // No imprimir el objeto de Octokit: puede contener encabezados de autenticación.
    console.error(error.status
      ? `No se pudo consultar GitHub (HTTP ${error.status}). Revisá el token y los permisos del repositorio.`
      : error.message);
    process.exitCode = 1;
  });
}
