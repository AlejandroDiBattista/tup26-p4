import { getAgentEngineEntry, normalizeModelForEngine, registerBuiltinEngines } from "@agent-native/core/agent/engine";

export const OPENAI_MODEL = "gpt-6.1-sol";
export const OPENAI_LUNA_MODEL = "gpt-6-luna";

const LEGACY_LUNA_MODEL = "gpt-5.6-luna";
const REMOVED_MODELS = [LEGACY_LUNA_MODEL, "gpt-5.6-terra", "gpt-5.6-sol"];

/** Extiende el catálogo de esta app sin modificar el paquete del framework. */
export function configureOpenAIModel() {
  registerBuiltinEngines();
  const entry = getAgentEngineEntry("ai-sdk:openai");
  if (!entry) throw new Error("El conector OpenAI no está disponible.");
  if (
    entry.defaultModel === OPENAI_MODEL &&
    entry.supportedModels.includes(OPENAI_MODEL) &&
    entry.supportedModels.includes(OPENAI_LUNA_MODEL) &&
    !entry.supportedModels.some((model) => REMOVED_MODELS.includes(model))
  ) return;

  const create = entry.create;
  entry.defaultModel = OPENAI_MODEL;
  entry.supportedModels = [
    OPENAI_MODEL,
    OPENAI_LUNA_MODEL,
    ...entry.supportedModels.filter((model) =>
      model !== OPENAI_MODEL && model !== OPENAI_LUNA_MODEL && !REMOVED_MODELS.includes(model)),
  ];
  entry.create = (config) => {
    // El registro alimenta el selector; la instancia tiene su propio catálogo.
    // Ambos deben admitir los IDs para conservar el modelo seleccionado.
    const model = typeof config.model === "string" && REMOVED_MODELS.includes(config.model)
      ? normalizeModelForEngine(entry, config.model)
      : config.model ?? OPENAI_MODEL;
    const engine = create({ ...config, model });
    Object.defineProperty(engine, "supportedModels", { value: entry.supportedModels, configurable: true });
    return engine;
  };
}
