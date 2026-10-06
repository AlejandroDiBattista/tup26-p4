import { defineNitroPlugin } from "@agent-native/core";
import { registerRequiredSecret } from "@agent-native/core/secrets";

export default defineNitroPlugin(() => {
  registerRequiredSecret({
    key: "GITHUB_TOKEN",
    label: "GitHub — trabajos prácticos",
    description:
      "Token limitado al repositorio de la materia con permisos de lectura y escritura de Pull requests y Contents. Se usa para normalizar títulos e incorporar entregas mediante Bajar TP.",
    docsUrl:
      "https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens",
    scope: "user",
    kind: "api-key",
    required: false,
  });
});
