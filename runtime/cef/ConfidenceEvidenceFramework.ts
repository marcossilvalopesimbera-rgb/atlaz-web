import {
  EvidenceCategory,
  EvidenceItem,
  HypothesisConfidenceSnapshot,
  HypothesisLifecycleStatus,
  HypothesisState,
  InvestigationQuestion,
} from "../artifacts/AdaptiveInvestigationState";
import EvidenceClassificationFramework from "../ecf/EvidenceClassificationFramework";
import { CEFConfiguration, DEFAULT_CEF_CONFIGURATION } from "./config";

const evidenceClassificationFramework = new EvidenceClassificationFramework();

type CEFInput = {
  hypothesis: HypothesisState;
  evidence: EvidenceItem[];
  missingEvidence: string[];
  timestamp: string;
};

type CEFEvaluation = {
  confidence: number;
  lifecycleStatus: HypothesisLifecycleStatus;
  compatibilityStatus: HypothesisState["status"];
  reasoningSummary: string;
  supportingEvidenceIds: string[];
  contradictingEvidenceIds: string[];
  nextRecommendedInvestigation: string;
  confidenceEntry: HypothesisConfidenceSnapshot;
};

const clamp = (value: number): number => {
  if (value < 0) {
    return 0;
  }

  if (value > 1) {
    return 1;
  }

  return Number(value.toFixed(3));
};

const normalize = (value: string): string =>
  value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const unique = (values: string[]): string[] =>
  Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));

const toWeightLevel = (weight: number): EvidenceItem["weightLevel"] => {
  if (weight >= 0.95) {
    return "Maximum";
  }
  if (weight >= 0.85) {
    return "VeryHigh";
  }
  if (weight >= 0.7) {
    return "High";
  }
  if (weight >= 0.45) {
    return "Medium";
  }
  return "Low";
};

const hasPattern = (value: string, pattern: RegExp): boolean => pattern.test(value);

const compatibilityFromLifecycle = (
  lifecycleStatus: HypothesisLifecycleStatus,
  missingEvidence: string[]
): HypothesisState["status"] => {
  if (lifecycleStatus === "Rejected") {
    return "Discarded";
  }

  if (lifecycleStatus === "Confirmed" && missingEvidence.length === 0) {
    return "Confirmed";
  }

  return "Active";
};

export default class ConfidenceEvidenceFramework {
  constructor(private readonly config: CEFConfiguration = DEFAULT_CEF_CONFIGURATION) {}

  public createEvidenceRecord(params: {
    id: string;
    origin: string;
    question: InvestigationQuestion;
    answer: string;
    investigationStep: string;
    relatedHypothesisId: string;
    keywords: string[];
    timestamp: string;
    provenance: {
      kind: Parameters<typeof evidenceClassificationFramework.classify>[0]["kind"];
      source: string;
      capturedAt: string;
      confidence: number;
      consistency: number;
      temporalCorrelation: number;
    };
  }): EvidenceItem {
    const classification = evidenceClassificationFramework.classify(params.provenance);
    const baseWeight = this.config.evidenceWeights[classification.evidenceType];

    const weightedConfidence = clamp(
      baseWeight * 0.55 +
        params.provenance.confidence * 0.2 +
        params.provenance.consistency * this.config.consistencyFactorWeight +
        params.provenance.temporalCorrelation * this.config.temporalCorrelationWeight
    );

    return {
      id: params.id,
      origin: params.origin,
      question: params.question.question,
      answer: params.answer,
      timestamp: params.timestamp,
      title: params.question.question,
      source: `${params.provenance.source}: ${params.answer}`,
      confidence: weightedConfidence,
      evidenceType: classification.evidenceType,
      evidenceCategory: classification.evidenceCategory,
      weight: Number(baseWeight.toFixed(3)),
      weightLevel: toWeightLevel(baseWeight),
      relatedHypothesisId: params.relatedHypothesisId,
      relation: classification.relation,
      temporalCorrelation: params.provenance.temporalCorrelation,
      consistency: params.provenance.consistency,
      provenance: params.provenance,
      investigationStep: params.investigationStep,
    };
  }

