import { expect, it } from "vitest";
import { getAgentEngineEntry, normalizeModelForEngine } from "@agent-native/core/agent/engine";
import { configureOpenAIModel, OPENAI_MODEL } from "./openai-model";

it("mantiene GPT-6.1 Sol en el selector y en el modelo que ejecuta el agente", () => {
  configureOpenAIModel();
  const entry = getAgentEngineEntry("ai-sdk:openai")!;
  expect(entry.defaultModel).toBe(OPENAI_MODEL);
  expect(normalizeModelForEngine(entry, OPENAI_MODEL)).toBe(OPENAI_MODEL);
  const engine = entry.create({ allowEnvFallback: false });
  expect(engine.name).toBe("ai-sdk:openai");
  expect(engine.defaultModel).toBe(OPENAI_MODEL);
  expect(normalizeModelForEngine(engine, OPENAI_MODEL)).toBe(OPENAI_MODEL);
  // Las selecciones explícitas de modelos anteriores siguen siendo válidas.
  expect(normalizeModelForEngine(engine, "gpt-5.6-luna")).toBe("gpt-5.6-luna");
  const create = entry.create;
  configureOpenAIModel();
  expect(entry.create).toBe(create);
});
