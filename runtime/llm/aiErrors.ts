export type AIErrorCategory =
  | "AI_TIMEOUT"
  | "AI_RATE_LIMIT"
  | "AI_CONFIGURATION"
  | "AI_PROVIDER_ERROR"
  | "AI_SCHEMA_ERROR"
  | "AI_INVALID_RESPONSE"
  | "AI_UNKNOWN";

export interface AIErrorMetadata {
  category: AIErrorCategory;
  provider: string;
  model: string;
  requestId?: string;
  endpoint?: string;
  status?: number;
  providerErrorType?: string;
  providerErrorCode?: string;
  providerMessage: string;
  cause?: unknown;
}

export class AIProviderError extends Error {
  public readonly category: AIErrorCategory;
  public readonly provider: string;
  public readonly model: string;
  public readonly requestId?: string;
  public readonly endpoint?: string;
  public readonly status?: number;
  public readonly providerErrorType?: string;
  public readonly providerErrorCode?: string;
  public readonly providerMessage: string;
  public readonly cause?: unknown;

  constructor(metadata: AIErrorMetadata) {
    super(metadata.providerMessage);
    this.name = "AIProviderError";
    this.category = metadata.category;
    this.provider = metadata.provider;
    this.model = metadata.model;
    this.requestId = metadata.requestId;
    this.endpoint = metadata.endpoint;
    this.status = metadata.status;
    this.providerErrorType = metadata.providerErrorType;
    this.providerErrorCode = metadata.providerErrorCode;
    this.providerMessage = metadata.providerMessage;
    this.cause = metadata.cause;
  }
}

const getString = (value: unknown): string | undefined => {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
};

const getNumber = (value: unknown): number | undefined => {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
};

export const toAIProviderError = (
  error: unknown,
  context: {
    provider: string;
    model: string;
    requestId?: string;
    endpoint?: string;
  }
): AIProviderError => {
  if (error instanceof AIProviderError) {
    return error;
  }

  const errorLike = error as {
    name?: unknown;
    message?: unknown;
    status?: unknown;
    code?: unknown;
    type?: unknown;
    error?: {
      type?: unknown;
      code?: unknown;
      message?: unknown;
    };
    request_id?: unknown;
  };

  const status = getNumber(errorLike?.status);
  const providerErrorType =
    getString(errorLike?.type) ?? getString(errorLike?.error?.type);
  const providerErrorCode =
    getString(errorLike?.code) ?? getString(errorLike?.error?.code);
  const providerMessage =
    getString(errorLike?.error?.message) ??
    getString(errorLike?.message) ??
    "Unknown provider error";
  const upstreamRequestId = getString(errorLike?.request_id);

  let category: AIErrorCategory = "AI_PROVIDER_ERROR";

  if (errorLike?.name === "AbortError") {
    category = "AI_TIMEOUT";
  } else if (status === 429 || providerErrorCode === "rate_limit_exceeded") {
    category = "AI_RATE_LIMIT";
  } else if (status === 400 || status === 401 || status === 403 || status === 404) {
    category = "AI_CONFIGURATION";
  }

  return new AIProviderError({
    category,
    provider: context.provider,
    model: context.model,
    requestId: context.requestId ?? upstreamRequestId,
    endpoint: context.endpoint,
    status,
    providerErrorType,
    providerErrorCode,
    providerMessage,
    cause: error,
  });
};