  public evaluate(input: CEFInput): CEFEvaluation {
    const relatedEvidence = input.evidence.filter((item) => item.relatedHypothesisId === input.hypothesis.id);
    const evidenceCategories = evidenceClassificationFramework.classifyItems(relatedEvidence);
    const supporting = relatedEvidence.filter((item) => item.evidenceCategory !== "Contradictory");
    const contradicting = relatedEvidence.filter((item) => item.evidenceCategory === "Contradictory");

    const supportScore = supporting.reduce((acc, item) => {
      return acc + item.weight * item.confidence * (0.7 + item.temporalCorrelation * 0.3);
    }, 0);

    const contradictionScore = contradicting.reduce((acc, item) => {
      return acc + item.weight * item.confidence * (0.7 + item.consistency * 0.3);
    }, 0) * this.config.contradictionPenaltyMultiplier;

    const quantitySignal = Math.min(1, 1 - Math.exp(-relatedEvidence.length / 4));
    const unknownPenalty = supporting.length === 0 ? this.config.unknownEvidencePenalty : 0;
    const missingPenalty = Math.min(0.4, input.missingEvidence.length * this.config.missingEvidencePenalty);

    const computedConfidence = clamp(
      input.hypothesis.confidence * 0.32 +
        Math.min(1, supportScore / 2) * 0.42 +
        quantitySignal * 0.18 -
        Math.min(1, contradictionScore / 2) * 0.34 -
        unknownPenalty -
        missingPenalty
    );

    const targetLifecycle = evidenceClassificationFramework.resolveLifecycle(
      input.hypothesis.lifecycleStatus,
      evidenceCategories
    );

    const confidence = targetLifecycle === "Rejected" ? Math.min(computedConfidence, 0.35) : computedConfidence;

    const reasoningSummary = this.buildReasoningSummary({
      confidence,
      lifecycleStatus: targetLifecycle,
      supportScore,
      contradictionScore,
      evidenceCategories,
      supportingCount: supporting.length,
      contradictingCount: contradicting.length,
      missingEvidenceCount: input.missingEvidence.length,
    });

    return {
      confidence,
      lifecycleStatus: targetLifecycle,
      compatibilityStatus: compatibilityFromLifecycle(targetLifecycle, input.missingEvidence),
      reasoningSummary,
      supportingEvidenceIds: supporting.map((item) => item.id),
      contradictingEvidenceIds: contradicting.map((item) => item.id),
      nextRecommendedInvestigation:
        input.missingEvidence[0] ??
        (contradicting.length > 0
          ? "Investigar contradições com experimento controlado para reduzir ambiguidade causal."
          : "Expandir evidências objetivas para validação cruzada da hipótese."),
      confidenceEntry: {
        timestamp: input.timestamp,
        confidence,
        lifecycleStatus: targetLifecycle,
        reasoningSummary,
      },
    };
  }

  private buildReasoningSummary(params: {
    confidence: number;
    lifecycleStatus: HypothesisLifecycleStatus;
    supportScore: number;
    contradictionScore: number;
    evidenceCategories: EvidenceCategory[];
    supportingCount: number;
    contradictingCount: number;
    missingEvidenceCount: number;
  }): string {
    const possibility = params.supportingCount > 0 ? "possível" : "especulativa";
    const probability = params.confidence >= 0.6 ? "provável" : "incerta";
    const confirmation = params.lifecycleStatus === "Confirmed" ? "confirmada" : "não confirmada";

    return [
      `Hipótese ${possibility}, ${probability} e atualmente ${confirmation}.`,
      `Categorias classificadas: ${params.evidenceCategories.length > 0 ? params.evidenceCategories.join(", ") : "nenhuma"}.`,
      `Suporte ponderado: ${params.supportScore.toFixed(2)}; contradição ponderada: ${params.contradictionScore.toFixed(2)}.`,
      `Evidências de suporte: ${params.supportingCount}; contraditórias: ${params.contradictingCount}; lacunas: ${params.missingEvidenceCount}.`,
      `Status de ciclo de vida: ${params.lifecycleStatus}.`,
    ].join(" ");
  }

  public buildInitialHistory(timestamp: string, confidence: number): HypothesisConfidenceSnapshot[] {
    return [
      {
        timestamp,
        confidence,
        lifecycleStatus: "Draft",
        reasoningSummary:
          "Hipótese inicial em rascunho: possibilidade levantada com base na interpretação do problema, sem confirmação por evidências objetivas.",
      },
    ];
  }

  public computeMissingEvidence(gaps: string[], hypothesis: HypothesisState): string[] {
    const normalizedKeywords = hypothesis.keywords.map((keyword) => normalize(keyword));

    const relevant = gaps.filter((gap) => {
      const normalizedGap = normalize(gap);
      return normalizedKeywords.some((keyword) => normalizedGap.includes(keyword));
    });

    if (relevant.length > 0) {
      return unique(relevant);
    }

    return unique(gaps.slice(0, 2));
  }
}
