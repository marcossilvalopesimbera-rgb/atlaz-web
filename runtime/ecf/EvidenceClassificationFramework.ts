import {
  EvidenceCategory,
  EvidenceItem,
  EvidenceProvenance,
  EvidenceProvenanceKind,
  EvidenceRelation,
  EvidenceType,
  HypothesisLifecycleStatus,
} from "../artifacts/AdaptiveInvestigationState";

export interface EvidenceClassification {
  evidenceCategory: EvidenceCategory;
  evidenceType: EvidenceType;
  relation: EvidenceRelation;
}

const lifecycleOrder: readonly HypothesisLifecycleStatus[] = [
  "Draft",
  "Candidate",
  "Plausible",
  "Supported",
  "Validated",
  "Confirmed",
  "Rejected",
];

const categoryCeiling: Record<EvidenceCategory, HypothesisLifecycleStatus> = {
  Contextual: "Plausible",
  Correlational: "Supported",
  Experimental: "Validated",
  Validation: "Confirmed",
  Contradictory: "Rejected",
};

const classificationByKind: Record<EvidenceProvenanceKind, EvidenceClassification> = {
  ContextualInterview: {
    evidenceCategory: "Contextual",
    evidenceType: "OperatorOpinion",
    relation: "Support",
  },
  ContextualObservation: {
    evidenceCategory: "Contextual",
    evidenceType: "ProcessObservation",
    relation: "Support",
  },
  HistoricalKPITrend: {
    evidenceCategory: "Correlational",
    evidenceType: "HistoricalKPITrend",
    relation: "Support",
  },
  CorrelationAnalysis: {
    evidenceCategory: "Correlational",
    evidenceType: "CorrelationAnalysis",
    relation: "Support",
  },
  LaboratoryTest: {
    evidenceCategory: "Experimental",
    evidenceType: "LaboratoryTest",
    relation: "Support",
  },
  DOE: {
    evidenceCategory: "Experimental",
    evidenceType: "DOE",
    relation: "Support",
  },
  MSA: {
    evidenceCategory: "Experimental",
    evidenceType: "MSA",
    relation: "Support",
  },
  PPAPDocumentation: {
    evidenceCategory: "Experimental",
    evidenceType: "PPAPDocumentation",
    relation: "Support",
  },
  ExperimentalConfirmation: {
    evidenceCategory: "Experimental",
    evidenceType: "ExperimentalConfirmation",
    relation: "Support",
  },
  SystemLog: {
    evidenceCategory: "Correlational",
    evidenceType: "SystemLog",
    relation: "Support",
  },
  ValidationArtifact: {
    evidenceCategory: "Validation",
    evidenceType: "ValidationRecord",
    relation: "Support",
  },
  ContradictoryFinding: {
    evidenceCategory: "Contradictory",
    evidenceType: "ContradictoryFinding",
    relation: "Contradiction",
  },
};

const unique = <T extends string>(values: T[]): T[] => Array.from(new Set(values.filter(Boolean)));

const advanceOneStep = (
  current: HypothesisLifecycleStatus,
  target: HypothesisLifecycleStatus
): HypothesisLifecycleStatus => {
  if (target === "Rejected") {
    return "Rejected";
  }

  const currentIndex = lifecycleOrder.indexOf(current);
  const targetIndex = lifecycleOrder.indexOf(target);

  if (currentIndex === -1 || targetIndex === -1) {
    return current;
  }

  if (currentIndex >= targetIndex) {
    return current;
  }

  return lifecycleOrder[currentIndex + 1] ?? current;
};

export default class EvidenceClassificationFramework {
  public classify(provenance: EvidenceProvenance): EvidenceClassification {
    return classificationByKind[provenance.kind];
  }

  public classifyItems(items: EvidenceItem[]): EvidenceCategory[] {
    return unique<EvidenceCategory>(items.map((item) => item.evidenceCategory));
  }

  public resolveLifecycleCeiling(categories: EvidenceCategory[]): HypothesisLifecycleStatus {
    if (categories.includes("Contradictory")) {
      return "Rejected";
    }

    if (categories.includes("Validation")) {
      return categoryCeiling.Validation;
    }

    if (categories.includes("Experimental")) {
      return categoryCeiling.Experimental;
    }

    if (categories.includes("Correlational")) {
      return categoryCeiling.Correlational;
    }

    if (categories.includes("Contextual")) {
      return categoryCeiling.Contextual;
    }

    return "Draft";
  }

  public resolveLifecycle(
    current: HypothesisLifecycleStatus,
    categories: EvidenceCategory[]
  ): HypothesisLifecycleStatus {
    const target = this.resolveLifecycleCeiling(categories);
    return advanceOneStep(current, target);
  }
}