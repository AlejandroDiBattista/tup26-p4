// Keep authentication/lifecycle in whatsapp-web.js, but read only the fields
// needed by this importer. Its full chat serializer currently fails with some
// WhatsApp Web models whose Wid._serialized property was renamed to Wid.$1.
export async function getTextGroups(client) {
  const groups = await client.pupPage.evaluate(() => {
    const serializedId = (wid) => {
      if (typeof wid === "string") return wid;
      return (
        wid?._serialized ??
        wid?.$1 ??
        (wid?.user && wid?.server ? `${wid.user}@${wid.server}` : undefined)
      );
    };
    return window
      .require("WAWebCollections")
      .Chat.getModelsArray()
      .filter((chat) => serializedId(chat.id)?.endsWith("@g.us"))
      .map((chat) => ({
        id: serializedId(chat.id),
        name: chat.name ?? chat.formattedTitle ?? "",
      }));
  });
  return groups.map((group) => ({
    ...group,
    isGroup: true,
    fetchMessages: ({ limit, cutoff }) => getTextMessages(client, group.id, limit, { cutoff }),
  }));
}

export async function getTextMessages(
  client,
  id,
  limit,
  { cutoff = -Infinity, historyWaitMs = 60000, retryDelayMs = 1500 } = {},
) {
  return client.pupPage.evaluate(
    async (groupId, messageLimit, options) => {
      const serializedId = (wid) => {
        if (typeof wid === "string") return wid;
        return (
          wid?._serialized ??
          wid?.$1 ??
          (wid?.user && wid?.server ? `${wid.user}@${wid.server}` : undefined)
        );
      };
      const chat = window
        .require("WAWebCollections")
        .Chat.getModelsArray()
        .find((candidate) => serializedId(candidate.id) === groupId);
      if (!chat?.msgs) throw new Error("El grupo no tiene un historial disponible en esta sesión.");
      const messages = new Map();
      const collect = (rows) => {
        for (const message of rows) {
          if (message.isNotification) continue;
          const key = serializedId(message.id);
          // Raw models are stable objects, also usable as keys on older versions.
          messages.set(key ?? message, message);
        }
      };
      collect(chat.msgs.getModelsArray());
      const rangeCovered = () =>
        [...messages.values()].some(
          (message) => message.type === "chat" && message.t < options.cutoff,
        );
      // Some linked sessions never receive the final RECENT-sync chunk. Web
      // then queues ON_DEMAND replies forever behind recentCompleted, even
      // though the phone already supplied them. Apply only this group's reply
      // through Web's own handler when its normal sync pipeline is idle.
      const attemptedReplies = new Set();
      const recoverPendingHistory = async () => {
        const prefs = window.require("WAWebUserPrefsHistorySync");
        const status = await prefs.getHistorySyncStatus();
        if (!status?.initialCompleted || status.recentCompleted) return false;
        const api = window.require("WAWebApiHistorySyncNotification");
        if (
          api.inFlightChunk.size ||
          window.require("WAWebSyncBootstrap").getIsHistorySyncRunning()
        )
          return false;
        const table = window
          .require("WAWebSchemaHistorySyncNotification")
          .getHistorySyncNotificationTable();
        const pending = await table.equals(["processed"], 0, { shouldDecrypt: false });
        const types = window.require("WAWebProtobufsHistorySync.pb").HistorySync$HistorySyncType;
        if (pending.some((row) => row.syncType === types.RECENT)) return false;
        const jid = chat.id.toJid?.() ?? serializedId(chat.id);
        const row = pending.find(
          (candidate) =>
            candidate.syncType === types.ON_DEMAND &&
            !candidate.reuploadPending &&
            candidate.peerDataRequestChatId === jid &&
            !api.inFlightChunk.has(candidate.msgKey) &&
            !attemptedReplies.has(candidate.msgKey),
        );
        if (!row) return false;
        const stored = await table.postflightDecryptSingleRecord(row);
        if (api.inFlightChunk.size) return false;
        // Restore the download fields exactly as Web's normal queue consumer.
        // They remain inside the linked browser; never return/store/log them.
        const chunk = {
          ...stored,
          downloadOptions: {
            ...stored.downloadOptions,
            mediaKey: stored.chunkEncryptionKey,
            directPath: stored.directPath || stored.downloadOptions.directPath,
            filehash:
              stored.downloadOptions.filehash === ""
                ? stored.filehash
                : stored.downloadOptions.filehash,
            encFilehash: stored.encFilehash,
          },
        };
        delete chunk.chunkEncryptionKey;
        delete chunk.directPath;
        delete chunk.filehash;
        delete chunk.encFilehash;
        attemptedReplies.add(chunk.msgKey);
        api.inFlightChunk.add(chunk.msgKey);
        try {
          await window.require("WAWebHandleHistorySyncChunk").handleHistorySyncChunk(chunk);
        } finally {
          api.removeLocalFailureFromInFlightChunk(chunk.msgKey);
        }
        if (chat.msgs.msgLoadState) chat.msgs.msgLoadState.noEarlierMsgs = false;
        return true;
      };
      let stalledAt;
      let requestedHistory = false;
      while (messages.size < messageLimit && !rangeCovered()) {
        const previousSize = messages.size;
        const earlier = await window.require("WAWebChatLoadMessages").loadEarlierMsgs({ chat });
        collect(earlier ?? []);
        // History transfers may update the collection independently of the
        // loader's returned batch. Never mistake an empty batch for exhaustion.
        collect(chat.msgs.getModelsArray());
        if (messages.size > previousSize) {
          stalledAt = undefined;
          requestedHistory = false;
          continue;
        }
        if (rangeCovered()) break;
        const historyType = chat.endOfHistoryTransferType;
        if (
          (historyType === 0 || historyType === 2) &&
          Number.isFinite(options.cutoff) &&
          (await recoverPendingHistory())
        )
          continue;
        // COMPLETE_AND_NO_MORE_MESSAGE_REMAIN_ON_PRIMARY, as used by Web.
        if (historyType === 1) break;
        // Calls without a date range are used by adapter tests/legacy callers.
        if (!Number.isFinite(options.cutoff) && historyType == null) break;
        if (
          (historyType === 0 || historyType === 2) &&
          !requestedHistory &&
          window.require("WAWebSyncGatingUtils").isHistorySyncOnDemandEnabled()
        ) {
          // Same operation as Client.syncHistory(): request history, never a
          // visible chat message. An interrupted initial transfer (2) can also
          // receive replies; recoverPendingHistory handles its blocked queue.
          await window
            .require("WAWebSendNonMessageDataRequest")
            .sendPeerDataOperationRequest(3, { chatId: chat.id });
          requestedHistory = true;
        }
        stalledAt ??= Date.now();
        if (
          Date.now() - stalledAt >= options.historyWaitMs ||
          historyType === 4 ||
          historyType === 5
        ) {
          const texts = [...messages.values()].filter(
            (message) => message.type === "chat" && message.body?.trim(),
          );
          const oldest = texts.length ? Math.min(...texts.map((message) => message.t)) : null;
          const since =
            oldest === null
              ? ""
              : ` desde el ${new Intl.DateTimeFormat("es-AR", {
                  timeZone: "America/Argentina/Tucuman",
                  dateStyle: "short",
                }).format(new Date(oldest * 1000))}`;
          throw new Error(
            `Historial incompleto en ${chat.name ?? chat.formattedTitle}. WhatsApp solo entregó ${texts.length} mensajes de texto${since}; no se pudo completar el período solicitado después de intentar sincronizar el historial.`,
          );
        }
        await new Promise((resolve) => setTimeout(resolve, options.retryDelayMs));
      }
      return [...messages.values()]
        .sort((a, b) => a.t - b.t)
        .slice(-messageLimit)
        .map((message) => ({ body: message.body, type: message.type, timestamp: message.t }));
    },
    id,
    limit,
    { cutoff, historyWaitMs, retryDelayMs },
  );
}
