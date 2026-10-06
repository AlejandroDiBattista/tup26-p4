export interface ApprovalCodeEntry {
  legajo: string;
  score: number;
}

export interface InvalidApprovalCode {
  code: string;
  legajo: string;
  reason: "format" | "score";
}

/** Reconoce las cuatro partes y extrae legajo/nota; no recalcula la verificación. */
export function parseApprovalCodes(text: string) {
  const entries = new Map<string, ApprovalCodeEntry>();
  const invalid: InvalidApprovalCode[] = [];
  let duplicates = 0;

  for (const candidate of text.matchAll(/(?<![\p{L}\p{N}_.])\d+\.[^\s()[\]{}<>"',;:!?]+/gu)) {
    const code = candidate[0].replace(/\.$/, "");
    const legajo = code.split(".")[0];
    const match = code.match(/^(\d{5})\.(\d{2})\.([0-9a-v]+)\.(\d{2})$/i);
    if (!match) {
      invalid.push({ code, legajo, reason: "format" });
      continue;
    }

    const decoded = (Number(match[2]) % 20) / 2;
    const score = decoded === 0 ? 10 : decoded;
    if (score < 1 || score > 10) {
      invalid.push({ code, legajo, reason: "score" });
      continue;
    }

    const existing = entries.get(legajo);
    if (existing) duplicates += 1;
    if (!existing || score > existing.score) entries.set(legajo, { legajo, score });
  }

  return { entries: [...entries.values()], invalid, duplicates };
}

export interface ApprovalCodePreview extends ApprovalCodeEntry {
  previousScore: number | null;
  status: "planned" | "unchanged" | "unknown";
}

export function previewApprovalCodes(
  entries: ApprovalCodeEntry[],
  roster: Array<{ legajo: string; score: number | null }>,
): ApprovalCodePreview[] {
  const scores = new Map(roster.map((row) => [row.legajo, row.score]));
  return entries.map((entry) => {
    const previousScore = scores.get(entry.legajo) ?? null;
    return {
      ...entry,
      previousScore,
      status: !scores.has(entry.legajo)
        ? "unknown"
        : previousScore === null || entry.score > previousScore
          ? "planned"
          : "unchanged",
    };
  });
}
