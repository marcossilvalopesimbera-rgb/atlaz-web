import { AdaptiveInvestigationState } from "@/runtime/artifacts/AdaptiveInvestigationState";
import { AdaptiveInvestigationStateSchema } from "@/runtime/schemas/AdaptiveInvestigationStateSchema";

export const INVESTIGATION_STATE_STORAGE_KEY = "atlaz.runtime.adaptiveInvestigationState";
export const RUNTIME_SESSION_STORAGE_KEY = "atlaz.runtime.sessionId";

const createId = (): string => {
  if (typeof globalThis.crypto !== 'undefined' && 'randomUUID' in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }

  return `atlaz-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
};

export const readOrCreateRuntimeSessionId = (): string => {
  if (typeof window === "undefined") {
    return `session-${createId()}`;
  }

  const existing = sessionStorage.getItem(RUNTIME_SESSION_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const created = `session-${createId()}`;
  sessionStorage.setItem(RUNTIME_SESSION_STORAGE_KEY, created);
  return created;
};

export const createRuntimeRequestId = (): string => `req-${createId()}`;

export const readInvestigationState = (): AdaptiveInvestigationState | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = sessionStorage.getItem(INVESTIGATION_STATE_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return AdaptiveInvestigationStateSchema.parse(parsed);
  } catch (error) {
    const sessionId = readOrCreateRuntimeSessionId();
    const requestId = createRuntimeRequestId();

    console.error(
      "[ATLAZ][Runtime][StateReadFailure]",
      JSON.stringify({
        timestamp: new Date().toISOString(),
        sessionId,
        requestId,
        result: "error",
        interruptionReason: "StateRejectedByParser",
        key: INVESTIGATION_STATE_STORAGE_KEY,
        errorMessage: error instanceof Error ? error.message : "Unknown read error",
      })
    );

    sessionStorage.removeItem(INVESTIGATION_STATE_STORAGE_KEY);
    return null;
  }
};

export const writeInvestigationState = (state: AdaptiveInvestigationState): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.setItem(INVESTIGATION_STATE_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    const sessionId = readOrCreateRuntimeSessionId();
    const requestId = createRuntimeRequestId();

    console.error(
      "[ATLAZ][Runtime][StateWriteFailure]",
      JSON.stringify({
        timestamp: new Date().toISOString(),
        sessionId,
        requestId,
        result: "error",
        interruptionReason: "StatePersistenceFailure",
        key: INVESTIGATION_STATE_STORAGE_KEY,
        runtimeId: state.investigationId,
        errorMessage: error instanceof Error ? error.message : "Unknown write error",
      })
    );
  }
};
