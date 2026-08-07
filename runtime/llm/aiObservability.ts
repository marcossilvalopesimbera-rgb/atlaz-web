import { AIProviderError } from "./aiErrors";

type AIRequestLogPayload = {
  timestamp: string;
  requestId?: string;
  investigationId?: string;
  provider: string;
  model: string;
  endpoint?: string;
  durationMs: number;
  retryCount: number;
  success: boolean;
  status?: number;
  providerErrorType?: string;
  providerErrorCode?: string;
  providerMessage?: string;
  category?: string;
};

const log = (level: "info" | "error", payload: AIRequestLogPayload): void => {
  const line = JSON.stringify(payload);

  if (level === "error") {
    console.error("[ATLAZ][AI][Request]", line);
    return;
  }

  console.info("[ATLAZ][AI][Request]", line);
};

export const logAIRequestSuccess = (payload: Omit<AIRequestLogPayload, "success">): void => {
  log("info", {
    ...payload,
    success: true,
  });
};

export const logAIRequestFailure = (
  payload: Omit<AIRequestLogPayload, "success" | "status" | "providerErrorType" | "providerErrorCode" | "providerMessage" | "category">,
  error: AIProviderError
): void => {
  log("error", {
    ...payload,
    success: false,
    status: error.status,
    providerErrorType: error.providerErrorType,
    providerErrorCode: error.providerErrorCode,
    providerMessage: error.providerMessage,
    category: error.category,
  });
};
