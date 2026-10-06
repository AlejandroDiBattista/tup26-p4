import { EventEmitter } from "node:events";
import { describe, expect, it, vi } from "vitest";
import { runWhatsappSession, readWhatsapp } from "./whatsapp-session.mjs";

function mockClient(chats = []) {
  const client = new EventEmitter();
  client.initialize = vi.fn(async () => {
    queueMicrotask(() => client.emit("ready"));
  });
  client.destroy = vi.fn(async () => {});
  client.getChats = vi.fn(async () => chats);
  return client;
}
const config = { days: 7 };
const C1 = "100@g.us";
const C3 = "200@g.us";
function chat(id, messages) {
  return {
    isGroup: true,
    id: { _serialized: id },
    name: id === C1 ? "TUP26-P4-C1👨🏻‍💻" : "TUP26-P4-C3👨🏻‍💻",
    fetchMessages: vi.fn(async () => messages),
  };
}
describe("lectura puntual de WhatsApp", () => {
  it("busca ambos grupos por nombre y cierra antes de entregar el resultado", async () => {
    const client = mockClient([chat(C1, []), chat(C3, []), { isGroup: false }]);
    const result = await runWhatsappSession(client, { config }, vi.fn());
    expect(result.status).toBe("done");
    expect(result.count).toBe(0);
    expect(client.destroy).toHaveBeenCalledOnce();
  });
  it("no abre ventana al leer con una sesión ya vinculada", async () => {
    const client = mockClient([chat(C1, []), chat(C3, [])]);
    const factory = vi.fn(() => client);
    const result = await readWhatsapp(factory, { config }, vi.fn());
    expect(result.status).toBe("done");
    expect(factory).toHaveBeenCalledExactlyOnceWith(false);
  });
  it("abre ventana solo al necesitar QR, cerrando primero el navegador oculto", async () => {
    const hidden = mockClient();
    hidden.initialize = vi.fn(async () => {
      queueMicrotask(() => hidden.emit("qr"));
    });
    const visible = mockClient([chat(C1, []), chat(C3, [])]);
    const factory = vi.fn((show) => {
      if (show) expect(hidden.destroy).toHaveBeenCalledOnce();
      return show ? visible : hidden;
    });
    const result = await readWhatsapp(factory, { config }, vi.fn());
    expect(result.status).toBe("done");
    expect(factory.mock.calls).toEqual([[false], [true]]);
    expect(visible.destroy).toHaveBeenCalledOnce();
  });
  it("rechaza nombres duplicados en vez de leer otro grupo", async () => {
    const client = mockClient([chat(C1, []), chat(C1, []), chat(C3, [])]);
    const result = await runWhatsappSession(client, { config }, vi.fn());
    expect(result.status).toBe("error");
    expect(result.error).toContain("más de un grupo");
  });
  it("filtra por fecha y por texto, preservando la fecha argentina en cada línea", async () => {
    const now = Math.floor(Date.now() / 1000);
    const c1 = chat(C1, [
      { timestamp: now, type: "chat", body: "51234.18.abcd.12\n54321.16.abcd.12" },
      { timestamp: now - 9 * 86400, type: "chat", body: "OLD" },
      { timestamp: now, type: "image", body: "IMAGE" },
    ]);
    const client = mockClient([c1, chat(C3, [{ timestamp: now, type: "chat", body: "55555" }])]);
    const result = await runWhatsappSession(client, { config }, vi.fn());
    expect(result.count).toBe(2);
    expect(result.text).not.toMatch(/OLD|IMAGE/);
    expect(result.text.split("\n")).toHaveLength(3);
    for (const line of result.text.split("\n"))
      expect(line).toMatch(/^\[\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}\] WhatsApp: /);
    expect(client.destroy).toHaveBeenCalledOnce();
  });
  it("no presenta una lectura parcial como éxito cuando falla un grupo", async () => {
    const client = mockClient([chat(C1, [])]);
    const result = await runWhatsappSession(client, { config }, vi.fn());
    expect(result.status).toBe("error");
    expect(result.text).toBeUndefined();
    expect(client.destroy).toHaveBeenCalledOnce();
  });
  it("cierra también ante errores de lectura", async () => {
    const client = mockClient();
    client.getChats.mockRejectedValue(new Error("read failed"));
    const result = await runWhatsappSession(client, {}, vi.fn());
    expect(result).toEqual({
      status: "error",
      error: "No se pudo listar los grupos de WhatsApp: read failed",
    });
    expect(client.destroy).toHaveBeenCalledOnce();
  });
  it("cierra cuando no se escanea el QR dentro del plazo", async () => {
    const client = mockClient();
    client.initialize = vi.fn(async () => {});
    const result = await runWhatsappSession(client, {}, vi.fn(), 10);
    expect(result.status).toBe("error");
    expect(client.destroy).toHaveBeenCalledOnce();
  });
});
