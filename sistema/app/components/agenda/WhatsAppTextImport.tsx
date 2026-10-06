import { callAction } from "@agent-native/core/client/hooks";
import { useT } from "@agent-native/core/client/i18n";
import { IconLoader2 } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { WhatsAppReadState } from "../../../shared/whatsapp";

export function WhatsAppTextImport({
  onText,
  onBusy,
  targetId,
  disabled = false,
}: {
  onText: (text: string) => void;
  onBusy: (busy: boolean) => void;
  targetId: string;
  disabled?: boolean;
}) {
  const t = useT();
  const callbacks = useRef({ onText, onBusy });
  callbacks.current = { onText, onBusy };
  const mounted = useRef(false);
  const generation = useRef(0);
  const running = useRef(false);
  const jobId = useRef<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function read() {
    if (running.current || disabled) return;
    running.current = true;
    const current = ++generation.current;
    const alive = () => mounted.current && generation.current === current;
    setBusy(true);
    callbacks.current.onBusy(true);
    try {
      const { id } = (await callAction("leer-whatsapp", { operation: "start" })) as {
        id: string;
      };
      if (!alive()) {
        void callAction("leer-whatsapp", { operation: "cancel", id }).catch(() => {});
        return;
      }
      jobId.current = id;
      while (alive()) {
        const result = (await callAction("leer-whatsapp", {
          operation: "status",
          id,
        })) as WhatsAppReadState;
        if (!alive()) return;
        if (result.status === "error") {
          jobId.current = null;
          throw new Error(result.error);
        }
        if (result.status === "done") {
          jobId.current = null;
          if (result.text) callbacks.current.onText(result.text);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }
    } catch (failure) {
      if (alive()) {
        const description = failure instanceof Error ? failure.message : String(failure);
        callbacks.current.onText(
          `${t("agenda.whatsappFailed")}${description ? `: ${description}` : ""}`,
        );
      }
    } finally {
      if (alive()) {
        running.current = false;
        setBusy(false);
        callbacks.current.onBusy(false);
      }
    }
  }
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      generation.current++;
      running.current = false;
      callbacks.current.onBusy(false);
      const id = jobId.current;
      jobId.current = null;
      if (id) void callAction("leer-whatsapp", { operation: "cancel", id }).catch(() => {});
    };
  }, []);

  return (
    <Button
      type="button"
      variant="secondary"
      disabled={busy || disabled}
      aria-busy={busy}
      aria-controls={targetId}
      onClick={() => void read()}
      className="shrink-0"
    >
      {busy ? <IconLoader2 aria-hidden="true" className="size-4 animate-spin" /> : null}
      {t("agenda.whatsappFetch")}
    </Button>
  );
}
