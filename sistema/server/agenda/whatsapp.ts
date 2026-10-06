import { fork } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { resolve } from "node:path";
import type { WhatsAppReadState } from "../../shared/whatsapp";

const jobs = new Map<
  string,
  { owner: string; state: WhatsAppReadState; expires: number; child?: ReturnType<typeof fork> }
>();
let active: { owner: string; id: string } | null = null;
export async function startWhatsappRead(owner: string) {
  for (const [key, job] of jobs) if (job.expires < Date.now()) jobs.delete(key);
  if (active) {
    if (active.owner !== owner)
      throw new Error("Hay otra lectura de WhatsApp en curso. Intentá de nuevo en unos minutos.");
    return { id: active.id };
  }
  const id = randomUUID();
  const state: WhatsAppReadState = { id, status: "starting" };
  const job: {
    owner: string;
    state: WhatsAppReadState;
    expires: number;
    child?: ReturnType<typeof fork>;
  } = { owner, state, expires: Date.now() + 600000 };
  jobs.set(id, job);
  setTimeout(() => jobs.delete(id), 600000).unref();
  active = { owner, id };
  try {
    const child = fork(
      resolve("scripts/read-whatsapp.mjs"),
      [
        JSON.stringify({
          session: createHash("sha256").update(owner).digest("hex"),
          config: { days: 14 },
        }),
      ],
      { stdio: ["ignore", "ignore", "ignore", "ipc"], execArgv: [] },
    );
    job.child = child;
    let terminal: WhatsAppReadState | undefined;
    const timeout = setTimeout(() => {
      job.state = { id, status: "error", error: "Se agotó el tiempo de lectura de WhatsApp." };
      child.kill("SIGTERM");
      setTimeout(() => child.kill("SIGKILL"), 6000).unref();
    }, 180000);
    timeout.unref();
    child.on("message", (message) => {
      const received = { ...(message as Omit<WhatsAppReadState, "id">), id };
      if (received.status === "done" || received.status === "error") terminal = received;
      else job.state = received;
    });
    child.once("error", () => {
      job.state = { id, status: "error", error: "No se pudo iniciar la lectura de WhatsApp." };
      clearTimeout(timeout);
      if (active?.id === id) active = null;
    });
    child.once("exit", () => {
      clearTimeout(timeout);
      if (terminal) job.state = terminal;
      delete job.child;
      if (job.state.status !== "done" && job.state.status !== "error")
        job.state = {
          id,
          status: "error",
          error:
            "La lectura se interrumpió. Verificá que Chrome esté instalado y volvé a intentar.",
        };
      if (active?.id === id) active = null;
    });
  } catch (error) {
    active = null;
    jobs.delete(id);
    throw error;
  }
  return { id };
}
export function whatsappReadStatus(owner: string, id: string) {
  const job = jobs.get(id);
  if (!job || job.owner !== owner || job.expires < Date.now())
    throw new Error("La lectura expiró. Volvé a intentar.");
  return job.state;
}

export function cancelWhatsappRead(owner: string, id: string) {
  whatsappReadStatus(owner, id);
  const job = jobs.get(id)!;
  if (job.child) {
    job.state = { id, status: "error", error: "Lectura cancelada." };
    job.child.kill("SIGTERM");
  }
  return { cancelled: true };
}
