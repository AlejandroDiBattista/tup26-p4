import {
  parseApprovalCodes,
  previewApprovalCodes,
  type ApprovalCodePreview,
} from "../../shared/approval-codes.js";
import { UserInputError } from "../errors.js";
import { assessmentGrid, getAssessment, raiseAssessmentScore } from "./store.js";

export interface ApprovalCodeResult extends Omit<ApprovalCodePreview, "status"> {
  status: ApprovalCodePreview["status"] | "updated" | "failed";
  savedScore?: number;
  error?: string;
}

export async function cargarCodigosAprobacion(
  ownerEmail: string,
  assessmentId: string,
  text: string,
  dryRun = false,
) {
  const assessment = await getAssessment(ownerEmail, assessmentId);
  if (!assessment.graded)
    throw new UserInputError(
      "Seleccioná un trabajo que lleve nota para cargar códigos de aprobación.",
    );
  const parsed = parseApprovalCodes(text);
  if (!parsed.entries.length && !parsed.invalid.length) {
    throw new UserInputError("No se encontraron códigos con formato legajo.XX.respuestas.VV.");
  }
  if (parsed.entries.length + parsed.duplicates + parsed.invalid.length > 500) {
    throw new UserInputError("Pegá como máximo 500 códigos por carga.");
  }
  const grid = await assessmentGrid(ownerEmail);
  const preview = previewApprovalCodes(
    parsed.entries,
    grid.rows.map((row) => ({
      legajo: row.legajo,
      score: row.cells.find((cell) => cell.assessmentId === assessmentId)?.score ?? null,
    })),
  );
  const results: ApprovalCodeResult[] = [];
  for (const entry of preview) {
    if (dryRun || entry.status === "unknown") {
      results.push(entry);
      continue;
    }
    try {
      const saved = await raiseAssessmentScore(ownerEmail, {
        assessmentId,
        legajo: entry.legajo,
        score: entry.score,
      });
      results.push({
        ...entry,
        status: saved.updated ? "updated" : "unchanged",
        savedScore: saved.score,
      });
    } catch (error) {
      results.push({
        ...entry,
        status: "failed",
        error: error instanceof Error ? error.message : "No se pudo guardar la nota.",
      });
    }
  }

  return {
    assessmentId,
    dryRun,
    detected: parsed.entries.length,
    duplicates: parsed.duplicates,
    invalid: parsed.invalid,
    updated: results.filter((row) => row.status === "updated").length,
    unchanged: results.filter((row) => row.status === "unchanged").length,
    unknown: results.filter((row) => row.status === "unknown").length,
    failed: results.filter((row) => row.status === "failed").length,
    results,
  };
}

export type LoadApprovalCodesResult = Awaited<ReturnType<typeof cargarCodigosAprobacion>>;
