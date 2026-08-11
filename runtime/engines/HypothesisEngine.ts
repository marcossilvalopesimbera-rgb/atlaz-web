import { HypothesisSet } from "../artifacts/HypothesisSet";
import { AdaptiveInvestigationState } from "../artifacts/AdaptiveInvestigationState";

export default class HypothesisEngine {
  constructor() {}

  public generate(state?: AdaptiveInvestigationState): HypothesisSet {
    const hypotheses = (state?.hypotheses ?? []).map((hypothesis) => ({
      id: hypothesis.id,
      statement: hypothesis.description,
      rationale: hypothesis.reasoningSummary,
      confidence: hypothesis.confidence,
    }));

    return {
      artifact: "HypothesisSet",
      version: "1.1.0",
      operationalObjectId: state?.investigationId ?? "unavailable",
      hypotheses,
      confidence:
        hypotheses.length > 0
          ? Math.max(...hypotheses.map((hypothesis) => hypothesis.confidence))
          : 0,
    };
  }
}