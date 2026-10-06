// A short-lived process: no WhatsApp listener survives a read.
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import whatsapp from "whatsapp-web.js";
import { getTextGroups } from "./whatsapp-text-reader.mjs";
const { Client, LocalAuth } = whatsapp;
const input = JSON.parse(process.argv[2]);
const dataPath = resolve(".cache/whatsapp");
mkdirSync(dataPath, { recursive: true, mode: 0o700 });
const executablePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
if (!existsSync(executablePath))
  throw new Error("No se encontró Google Chrome en Aplicaciones. Instalalo para leer WhatsApp.");
const notify = (value) => process.connected && process.send(value);
const { readWhatsapp } = await import("./whatsapp-session.mjs");
const createClient = (visible) => {
  const client = new Client({
    authStrategy: new LocalAuth({ clientId: input.session, dataPath }),
    webVersionCache: { type: "local", path: resolve(".cache/whatsapp/web-version") },
    puppeteer: { headless: !visible, executablePath, args: ["--no-first-run"] },
  });
  client.getChats = () => getTextGroups(client);
  return client;
};
// First try the saved session without opening a window. Only a QR request
// triggers a visible browser, after the headless instance has been closed.
const output = await readWhatsapp(createClient, input, notify);
notify(output);
process.disconnect?.();
process.exit(output.status === "error" ? 1 : 0);
