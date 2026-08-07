import { resolveModelCapabilities } from "./aiCapabilities";
import { AIProviderError } from "./aiErrors";

const parseTemperatureSetting = (value: string | undefined): number | undefined => {
  if (value === undefined) {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error("OPENAI_TEMPERATURE must be a finite number when provided");
  }

  return parsed;
};

export const getConfiguredOpenAITemperature = (): number | undefined => {
  return parseTemperatureSetting(process.env.OPENAI_TEMPERATURE);
};

export const validateOpenAIConfiguration = (model: string): void => {
  const capabilities = resolveModelCapabilities(model);
  const configuredTemperature = getConfiguredOpenAITemperature();

  if (configuredTemperature !== undefined && !capabilities.supportsTemperature) {
    throw new AIProviderError({
      category: "AI_CONFIGURATION",
      provider: "openai",
      model,
      providerMessage: `Model ${model} does not support parameter 'temperature', but OPENAI_TEMPERATURE is configured.`,
      status: 400,
      providerErrorType: "invalid_configuration",
      providerErrorCode: "temperature_not_supported",
    });
  }
};
