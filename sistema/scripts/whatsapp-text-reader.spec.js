import { afterEach, describe, expect, it, vi } from "vitest";
import { getTextGroups, getTextMessages } from "./whatsapp-text-reader.mjs";

// Execute the Puppeteer callback against raw Web models. Their serializers
// intentionally fail: importing text must not require full chat/media models.
function fixture(
  chats,
  earlier = vi.fn(async () => []),
  requestHistory = vi.fn(async () => {}),
  modules = {},
) {
  vi.stubGlobal("window", {
    require: (module) => {
      if (modules[module]) return modules[module];
      if (module === "WAWebUserPrefsHistorySync")
        return {
          getHistorySyncStatus: async () => ({ initialCompleted: true, recentCompleted: true }),
        };
      if (module === "WAWebCollections") return { Chat: { getModelsArray: () => chats } };
      if (module === "WAWebChatLoadMessages") return { loadEarlierMsgs: earlier };
      if (module === "WAWebSyncGatingUtils") return { isHistorySyncOnDemandEnabled: () => true };
      if (module === "WAWebSendNonMessageDataRequest")
        return { sendPeerDataOperationRequest: requestHistory };
      throw new Error(`Unexpected module: ${module}`);
    },
  });
  return { pupPage: { evaluate: (callback, ...args) => callback(...args) } };
}
function message(key, time, body, extra = {}) {
  return { id: { $1: key }, t: time, type: "chat", body, ...extra };
}
afterEach(() => vi.unstubAllGlobals());
describe("lector de texto compatible con modelos de WhatsApp Web", () => {
  it("resuelve ids antiguos, nuevos y user/server sin serializar chats", async () => {
    const chats = [
      { id: { _serialized: "1@g.us" }, name: "C1" },
      { id: { $1: "2@g.us" }, name: "C3" },
      { id: { user: "3", server: "g.us" }, formattedTitle: "Other" },
      { id: { $1: "4@c.us" }, name: "Private" },
    ].map((chat) => ({
      ...chat,
      serialize: () => {
        throw new Error("r");
      },
    }));
    const groups = await getTextGroups(fixture(chats));
    expect(groups.map(({ id, name }) => ({ id, name }))).toEqual([
      { id: "1@g.us", name: "C1" },
      { id: "2@g.us", name: "C3" },
      { id: "3@g.us", name: "Other" },
    ]);
  });
  it("lee historial anterior, elimina duplicados y devuelve solo texto/fecha/tipo", async () => {
    const latest = message("b", 2, "second");
    const oldest = message("a", 1, "first");
    const earlier = vi.fn().mockResolvedValueOnce([oldest, latest]).mockResolvedValueOnce([]);
    const client = fixture(
      [
        {
          id: { $1: "1@g.us" },
          name: "C1",
          msgs: {
            getModelsArray: () => [
              latest,
              message("notification", 3, "ignored", { isNotification: true }),
            ],
          },
        },
      ],
      earlier,
    );
    const [group] = await getTextGroups(client);
    expect(await group.fetchMessages({ limit: 3 })).toEqual([
      { body: "first", type: "chat", timestamp: 1 },
      { body: "second", type: "chat", timestamp: 2 },
    ]);
    expect(earlier).toHaveBeenCalledTimes(2);
  });
  it("limita al historial más reciente y no carga si ya tiene suficientes mensajes", async () => {
    const earlier = vi.fn();
    const client = fixture(
      [
        {
          id: { _serialized: "1@g.us" },
          msgs: {
            getModelsArray: () => [
              message("c", 3, "third"),
              message("a", 1, "first"),
              message("b", 2, "second"),
            ],
          },
        },
      ],
      earlier,
    );
    expect(await getTextMessages(client, "1@g.us", 2)).toEqual([
      { body: "second", type: "chat", timestamp: 2 },
      { body: "third", type: "chat", timestamp: 3 },
    ]);
    expect(earlier).not.toHaveBeenCalled();
  });
  it("reporta un historial inaccesible y propaga fallos de carga", async () => {
    await expect(getTextMessages(fixture([]), "1@g.us", 250)).rejects.toThrow(
      "historial disponible",
    );
    const client = fixture(
      [{ id: "1@g.us", msgs: { getModelsArray: () => [] } }],
      vi.fn().mockRejectedValue(new Error("history failed")),
    );
    await expect(getTextMessages(client, "1@g.us", 250)).rejects.toThrow("history failed");
  });
  it("no confunde los 15 mensajes recientes con un período completo cuando la transferencia está incompleta", async () => {
    const rows = Array.from({ length: 15 }, (_, index) =>
      message(`key-${index}`, 1000 + index, "recent"),
    );
    const request = vi.fn();
    const client = fixture(
      [
        {
          id: "1@g.us",
          name: "C1",
          endOfHistoryTransferType: 2,
          msgs: { getModelsArray: () => rows },
        },
      ],
      vi.fn(async () => []),
      request,
    );
    await expect(
      getTextMessages(client, "1@g.us", 250, { cutoff: 900, historyWaitMs: 0 }),
    ).rejects.toThrow("Historial incompleto en C1. WhatsApp solo entregó 15 mensajes");
    expect(request).toHaveBeenCalledExactlyOnceWith(3, { chatId: "1@g.us" });
  });
  it("solicita historial al teléfono para un estado elegible y recoge cambios aunque el lote venga vacío", async () => {
    const rows = [message("recent", 1000, "recent")];
    const group = {
      id: "1@g.us",
      name: "C1",
      endOfHistoryTransferType: 0,
      msgs: { getModelsArray: () => rows },
    };
    const request = vi.fn(async () => {
      rows.push(message("old", 800, "old"));
    });
    const client = fixture(
      [group],
      vi.fn(async () => []),
      request,
    );
    expect(await getTextMessages(client, "1@g.us", 250, { cutoff: 900, retryDelayMs: 0 })).toEqual([
      { body: "old", type: "chat", timestamp: 800 },
      { body: "recent", type: "chat", timestamp: 1000 },
    ]);
    expect(request).toHaveBeenCalledExactlyOnceWith(3, { chatId: "1@g.us" });
  });
  it("pide otro lote cuando el primero todavía no alcanza la fecha inicial", async () => {
    const rows = [message("recent", 1000, "recent")];
    const request = vi
      .fn()
      .mockImplementationOnce(async () => rows.push(message("middle", 950, "middle")))
      .mockImplementationOnce(async () => rows.push(message("old", 800, "old")));
    const client = fixture(
      [{ id: "1@g.us", endOfHistoryTransferType: 0, msgs: { getModelsArray: () => rows } }],
      vi.fn(async () => []),
      request,
    );
    const result = await getTextMessages(client, "1@g.us", 250, { cutoff: 900, retryDelayMs: 0 });
    expect(result.map((row) => row.body)).toEqual(["old", "middle", "recent"]);
    expect(request).toHaveBeenCalledTimes(2);
  });
  it("acepta un chat corto únicamente cuando WhatsApp confirma que no queda más historial", async () => {
    const client = fixture([
      {
        id: "1@g.us",
        endOfHistoryTransferType: 1,
        msgs: { getModelsArray: () => [message("recent", 1000, "recent")] },
      },
    ]);
    expect(await getTextMessages(client, "1@g.us", 250, { cutoff: 900 })).toHaveLength(1);
  });
  it("no exige sincronizar historia fuera del período pedido si ya alcanzó su fecha inicial", async () => {
    const earlier = vi.fn();
    const client = fixture(
      [
        {
          id: "1@g.us",
          endOfHistoryTransferType: 2,
          msgs: {
            getModelsArray: () => [message("old", 800, "old"), message("recent", 1000, "recent")],
          },
        },
      ],
      earlier,
    );
    expect(await getTextMessages(client, "1@g.us", 250, { cutoff: 900 })).toHaveLength(2);
    expect(earlier).not.toHaveBeenCalled();
  });
  it("no usa una notificación de cifrado antigua como evidencia de haber leído los días anteriores", async () => {
    const client = fixture([
      {
        id: "1@g.us",
        name: "C3",
        endOfHistoryTransferType: 2,
        msgs: {
          getModelsArray: () => [
            message("system", 800, "", { type: "e2e_notification" }),
            message("recent", 1000, "recent"),
          ],
        },
      },
    ]);
    await expect(
      getTextMessages(client, "1@g.us", 250, { cutoff: 900, historyWaitMs: 0 }),
    ).rejects.toThrow("Historial incompleto en C3");
  });
});

