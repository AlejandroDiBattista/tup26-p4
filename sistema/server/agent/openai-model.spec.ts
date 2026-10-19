import { expect, it } from "vitest";
import { getAgentEngineEntry, normalizeModelForEngine } from "@agent-native/core/agent/engine";
import { configureOpenAIModel, OPENAI_LUNA_MODEL, OPENAI_MODEL } from "./openai-model";

it("mantiene GPT-6.1 Sol en el selector y en el modelo que ejecuta el agente", () => {
  configureOpenAIModel();
  const entry = getAgentEngineEntry("ai-sdk:openai")!;
  expect(entry.defaultModel).toBe(OPENAI_MODEL);
  expect(normalizeModelForEngine(entry, OPENAI_MODEL)).toBe(OPENAI_MODEL);
  const engine = entry.create({ allowEnvFallback: false });
  expect(engine.name).toBe("ai-sdk:openai");
  expect(engine.defaultModel).toBe(OPENAI_MODEL);
  expect(normalizeModelForEngine(engine, OPENAI_MODEL)).toBe(OPENAI_MODEL);
  // Una selección guardada de Luna anterior pasa a la versión actual.
  expect(entry.supportedModels).toContain(OPENAI_LUNA_MODEL);
  expect(entry.supportedModels).not.toContain("gpt-5.6-luna");
  expect(normalizeModelForEngine(entry, "gpt-5.6-luna")).toBe(OPENAI_LUNA_MODEL);
  expect(normalizeModelForEngine(engine, "gpt-5.6-luna")).toBe(OPENAI_LUNA_MODEL);
  const create = entry.create;
  configureOpenAIModel();
  expect(entry.create).toBe(create);
});

it("ejecuta GPT-6 Luna cuando se elige Luna y conserva las otras selecciones", () => {
  configureOpenAIModel();
  const entry = getAgentEngineEntry("ai-sdk:openai")!;
  for (const selected of [OPENAI_LUNA_MODEL, "gpt-5.6-luna"]) {
    const engine = entry.create({ allowEnvFallback: false, model: selected });
    expect(engine.defaultModel).toBe(OPENAI_LUNA_MODEL);
    expect(normalizeModelForEngine(engine, selected)).toBe(OPENAI_LUNA_MODEL);
    expect(engine.supportedModels).toContain(OPENAI_LUNA_MODEL);
    expect(engine.supportedModels).not.toContain("gpt-5.6-luna");
  }
  expect(entry.create({ allowEnvFallback: false, model: OPENAI_MODEL }).defaultModel)
    .toBe(OPENAI_MODEL);
});

it("excluye GPT-5.6 Terra y Sol y resuelve sus selecciones guardadas al modelo vigente", () => {
  configureOpenAIModel();
  const entry = getAgentEngineEntry("ai-sdk:openai")!;
  for (const removed of ["gpt-5.6-terra", "gpt-5.6-sol"]) {
    expect(entry.supportedModels).not.toContain(removed);
    expect(normalizeModelForEngine(entry, removed)).toBe(OPENAI_MODEL);
    const engine = entry.create({ allowEnvFallback: false, model: removed });
    expect(engine.defaultModel).toBe(OPENAI_MODEL);
    expect(engine.supportedModels).not.toContain(removed);
    expect(normalizeModelForEngine(engine, removed)).toBe(OPENAI_MODEL);
  }
  expect(entry.supportedModels).toContain(OPENAI_MODEL);
  expect(entry.supportedModels).toContain(OPENAI_LUNA_MODEL);
});
