export interface ModelCapabilities {
  supportsTemperature: boolean;
  supportsStructuredOutput: boolean;
  supportsReasoning: boolean;
  supportsStreaming: boolean;
  supportsJsonSchema: boolean;
}

const DEFAULT_CAPABILITIES: ModelCapabilities = {
  supportsTemperature: false,
  supportsStructuredOutput: false,
  supportsReasoning: false,
  supportsStreaming: false,
  supportsJsonSchema: false,
};

const CAPABILITY_RULES: Array<{
  match: (model: string) => boolean;
  capabilities: ModelCapabilities;
}> = [
  {
    match: (model) => model === "gpt-5.5",
    capabilities: {
      supportsTemperature: false,
      supportsStructuredOutput: true,
      supportsReasoning: true,
      supportsStreaming: true,
      supportsJsonSchema: true,
    },
  },
  {
    match: (model) => /^gpt-5(\b|[-.])/i.test(model),
    capabilities: {
      supportsTemperature: false,
      supportsStructuredOutput: true,
      supportsReasoning: true,
      supportsStreaming: true,
      supportsJsonSchema: true,
    },
  },
  {
    match: (model) => /^gpt-4\.1(\b|[-.])/i.test(model),
    capabilities: {
      supportsTemperature: true,
      supportsStructuredOutput: true,
      supportsReasoning: true,
      supportsStreaming: true,
      supportsJsonSchema: true,
    },
  },
  {
    match: (model) => /^gpt-4o(\b|[-.])/i.test(model),
    capabilities: {
      supportsTemperature: true,
      supportsStructuredOutput: true,
      supportsReasoning: true,
      supportsStreaming: true,
      supportsJsonSchema: true,
    },
  },
];

export const resolveModelCapabilities = (modelName: string): ModelCapabilities => {
  const normalizedModel = modelName.trim().toLowerCase();
  const matchedRule = CAPABILITY_RULES.find((rule) => rule.match(normalizedModel));

  if (!matchedRule) {
    return DEFAULT_CAPABILITIES;
  }

  return matchedRule.capabilities;
};
