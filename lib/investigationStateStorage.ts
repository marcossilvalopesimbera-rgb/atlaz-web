import { AdaptiveInvestigationState } from "@/runtime/artifacts/AdaptiveInvestigationState";
import { AdaptiveInvestigationStateSchema } from "@/runtime/schemas/AdaptiveInvestigationStateSchema";

export const INVESTIGATION_STATE_STORAGE_KEY = "atlaz.runtime.adaptiveInvestigationState";

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
  } catch {
    return null;
  }
};

export const writeInvestigationState = (state: AdaptiveInvestigationState): void => {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(INVESTIGATION_STATE_STORAGE_KEY, JSON.stringify(state));
};
