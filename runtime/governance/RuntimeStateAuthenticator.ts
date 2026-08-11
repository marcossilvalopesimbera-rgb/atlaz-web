import {
  AdaptiveInvestigationState,
  EvidenceCategory,
  EvidenceItem,
  HypothesisLifecycleStatus,
  HypothesisState,
  LifecyclePromotionAuditEntry,
} from "../artifacts/AdaptiveInvestigationState";
import EvidenceClassificationFramework from "../ecf/EvidenceClassificationFramework";

const lifecycleOrder: readonly HypothesisLifecycleStatus[] = [
  "Draft",
  "Candidate",
  "Plausible",
  "Supported",
  "Validated",
  "Confirmed",
  "Rejected",
];

const ecf = new EvidenceClassificationFramework();

const toIndex = (status: HypothesisLifecycleStatus): number => lifecycleOrder.indexOf(status);

const weightedCategoryRanking = (items: EvidenceItem[]): Array<[EvidenceCategory, number]> => {
  const map = new Map<EvidenceCategory, number>();

  for (const item of items) {
    const quality = item.confidence * item.consistency;
    map.set(item.evidenceCategory, (map.get(item.evidenceCategory) ?? 0) + item.weight * quality);
  }

  return [...map.entries()].sort((a, b) => b[1] - a[1]);
};

const isAdjacentTransition = (
  from: HypothesisLifecycleStatus,
  to: HypothesisLifecycleStatus
): boolean => {
  if (to === "Rejected") {
    return true;
  }

  const fromIndex = toIndex(from);
  const toIndexValue = toIndex(to);
  return toIndexValue === fromIndex + 1;
};

const isValidationSupport = (item: EvidenceItem, hypothesisId: string): boolean => {
  return (
    item.relatedHypothesisId === hypothesisId &&
    item.evidenceCategory === "Validation" &&
    item.relation === "Support" &&
    item.provenance.kind === "ValidationArtifact"
  );
};

const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
};

const findPromotionEntry = (
  entries: LifecyclePromotionAuditEntry[],
  hypothesisId: string,
  status: HypothesisLifecycleStatus
): LifecyclePromotionAuditEntry | undefined => {
  return [...entries]
    .reverse()
    .find((entry) => entry.hypothesisId === hypothesisId && entry.newStatus === status);
};

const validateEvidenceProvenanceConsistency = (evidence: EvidenceItem[]): void => {
  for (const item of evidence) {
    const classified = ecf.classify(item.provenance);

    assert(
      classified.evidenceCategory === item.evidenceCategory,
      `Evidence category/provenance mismatch for evidence ${item.id}.`
    );

    assert(
      classified.evidenceType === item.evidenceType,
      `Evidence type/provenance mismatch for evidence ${item.id}.`
    );
  }
};

const validateAuditTrailEntries = (
  state: AdaptiveInvestigationState,
  entriesByHypothesis: Map<string, LifecyclePromotionAuditEntry[]>
): void => {
  for (const hypothesis of state.hypotheses) {
    const entries = entriesByHypothesis.get(hypothesis.id) ?? [];

    for (const entry of entries) {
      assert(entry.governanceEvaluationId.trim().length > 0, `Missing governance evaluation ID on audit entry ${entry.id}.`);
      assert(isAdjacentTransition(entry.previousStatus, entry.newStatus), `Illegal lifecycle jump on audit entry ${entry.id}.`);

      const promoterEvidence = state.evidenceRegistry.items.find((item) => item.id === entry.promoterEvidenceId);
      assert(Boolean(promoterEvidence), `Missing promoter evidence ${entry.promoterEvidenceId} on audit entry ${entry.id}.`);
      assert(
        promoterEvidence?.evidenceCategory === entry.promoterEvidenceCategory,
        `Promoter evidence category mismatch on audit entry ${entry.id}.`
      );
      assert(
        promoterEvidence?.relatedHypothesisId === hypothesis.id,
        `Promoter evidence hypothesis mismatch on audit entry ${entry.id}.`
      );
    }
  }
};

