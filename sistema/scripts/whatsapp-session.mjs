export async function runWhatsappSession(client, input, notify, deadlineMs = 170000) {
  let closing;
  async function close() {
    if (closing) return closing;
    closing = (async () => {
      const browser = client.pupBrowser;
      const pid = browser?.process()?.pid;
      let closeTimer;
      try {
        await Promise.race([
          client.destroy(),
          new Promise((_, reject) => {
            closeTimer = setTimeout(() => reject(new Error("close timeout")), 5000);
          }),
        ]);
      } catch {
        if (pid) {
          try {
            process.kill(pid, "SIGKILL");
          } catch {}
        }
      } finally {
        clearTimeout(closeTimer);
      }
    })();
    return closing;
  }
  const terminate = () => {
    void close().finally(() => process.exit(1));
  };
  process.once("SIGTERM", terminate);
  process.once("disconnect", terminate);
  let rejectReady;
  const ready = new Promise((accept, reject) => {
    rejectReady = reject;
    client.once("ready", accept);
    client.on("qr", () => {
      if (input.visible) notify({ status: "qr" });
      else
        reject(
          Object.assign(new Error("Hace falta vincular WhatsApp."), {
            code: "WHATSAPP_AUTH_REQUIRED",
          }),
        );
    });
    client.once("auth_failure", () =>
      reject(new Error("No se pudo vincular WhatsApp. Volvé a intentar.")),
    );
    client.once("disconnected", () =>
      reject(new Error("WhatsApp se desconectó. Volvé a intentar.")),
    );
  });
  // Avoid an unhandled rejection while initialize is still running.
  ready.catch(() => {});
  let timer;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(
      () =>
        reject(
          new Error("Se agotó el tiempo de conexión. Volvé a intentar y escaneá el QR si aparece."),
        ),
      deadlineMs,
    );
  });
  let output;
  let stage = "conectar con WhatsApp";
  try {
    output = await Promise.race([
      deadline,
      (async () => {
        void client.initialize().catch(rejectReady);
        await ready;
        notify({ status: "reading" });
        stage = "listar los grupos de WhatsApp";
        const chats = (await client.getChats()).filter((chat) => chat.isGroup);
        const names = ["TUP26-P4-C1👨🏻‍💻", "TUP26-P4-C3👨🏻‍💻"];
        const normalize = (name) => name.normalize("NFC").replace(/\uFE0F/g, "");
        const selected = names.map((name) => {
          const matches = chats.filter((chat) => normalize(chat.name) === normalize(name));
          if (matches.length !== 1)
            throw new Error(
              matches.length
                ? `Hay más de un grupo llamado ${name}. No se puede elegir de forma segura.`
                : `No se encontró el grupo ${name} en esta cuenta de WhatsApp.`,
            );
          return matches[0];
        });
        const cutoff = Date.now() / 1000 - input.config.days * 86400;
        const warnings = [
          "WhatsApp puede entregar un historial parcial. Revisá las fechas y los alumnos antes de guardar.",
        ];
        const rows = [];
        for (const chat of selected) {
          stage = `leer los mensajes de ${chat.name}`;
          let messages = [];
          for (const limit of [250, 500, 1000, 2000]) {
            messages = await chat.fetchMessages({ limit, cutoff });
            if (
              messages.length < limit ||
              messages.some((message) => message.type === "chat" && message.timestamp < cutoff)
            )
              break;
            if (limit === 2000)
              throw new Error(
                `Se alcanzó el límite de 2000 mensajes en ${chat.name} sin cubrir los últimos ${input.config.days} días. La lectura está incompleta.`,
              );
          }
          for (const message of messages) {
            if (message.timestamp >= cutoff && message.body?.trim() && message.type === "chat") {
              rows.push({ body: message.body, timestamp: message.timestamp });
            }
          }
        }
        rows.sort((a, b) => a.timestamp - b.timestamp);
        const format = new Intl.DateTimeFormat("es-AR", {
          timeZone: "America/Argentina/Tucuman",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
        });
        const text = rows
          .map((row) => {
            const parts = Object.fromEntries(
              format
                .formatToParts(new Date(row.timestamp * 1000))
                .map((part) => [part.type, part.value]),
            );
            const prefix = `[${parts.day}/${parts.month}/${parts.year}, ${parts.hour}:${parts.minute}] WhatsApp: `;
            // Each physical line carries its date for the existing attendance parser.
            return row.body
              .split(/\r?\n/)
              .map((line) => prefix + line)
              .join("\n");
          })
          .join("\n");
        if (text.length > 100000)
          throw new Error(
            "El texto de los últimos 14 días supera el límite de 100000 caracteres del formulario.",
          );
        return { status: "done", text, count: rows.length, warnings };
      })(),
    ]);
  } catch (error) {
    output = {
      status: error?.code === "WHATSAPP_AUTH_REQUIRED" ? "auth-required" : "error",
      error:
        error?.code === "WHATSAPP_AUTH_REQUIRED"
          ? error.message
          : `No se pudo ${stage}: ${error instanceof Error ? error.message : String(error)}`,
    };
  } finally {
    clearTimeout(timer);
    await close();
    process.removeListener("SIGTERM", terminate);
    process.removeListener("disconnect", terminate);
  }
  return output;
}

export async function readWhatsapp(createClient, input, notify) {
  let output = await runWhatsappSession(createClient(false), { ...input, visible: false }, notify);
  if (output.status === "auth-required") {
    output = await runWhatsappSession(createClient(true), { ...input, visible: true }, notify);
  }
  return output;
}
