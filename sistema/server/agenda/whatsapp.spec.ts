import { EventEmitter } from "node:events";
import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ fork: vi.fn() }));
vi.mock("node:child_process", () => ({ fork: mocks.fork }));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});
describe("lecturas por docente", () => {
  it("reutiliza una sola lectura ante clicks simultáneos y restringe el resultado al dueño", async () => {
    const child = Object.assign(new EventEmitter(), { kill: vi.fn() });
    mocks.fork.mockReturnValue(child);
    const service = await import("./whatsapp");
    const [first, second] = await Promise.all([
      service.startWhatsappRead("teacher@example.test"),
      service.startWhatsappRead("teacher@example.test"),
    ]);
    expect(first.id).toBe(second.id);
    expect(mocks.fork).toHaveBeenCalledOnce();
    expect(() => service.whatsappReadStatus("other@example.test", first.id)).toThrow();
    await expect(service.startWhatsappRead("other@example.test")).rejects.toThrow();
    child.emit("message", { status: "done", text: "example" });
    child.emit("exit", 0);
    expect(service.whatsappReadStatus("teacher@example.test", first.id).text).toBe("example");
  });
  it("cancela solo la lectura propia y solicita cerrar el proceso", async () => {
    const child = Object.assign(new EventEmitter(), { kill: vi.fn() });
    mocks.fork.mockReturnValue(child);
    const service = await import("./whatsapp");
    const { id } = await service.startWhatsappRead("teacher@example.test");
    expect(() => service.cancelWhatsappRead("other@example.test", id)).toThrow();
    expect(child.kill).not.toHaveBeenCalled();
    service.cancelWhatsappRead("teacher@example.test", id);
    expect(child.kill).toHaveBeenCalledWith("SIGTERM");
    child.emit("exit", 1);
    expect(service.whatsappReadStatus("teacher@example.test", id).status).toBe("error");
  });
  it("consulta siempre 14 días sin depender de configuraciones anteriores", async () => {
    const child = Object.assign(new EventEmitter(), { kill: vi.fn() });
    mocks.fork.mockReturnValue(child);
    const service = await import("./whatsapp");
    await service.startWhatsappRead("teacher@example.test");
    const input = JSON.parse(mocks.fork.mock.calls[0][1][0]);
    expect(input.config.days).toBe(14);
    child.emit("exit", 1);
  });
});
