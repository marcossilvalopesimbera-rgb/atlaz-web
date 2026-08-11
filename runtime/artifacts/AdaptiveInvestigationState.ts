import { OperationalObject } from "./OperationalObject";

export type HypothesisLifecycleStatus =
  | "Draft"
  | "Candidate"
  | "Plausible"
  | "Supported"
  | "Validated"
  | "Confirmed"
  | "Rejected";

export type EvidenceCategory = "Contextual" | "Correlational" | "Experimental" | "Validation" | "Contradictory";

export type EvidenceProvenanceKind =
  | "ContextualInterview"
  | "ContextualObservation"
  | "HistoricalKPITrend"
  | "CorrelationAnalysis"
  | "LaboratoryTest"
  | "DOE"
  | "MSA"
  | "PPAPDocumentation"
  | "ExperimentalConfirmation"
  | "SystemLog"
  | "ValidationArtifact"
  | "ContradictoryFinding";

export interface EvidenceProvenance {
  kind: EvidenceProvenanceKind;
  source: string;
  capturedAt: string;
  confidence: number;
  consistency: number;
  temporalCorrelation: number;
}

export type EvidenceType =
  | "OperatorOpinion"
  | "HistoricalKPITrend"
  | "LaboratoryTest"
  | "DOE"
  | "MSA"
  | "PPAPDocumentation"
  | "CorrelationAnalysis"
  | "ExperimentalConfirmation"
  | "ProcessObservation"
  | "SystemLog"
  | "ValidationRecord"
  | "ContradictoryFinding"
  | "Unknown";

export type EvidenceWeightLevel = "Low" | "Medium" | "High" | "VeryHigh" | "Maximum";

export type EvidenceRelation = "Support" | "Contradiction" | "Neutral";

export interface SemanticEvidenceProfile {
  supports_hypothesis: boolean;
  contradicts_hypothesis: boolean;
  reveals_gap: boolean;
  requires_validation: boolean;
  opens_new_path: boolean;
  restricts_scope: boolean;
  increases_uncertainty: boolean;
  reduces_uncertainty: boolean;
}

export interface HypothesisCompetitionProfile {
  competingHypothesisIds: string[];
  dominanceScore: number;
  isDominant: boolean;
  dominantHypothesisId: string | null;
  redundantWith: string[];
  closureReason: string;
}

export interface QuestionJustification {
  reason: string;
  supports: string[];
  expectedInformationGain: number;
  domain: string;
  expertPattern: string;
  semanticProfile?: SemanticEvidenceProfile;
}

export interface InvestigationTargetEvidence {
  priority: number;
  reason: string;
  expectedUncertaintyReduction: number;
  recommendedAcquisition: string;
  supports: string[];
  domain: string;
  expertPattern: string;
}

export interface HypothesisConfidenceSnapshot {
  timestamp: string;
  confidence: number;
  lifecycleStatus: HypothesisLifecycleStatus;
  reasoningSummary: string;
}

export interface LifecyclePromotionAuditEntry {
  id: string;
  governanceEvaluationId: string;
  hypothesisId: string;
  hypothesisDescription: string;
  previousStatus: HypothesisLifecycleStatus;
  newStatus: HypothesisLifecycleStatus;
  ruleApplied: string;
  predominantCategory: EvidenceCategory;
  promoterEvidenceId: string;
  promoterEvidenceCategory: EvidenceCategory;
  promoterEvidenceWeight: number;
  promoterEvidenceQuality: number;
  justification: string;
  createdAt: string;
}

export interface RuntimeTelemetryModuleTiming {
  module: string;
  startedAt: string;
  endedAt: string;
  durationMs: number;
}

export interface RuntimeTelemetryEvent {
  timestamp: string;
  name: string;
  details: string;
}

export interface RuntimeTelemetryError {
  timestamp: string;
  module: string;
  message: string;
}

