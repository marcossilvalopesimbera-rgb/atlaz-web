import { OperationalObject } from "./OperationalObject";

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
}

export interface HypothesisState {
  id: string;
  description: string;
  confidence: number;
  supportingEvidence: string[];
  contradictingEvidence: string[];
  status: "Active" | "Confirmed" | "Discarded";
  keywords: string[];
}

export interface EvidenceItem {
  id: string;
  title: string;
  source: string;
  confidence: number;
  investigationStep: string;
}

export interface EvidenceRegistry {
  items: EvidenceItem[];
}

export interface HypothesisRegistry {
  items: HypothesisState[];
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
  remainingInformationGaps: string[];
  currentConfidence: number;
}
