import { DecisionPackage } from "../artifacts/DecisionPackage";
import { AdaptiveInvestigationState } from "../artifacts/AdaptiveInvestigationState";
import DecisionIntegrityGuard from "../governance/DecisionIntegrityGuard";
import { Impact } from "../types/Impact";
import { Severity } from "../types/Severity";
import { Urgency } from "../types/Urgency";

const decisionIntegrityGuard = new DecisionIntegrityGuard();

export default class DecisionEngine {
  constructor() {}

  public decide(state?: AdaptiveInvestigationState): DecisionPackage {
    const hypotheses = [...(state?.hypotheses ?? [])].sort((a, b) => b.confidence - a.confidence);
    const decisionStatus = state ? decisionIntegrityGuard.evaluate(state).status : "insufficient-evidence";

    const options = hypotheses.slice(0, 3).map((hypothesis, index) => ({
      id: `option-${index + 1}`,
      title: `Direção baseada em ${hypothesis.lifecycleStatus}`,
      description: hypothesis.nextRecommendedInvestigation,
      expectedSeverity: state?.operationalObject.severity ?? Severity.Medium,
      expectedUrgency: state?.operationalObject.urgency ?? Urgency.Medium,
      expectedImpact: state?.operationalObject.impact ?? Impact.Medium,
    }));

    const recommended =
      decisionStatus === "ready-for-decision"
        ? options.find((_, index) => hypotheses[index]?.lifecycleStatus === "Confirmed") ?? options[0]
        : options[0];

    return {
      artifact: "DecisionPackage",
      version: "1.1.0",
      operationalObjectId: state?.investigationId ?? "unavailable",
      options,
      recommendedOptionId: recommended?.id ?? "option-1",
      confidence: hypotheses[0]?.confidence ?? 0,
    };
  }
}