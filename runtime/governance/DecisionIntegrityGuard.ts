import {
  AdaptiveInvestigationState,
  EvidenceItem,
  HypothesisState,
  InvestigationOutput,
} from "../artifacts/AdaptiveInvestigationState";

export type DecisionIntegrityResult = InvestigationOutput["decision"];

const average = (values: number[]): number => {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, current) => sum + current, 0) / values.length;
};

const isValidationEvidence = (item: EvidenceItem, hypothesisId: string): boolean => {
  return (
    item.relatedHypothesisId === hypothesisId &&
    item.evidenceCategory === "Validation" &&
    item.provenance.kind === "ValidationArtifact" &&
    item.relation === "Support"
  );
};

const isContradictionEvidence = (item: EvidenceItem, hypothesisId: string): boolean => {
  return item.relatedHypothesisId === hypothesisId && item.evidenceCategory === "Contradictory";
};

const confidenceConsistencySignal = (items: EvidenceItem[]): number => {
  return average(items.map((item) => item.confidence * item.consistency));
};

const hasNonContextualSupport = (items: EvidenceItem[], hypothesisId: string): boolean => {
  return items.some(
    (item) =>
      item.relatedHypothesisId === hypothesisId &&
      item.relation === "Support" &&
      (item.evidenceCategory === "Correlational" ||
        item.evidenceCategory === "Experimental" ||
        item.evidenceCategory === "Validation")
  );
};

const hasApprovedPromotion = (
  state: AdaptiveInvestigationState,
  hypothesis: HypothesisState,
  targetStatus: HypothesisState["lifecycleStatus"]
): boolean => {
  const matchingEntries = state.lifecycleAuditTrail.filter(
    (entry) => entry.hypothesisId === hypothesis.id && entry.newStatus === targetStatus
  );

  if (matchingEntries.length === 0) {
    return false;
  }

  const latest = matchingEntries[matchingEntries.length - 1];
  if (latest.governanceEvaluationId.trim().length === 0) {
    return false;
  }

  const promoter = state.evidenceRegistry.items.find((item) => item.id === latest.promoterEvidenceId);
  if (!promoter) {
    return false;
  }

  if (promoter.relatedHypothesisId !== hypothesis.id) {
    return false;
  }

  if (promoter.evidenceCategory !== latest.promoterEvidenceCategory) {
    return false;
  }

  if (latest.predominantCategory !== "Validation") {
    return false;
  }

  return true;
};

export default class DecisionIntegrityGuard {
  public evaluate(state: AdaptiveInvestigationState): DecisionIntegrityResult {
    const hypotheses = [...state.hypotheses].sort((a, b) => b.confidence - a.confidence);
    const hasConfirmedHypothesis = hypotheses.some((hypothesis) => hypothesis.lifecycleStatus === "Confirmed");

    const isDecisionReady = hypotheses.some((hypothesis) => {
      if (hypothesis.lifecycleStatus !== "Confirmed") {
        return false;
      }

      if (!hasApprovedPromotion(state, hypothesis, "Confirmed")) {
        return false;
      }

      if (hypothesis.missingEvidence.length > 0) {
        return false;
      }

      const relatedEvidence = state.evidenceRegistry.items.filter((item) => item.relatedHypothesisId === hypothesis.id);
      const validationEvidence = relatedEvidence.filter((item) => isValidationEvidence(item, hypothesis.id));
      if (validationEvidence.length === 0) {
        return false;
      }

      const hasProvenance = validationEvidence.every((item) => item.provenance.source.trim().length > 0);
      if (!hasProvenance) {
        return false;
      }

      const contradictionEvidence = relatedEvidence.filter((item) => isContradictionEvidence(item, hypothesis.id));
      const supportSignal = confidenceConsistencySignal(validationEvidence);
      const contradictionSignal = confidenceConsistencySignal(contradictionEvidence);

      return supportSignal >= 0.6 && contradictionSignal < supportSignal * 0.7;
    });

    if (isDecisionReady) {
      return {
        status: "ready-for-decision",
        rationale:
          "Decisão liberada por hipótese confirmada com evidência classificada de Validation, provenance rastreável, consistência adequada e sem contradição dominante.",
      };
    }

    if (hasConfirmedHypothesis) {
      return {
        status: "insufficient-evidence",
        rationale:
          "Há hipótese em Confirmed sem os critérios arquiteturais mínimos de Validation/provenance/consistência; decisão final bloqueada.",
      };
    }

    const hasStrongCandidates = hypotheses.some(
      (hypothesis) =>
        (hypothesis.lifecycleStatus === "Supported" ||
          hypothesis.lifecycleStatus === "Validated" ||
          hypothesis.lifecycleStatus === "Confirmed") &&
        hasNonContextualSupport(state.evidenceRegistry.items, hypothesis.id)
    );

    if (hasStrongCandidates) {
      return {
        status: "investigate-further",
        rationale:
          "Há hipóteses sustentadas por evidência classificada não-contextual, porém sem critérios completos de confirmação arquitetural para decisão final.",
      };
    }

    return {
      status: "insufficient-evidence",
      rationale:
        "A investigação permanece em contexto/possibilidade; sem evidência classificada suficiente de Correlational, Experimental ou Validation para decisão.",
    };
  }
}
