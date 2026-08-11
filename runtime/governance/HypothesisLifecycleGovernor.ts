import {
  EvidenceCategory,
  EvidenceItem,
  HypothesisLifecycleStatus,
  HypothesisState,
  LifecyclePromotionAuditEntry,
} from "../artifacts/AdaptiveInvestigationState";
import EvidenceClassificationFramework from "../ecf/EvidenceClassificationFramework";

export type LifecycleGovernanceDecision = {
  governanceEvaluationId: string;
  lifecycleStatus: HypothesisLifecycleStatus;
  ruleApplied: string;
  justification: string;
  predominantCategory: EvidenceCategory | null;
  promoterEvidence: EvidenceItem | null;
};

const createGovernanceEvaluationId = (): string => {
  if (typeof globalThis.crypto !== "undefined" && "randomUUID" in globalThis.crypto) {
    return `gov-${globalThis.crypto.randomUUID()}`;
  }

  return `gov-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
};

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

const orderIndex = (status: HypothesisLifecycleStatus): number => lifecycleOrder.indexOf(status);

const rankByCategory = (items: EvidenceItem[]): Map<EvidenceCategory, number> => {
  return items.reduce((acc, item) => {
    const quality = item.confidence * item.consistency;
    acc.set(item.evidenceCategory, (acc.get(item.evidenceCategory) ?? 0) + item.weight * quality);
    return acc;
  }, new Map<EvidenceCategory, number>());
};

const categorySupportsStatus = (
  category: EvidenceCategory,
  status: HypothesisLifecycleStatus
): boolean => {
  if (status === "Rejected") {
    return category === "Contradictory";
  }

  if (status === "Confirmed") {
    return category === "Validation";
  }

  if (status === "Validated") {
    return category === "Experimental" || category === "Validation";
  }

  if (status === "Supported") {
    return category === "Correlational" || category === "Experimental" || category === "Validation";
  }

  if (status === "Plausible") {
    return (
      category === "Contextual" ||
      category === "Correlational" ||
      category === "Experimental" ||
      category === "Validation"
    );
  }

  return true;
};

const pickPromoterEvidence = (
  items: EvidenceItem[],
  requiredCategory?: EvidenceCategory
): EvidenceItem | null => {
  const filtered = requiredCategory ? items.filter((item) => item.evidenceCategory === requiredCategory) : items;
  if (filtered.length === 0) {
    return null;
  }

  return [...filtered].sort((a, b) => {
    const qa = a.weight * a.confidence * a.consistency;
    const qb = b.weight * b.confidence * b.consistency;
    return qb - qa;
  })[0];
};

export const createLifecyclePromotionAuditEntry = (params: {
  id: string;
  governanceEvaluationId: string;
  hypothesis: HypothesisState;
  from: HypothesisLifecycleStatus;
  to: HypothesisLifecycleStatus;
  ruleApplied: string;
  predominantCategory: EvidenceCategory;
  justification: string;
  promoterEvidence: EvidenceItem;
  createdAt: string;
}): LifecyclePromotionAuditEntry => {
  return {
    id: params.id,
    governanceEvaluationId: params.governanceEvaluationId,
    hypothesisId: params.hypothesis.id,
    hypothesisDescription: params.hypothesis.description,
    previousStatus: params.from,
    newStatus: params.to,
    ruleApplied: params.ruleApplied,
    predominantCategory: params.predominantCategory,
    promoterEvidenceId: params.promoterEvidence.id,
    promoterEvidenceCategory: params.promoterEvidence.evidenceCategory,
    promoterEvidenceWeight: params.promoterEvidence.weight,
    promoterEvidenceQuality: Number((params.promoterEvidence.confidence * params.promoterEvidence.consistency).toFixed(3)),
    justification: params.justification,
    createdAt: params.createdAt,
  };
};

export default class HypothesisLifecycleGovernor {
  public resolve(params: {
    hypothesis: HypothesisState;
    proposedStatus: HypothesisLifecycleStatus;
    confidence: number;
    relatedEvidence: EvidenceItem[];
    missingEvidence: string[];
  }): LifecycleGovernanceDecision {
    const { hypothesis, proposedStatus, relatedEvidence, missingEvidence } = params;
    const current = hypothesis.lifecycleStatus;
    const governanceEvaluationId = createGovernanceEvaluationId();

    if (proposedStatus === current) {
      return {
        governanceEvaluationId,
        lifecycleStatus: current,
        ruleApplied: "NoTransition",
        justification: "Sem transição de lifecycle nesta avaliação.",
        predominantCategory: null,
        promoterEvidence: null,
      };
    }

    const contradictionEvidence = relatedEvidence.filter((item) => item.evidenceCategory === "Contradictory");
    if (contradictionEvidence.length > 0 && proposedStatus === "Rejected") {
      return {
        governanceEvaluationId,
        lifecycleStatus: "Rejected",
        ruleApplied: "ContradictionDominance",
        justification: "Evidência contraditória classificada prevaleceu na governança de lifecycle.",
        predominantCategory: "Contradictory",
        promoterEvidence: pickPromoterEvidence(contradictionEvidence, "Contradictory"),
      };
    }

    const supportEvidence = relatedEvidence.filter((item) => item.evidenceCategory !== "Contradictory");
    const rankedCategories = [...rankByCategory(supportEvidence).entries()].sort((a, b) => b[1] - a[1]);
    const predominantCategory = rankedCategories[0]?.[0] ?? "Contextual";
    const ceiling = ecf.resolveLifecycleCeiling([predominantCategory]);
    const currentIndex = orderIndex(current);
    const proposedIndex = orderIndex(proposedStatus);
    const ceilingIndex = orderIndex(ceiling);

    let governedStatus = proposedStatus;
    let ruleApplied = "AcceptedByGovernor";
    let justification = "Transição aceita pela governança independente de lifecycle.";

    if (proposedIndex > ceilingIndex) {
      governedStatus = ceiling;
      ruleApplied = "CategoryCeilingEnforced";
      justification = `Promoção bloqueada pelo teto da categoria predominante (${predominantCategory}).`;
    }

    if (governedStatus === "Confirmed" && missingEvidence.length > 0) {
      governedStatus = "Validated";
      ruleApplied = "MissingEvidenceBlock";
      justification = "Confirmação bloqueada por lacunas explícitas de evidência.";
    }

    if (orderIndex(governedStatus) > currentIndex + 1 && governedStatus !== "Rejected") {
      governedStatus = lifecycleOrder[currentIndex + 1] ?? current;
      ruleApplied = "NoLifecycleJump";
      justification = "Promoção ajustada para evitar salto de lifecycle.";
    }

    if (orderIndex(governedStatus) > currentIndex) {
      const hasCompatibleEvidence = supportEvidence.some((item) =>
        categorySupportsStatus(item.evidenceCategory, governedStatus)
      );
      if (!hasCompatibleEvidence) {
        governedStatus = current;
        ruleApplied = "EvidenceCompatibilityBlock";
        justification = "Promoção bloqueada por falta de evidência classificada compatível com o estado alvo.";
      }
    }

    const promoterEvidence =
      governedStatus === "Rejected"
        ? pickPromoterEvidence(contradictionEvidence, "Contradictory")
        : pickPromoterEvidence(supportEvidence);

    if (orderIndex(governedStatus) > currentIndex && !promoterEvidence) {
      return {
        governanceEvaluationId,
        lifecycleStatus: current,
        ruleApplied: "MissingPromoterEvidenceBlock",
        justification: "Promoção bloqueada por ausência de evidência promotora verificável.",
        predominantCategory,
        promoterEvidence: null,
      };
    }

    return {
      governanceEvaluationId,
      lifecycleStatus: governedStatus,
      ruleApplied,
      justification,
      predominantCategory,
      promoterEvidence,
    };
  }
}