export interface RuntimeExecutionTrace {
  id: string;
  sessionId: string;
  runtimeId: string;
  requestId: string;
  retryCount: number;
  result: "success" | "error" | "interrupted";
  interruptionReason?: string;
  startedAt: string;
  endedAt: string;
  totalDurationMs: number;
  moduleTimings: RuntimeTelemetryModuleTiming[];
  events: RuntimeTelemetryEvent[];
  errors: RuntimeTelemetryError[];
}

export type InvestigationObjective =
  | "Reduzir incerteza"
  | "Validar evidências"
  | "Eliminar hipóteses"
  | "Aumentar confiança"
  | "Identificar informação faltante";

export interface InvestigationQuestion {
  id: string;
  step: string;
  intro: string;
  question: string;
  placeholder: string;
  whyAsked: string;
  uncertaintyTarget: string;
  objective: InvestigationObjective;
  questionJustification?: QuestionJustification;
}

export interface HypothesisState {
  id: string;
  description: string;
  confidence: number;
  lifecycleStatus: HypothesisLifecycleStatus;
  supportingEvidence: string[];
  contradictingEvidence: string[];
  missingEvidence: string[];
  nextRecommendedInvestigation: string;
  reasoningSummary: string;
  confidenceHistory: HypothesisConfidenceSnapshot[];
  status: "Active" | "Confirmed" | "Discarded";
  keywords: string[];
  competition?: HypothesisCompetitionProfile;
}

export interface EvidenceItem {
  id: string;
  origin: string;
  question: string;
  answer: string;
  timestamp: string;
  title: string;
  source: string;
  confidence: number;
  evidenceType: EvidenceType;
  evidenceCategory: EvidenceCategory;
  weight: number;
  weightLevel: EvidenceWeightLevel;
  relatedHypothesisId: string;
  relation: EvidenceRelation;
  temporalCorrelation: number;
  consistency: number;
  provenance: EvidenceProvenance;
  investigationStep: string;
  semanticProfile?: SemanticEvidenceProfile;
}

export interface EvidenceRegistry {
  items: EvidenceItem[];
}

export interface HypothesisRegistry {
  items: HypothesisState[];
}

export interface InvestigationOutput {
  problem: string;
  hypotheses: Array<{
    id: string;
    description: string;
    confidence: number;
    lifecycleStatus: HypothesisLifecycleStatus;
    reasoningSummary: string;
  }>;
  confidence: {
    global: number;
    strongestHypothesisId: string | null;
  };
  evidence: {
    supporting: EvidenceItem[];
    contradicting: EvidenceItem[];
  };
  missingEvidence: string[];
  recommendedInvestigation: string;
  targetEvidence?: InvestigationTargetEvidence;
  decision: {
    status: "insufficient-evidence" | "investigate-further" | "ready-for-decision";
    rationale: string;
  };
}

export interface InvestigationTurn {
  id: string;
  questionId: string;
  questionAsked: string;
  userAnswer: string;
  whyQuestionWasAsked: string;
  uncertaintyReduced: string;
  objective: InvestigationObjective;
  strengthenedHypotheses: string[];
  weakenedHypotheses: string[];
  confidenceBefore: number;
  confidenceAfter: number;
  remainingInformationGaps: string[];
  createdAt: string;
}

export interface AdaptiveInvestigationState {
  artifact: "AdaptiveInvestigationState";
  version: string;
  investigationId: string;
  createdAt: string;
  updatedAt: string;
  status: "ongoing" | "ready-for-synthesis";
  operationalObject: OperationalObject;
  currentQuestion: InvestigationQuestion | null;
  askedQuestionIds: string[];
  knownInformation: string[];
  evidenceRegistry: EvidenceRegistry;
  hypothesisRegistry: HypothesisRegistry;
  hypotheses: HypothesisState[];
  history: InvestigationTurn[];
  lifecycleAuditTrail: LifecyclePromotionAuditEntry[];
  remainingInformationGaps: string[];
  currentConfidence: number;
  investigationOutput: InvestigationOutput;
  runtimeTelemetry: RuntimeExecutionTrace[];
}