describe("recuperación de respuestas de historial trabadas", () => {
  function recoveryFixture({ recent = false, busy = false, fail = false } = {}) {
    const rows = [message("recent", 1000, "recent")];
    const chat = {
      id: "1@g.us",
      name: "C1",
      endOfHistoryTransferType: 2,
      msgs: { getModelsArray: () => rows, msgLoadState: { noEarlierMsgs: false } },
    };
    const pending = [
      { syncType: 6, msgKey: "other", peerDataRequestChatId: "2@g.us" },
      {
        syncType: 6,
        msgKey: "own",
        peerDataRequestChatId: "1@g.us",
        downloadOptions: { filehash: "" },
        chunkEncryptionKey: "test-placeholder",
      },
      ...(recent ? [{ syncType: 3, msgKey: "recent-transfer" }] : []),
    ];
    const table = {
      equals: vi.fn(async () => pending),
      postflightDecryptSingleRecord: vi.fn(async (row) => row),
    };
    const flight = new Set();
    const cleanup = vi.fn((key) => flight.delete(key));
    const handler = vi.fn(async (chunk) => {
      expect(flight.has(chunk.msgKey)).toBe(true);
      expect(chunk.downloadOptions.mediaKey).toBe("test-placeholder");
      if (fail) throw new Error("processing failed");
      rows.push(message("old", 800, "old"));
      pending.splice(
        pending.findIndex((row) => row.msgKey === chunk.msgKey),
        1,
      );
      chat.endOfHistoryTransferType = 0;
    });
    const client = fixture(
      [chat],
      vi.fn(async () => []),
      vi.fn(),
      {
        WAWebUserPrefsHistorySync: {
          getHistorySyncStatus: async () => ({ initialCompleted: true }),
        },
        WAWebApiHistorySyncNotification: {
          inFlightChunk: flight,
          removeLocalFailureFromInFlightChunk: cleanup,
        },
        WAWebSyncBootstrap: { getIsHistorySyncRunning: () => busy },
        WAWebSchemaHistorySyncNotification: { getHistorySyncNotificationTable: () => table },
        "WAWebProtobufsHistorySync.pb": {
          HistorySync$HistorySyncType: { ON_DEMAND: 6, RECENT: 3 },
        },
        WAWebHandleHistorySyncChunk: { handleHistorySyncChunk: handler },
      },
    );
    return { client, handler, cleanup, table, pending, flight };
  }
  it("procesa la respuesta del grupo pedido cuando Web la bloquea detrás de recentCompleted", async () => {
    const { client, handler, pending, flight } = recoveryFixture();
    const texts = await getTextMessages(client, "1@g.us", 250, { cutoff: 900, historyWaitMs: 0 });
    expect(texts.map((text) => text.body)).toEqual(["old", "recent"]);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].peerDataRequestChatId).toBe("1@g.us");
    expect(pending.map((row) => row.msgKey)).toEqual(["other"]);
    expect(flight.size).toBe(0);
  });
  it.each([{ recent: true }, { busy: true }])(
    "respeta una sincronización normal pendiente o en ejecución: %j",
    async (options) => {
      const { client, handler } = recoveryFixture(options);
      await expect(
        getTextMessages(client, "1@g.us", 250, { cutoff: 900, historyWaitMs: 0 }),
      ).rejects.toThrow("Historial incompleto");
      expect(handler).not.toHaveBeenCalled();
    },
  );
  it("no reintenta indefinidamente una respuesta que Web no pudo aplicar", async () => {
    const { client, handler } = recoveryFixture();
    handler.mockImplementation(async () => {});
    await expect(
      getTextMessages(client, "1@g.us", 250, { cutoff: 900, historyWaitMs: 0 }),
    ).rejects.toThrow("Historial incompleto");
    expect(handler).toHaveBeenCalledTimes(1);
  });
  it("libera la marca de procesamiento si falla el controlador de Web", async () => {
    const { client, cleanup, flight } = recoveryFixture({ fail: true });
    await expect(
      getTextMessages(client, "1@g.us", 250, { cutoff: 900, historyWaitMs: 0 }),
    ).rejects.toThrow("processing failed");
    expect(cleanup).toHaveBeenCalledWith("own");
    expect(flight.size).toBe(0);
  });
});