const validateHypothesisAuthenticity = (
  state: AdaptiveInvestigationState,
  entriesByHypothesis: Map<string, LifecyclePromotionAuditEntry[]>
): void => {
  for (const hypothesis of state.hypotheses) {
    const relatedEvidence = state.evidenceRegistry.items.filter((item) => item.relatedHypothesisId === hypothesis.id);
    const supportEvidence = relatedEvidence.filter((item) => item.evidenceCategory !== "Contradictory");

    if (hypothesis.lifecycleStatus === "Draft") {
      continue;
    }

    const entries = entriesByHypothesis.get(hypothesis.id) ?? [];
    assert(entries.length > 0, `Lifecycle ${hypothesis.lifecycleStatus} without promotion trail for hypothesis ${hypothesis.id}.`);

    const promotionToCurrent = findPromotionEntry(entries, hypothesis.id, hypothesis.lifecycleStatus);
    assert(Boolean(promotionToCurrent), `Missing promotion entry to ${hypothesis.lifecycleStatus} for hypothesis ${hypothesis.id}.`);

    if (supportEvidence.length === 0) {
      assert(
        hypothesis.lifecycleStatus === "Candidate" || hypothesis.lifecycleStatus === "Rejected",
        `Lifecycle ${hypothesis.lifecycleStatus} without supporting evidence for hypothesis ${hypothesis.id}.`
      );
    }

    const ranked = weightedCategoryRanking(supportEvidence);
    const predominantCategory = ranked[0]?.[0];

    if (predominantCategory) {
      const ceiling = ecf.resolveLifecycleCeiling([predominantCategory]);
      assert(
        toIndex(hypothesis.lifecycleStatus) <= toIndex(ceiling),
        `Lifecycle ${hypothesis.lifecycleStatus} exceeds ECF ceiling ${ceiling} for hypothesis ${hypothesis.id}.`
      );

      if (hypothesis.lifecycleStatus === "Supported" || hypothesis.lifecycleStatus === "Validated" || hypothesis.lifecycleStatus === "Confirmed") {
        assert(
          promotionToCurrent?.predominantCategory === predominantCategory,
          `Predominant category mismatch on promotion to ${hypothesis.lifecycleStatus} for hypothesis ${hypothesis.id}.`
        );
      }
    }

    if (hypothesis.lifecycleStatus === "Validated") {
      const hasValidatedEvidence = supportEvidence.some(
        (item) => item.evidenceCategory === "Experimental" || item.evidenceCategory === "Validation"
      );
      assert(hasValidatedEvidence, `Validated lifecycle without Experimental/Validation evidence for hypothesis ${hypothesis.id}.`);
    }

    if (hypothesis.lifecycleStatus === "Confirmed") {
      assert(hypothesis.missingEvidence.length === 0, `Confirmed lifecycle with missing evidence for hypothesis ${hypothesis.id}.`);
      const validationEvidence = supportEvidence.filter((item) => isValidationSupport(item, hypothesis.id));
      assert(validationEvidence.length > 0, `Confirmed lifecycle without Validation evidence for hypothesis ${hypothesis.id}.`);
      assert(
        promotionToCurrent?.predominantCategory === "Validation",
        `Confirmed lifecycle without Validation predominant category for hypothesis ${hypothesis.id}.`
      );
    }
  }
};

const validateStateMachineInvariants = (state: AdaptiveInvestigationState): void => {
  if (state.status === "ongoing") {
    assert(Boolean(state.currentQuestion), "Runtime ongoing state requires currentQuestion.");
  }

  if (state.status === "ready-for-synthesis") {
    assert(state.currentQuestion === null, "Runtime ready-for-synthesis state requires currentQuestion null.");
  }
};

export default class RuntimeStateAuthenticator {
  public assertAuthentic(state: AdaptiveInvestigationState): void {
    validateStateMachineInvariants(state);
    validateEvidenceProvenanceConsistency(state.evidenceRegistry.items);

    const entriesByHypothesis = new Map<string, LifecyclePromotionAuditEntry[]>();
    for (const entry of state.lifecycleAuditTrail) {
      const list = entriesByHypothesis.get(entry.hypothesisId) ?? [];
      list.push(entry);
      entriesByHypothesis.set(entry.hypothesisId, list);
    }

    validateAuditTrailEntries(state, entriesByHypothesis);
    validateHypothesisAuthenticity(state, entriesByHypothesis);
  }
}
