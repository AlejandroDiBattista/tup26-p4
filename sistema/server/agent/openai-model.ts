import { getAgentEngineEntry, registerBuiltinEngines } from "@agent-native/core/agent/engine";

export const OPENAI_MODEL = "gpt-6.1-sol";

/** Extiende el catálogo de esta app sin modificar el paquete del framework. */
export function configureOpenAIModel() {
  registerBuiltinEngines();
  const entry = getAgentEngineEntry("ai-sdk:openai");
  if (!entry) throw new Error("El conector OpenAI no está disponible.");
  if (entry.defaultModel === OPENAI_MODEL && entry.supportedModels.includes(OPENAI_MODEL)) return;

  const create = entry.create;
  entry.defaultModel = OPENAI_MODEL;
  entry.supportedModels = [OPENAI_MODEL, ...entry.supportedModels.filter((model) => model !== OPENAI_MODEL)];
  entry.create = (config) => {
    // El registro alimenta el selector; la instancia tiene su propio catálogo.
    // Ambos deben admitir el ID para evitar una sustitución silenciosa por 5.6.
    const engine = create({ ...config, model: OPENAI_MODEL });
    Object.defineProperty(engine, "supportedModels", { value: entry.supportedModels, configurable: true });
    return engine;
  };
}
