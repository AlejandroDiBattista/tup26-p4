import { useActionMutation } from "@agent-native/core/client/hooks";
import { useT } from "@agent-native/core/client/i18n";
import { IconX } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { parseApprovalCodes, previewApprovalCodes } from "../../../shared/approval-codes";
import type { LoadApprovalCodesResult } from "../../../server/agenda/cargar-codigos-aprobacion";

export function ApprovalCodesForm({
  assessmentId,
  title,
  roster,
  onClose,
}: {
  assessmentId: string;
  title: string;
  roster: Array<{ legajo: string; score: number | null }>;
  onClose: () => void;
}) {
  const t = useT();
  const [text, setText] = useState("");
  const [result, setResult] = useState<LoadApprovalCodesResult | null>(null);
  const [error, setError] = useState("");
  const loadCodes = useActionMutation("cargar-codigos-aprobacion");
  const parsed = useMemo(() => parseApprovalCodes(text), [text]);
  const preview = useMemo(
    () => previewApprovalCodes(parsed.entries, roster),
    [parsed.entries, roster],
  );
  const results = result?.results ?? preview;
  const invalid = result?.invalid ?? parsed.invalid;
  const plannedCount = preview.filter((row) => row.status === "planned").length;

  function resultMessage(loaded: LoadApprovalCodesResult) {
    return t("agenda.approvalCodesLoaded", {
      updated: loaded.updated,
      unchanged: loaded.unchanged,
      unknown: loaded.unknown,
      invalid: loaded.invalid.length,
      failed: loaded.failed,
    });
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (loadCodes.isPending) return;
    setError("");
    setResult(null);
    loadCodes.mutate(
      { assessmentId, text },
      {
        onSuccess: (value) => {
          const loaded = value as LoadApprovalCodesResult;
          setResult(loaded);
          if (loaded.failed || loaded.unknown || loaded.invalid.length)
            toast.warning(resultMessage(loaded));
          else toast.success(resultMessage(loaded));
        },
        onError: (failure) => setError(failure.message),
      },
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 grid gap-4 border-y border-border bg-muted/25 py-4"
    >
      <div className="grid gap-1.5">
        <Label htmlFor="approval-codes-text">
          {t("agenda.loadApprovalCodes")}: {title}
        </Label>
        <textarea
          id="approval-codes-text"
          name="text"
          rows={5}
          required
          maxLength={100_000}
          value={text}
          disabled={loadCodes.isPending}
          onChange={(event) => {
            setText(event.target.value);
            setResult(null);
            setError("");
          }}
          placeholder={t("agenda.approvalCodesPlaceholder")}
          aria-describedby="approval-codes-hint"
          autoFocus
          className="min-h-28 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        />
        <p id="approval-codes-hint" className="text-xs text-muted-foreground">
          {t("agenda.approvalCodesHint")}
        </p>
      </div>
      <p role="status" className="text-sm text-muted-foreground">
        {result
          ? resultMessage(result)
          : t("agenda.approvalCodesPreview", {
              detected: parsed.entries.length,
              count: plannedCount,
            })}
        {parsed.duplicates > 0
          ? ` ${t("agenda.approvalCodesDuplicates", { count: parsed.duplicates })}`
          : ""}
      </p>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {invalid.length > 0 ? (
        <ul className="list-inside list-disc text-sm text-amber-700 dark:text-amber-300">
          {invalid.map((entry, index) => (
            <li key={`${index}:${entry.code}`} className="break-all">
              {entry.code}:{" "}
              {t(entry.reason === "score" ? "agenda.invalidScore" : "agenda.invalidApprovalCode")}
            </li>
          ))}
        </ul>
      ) : null}
      {results.length > 0 ? (
        <div className="max-h-80 overflow-auto border-y border-border">
          <table className="w-full text-sm">
            <caption className="sr-only">{t("agenda.approvalCodesPreviewCaption")}</caption>
            <thead className="bg-muted/45 text-left">
              <tr>
                <th scope="col" className="px-3 py-2">
                  {t("agenda.legajo")}
                </th>
                <th scope="col" className="px-3 py-2">
                  {t("agenda.approvalCodesCurrentScore")}
                </th>
                <th scope="col" className="px-3 py-2">
                  {t("agenda.approvalCodesDecodedScore")}
                </th>
                <th scope="col" className="px-3 py-2">
                  {t("agenda.approvalCodesResult")}
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((row) => (
                <tr key={row.legajo} className="border-t border-border">
                  <th scope="row" className="px-3 py-2 text-left font-mono font-normal">
                    {row.legajo}
                  </th>
                  <td className="px-3 py-2 tabular-nums">{row.previousScore ?? "—"}</td>
                  <td className="px-3 py-2 tabular-nums">{row.score}</td>
                  <td className="px-3 py-2">
                    {t(`agenda.approvalCodeStatus_${row.status}`)}
                    {"savedScore" in row && row.savedScore !== undefined
                      ? ` · ${t("agenda.grade")}: ${row.savedScore}`
                      : ""}
                    {"error" in row && row.error ? (
                      <p className="text-destructive">{row.error}</p>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <div className="flex items-center justify-end gap-2">
        <Button type="submit" disabled={loadCodes.isPending}>
          {t(loadCodes.isPending ? "agenda.loadingApprovalCodes" : "agenda.applyApprovalCodes")}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={onClose}
          disabled={loadCodes.isPending}
          aria-label={t("agenda.cancel")}
          title={t("agenda.cancel")}
        >
          <IconX aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
}
