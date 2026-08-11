import { EvidenceType, HypothesisLifecycleStatus } from "../artifacts/AdaptiveInvestigationState";

export interface CEFLifecycleThreshold {
  status: HypothesisLifecycleStatus;
  min: number;
  max: number;
}

export interface CEFConfiguration {
  thresholds: readonly CEFLifecycleThreshold[];
  evidenceWeights: Readonly<Record<EvidenceType, number>>;
  contradictionPenaltyMultiplier: number;
  missingEvidencePenalty: number;
  unknownEvidencePenalty: number;
  consistencyFactorWeight: number;
  temporalCorrelationWeight: number;
  minEvidenceForSupported: number;
  minEvidenceForValidated: number;
  minEvidenceForConfirmed: number;
  minStrongEvidenceForConfirmed: number;
}

export const DEFAULT_CEF_CONFIGURATION: CEFConfiguration = {
  thresholds: [
    { status: "Draft", min: 0, max: 0.2 },
    { status: "Candidate", min: 0.2, max: 0.4 },
    { status: "Plausible", min: 0.4, max: 0.6 },
    { status: "Supported", min: 0.6, max: 0.8 },
    { status: "Validated", min: 0.8, max: 0.95 },
    { status: "Confirmed", min: 0.95, max: 1 },
  ],
  evidenceWeights: {
    OperatorOpinion: 0.25,
    HistoricalKPITrend: 0.5,
    LaboratoryTest: 0.78,
    DOE: 0.9,
    MSA: 0.9,
    PPAPDocumentation: 0.78,
    CorrelationAnalysis: 0.74,
    ExperimentalConfirmation: 1,
    ProcessObservation: 0.45,
    SystemLog: 0.62,
    ValidationRecord: 1,
    ContradictoryFinding: 0.2,
    Unknown: 0.35,
  },
  contradictionPenaltyMultiplier: 1.2,
  missingEvidencePenalty: 0.045,
  unknownEvidencePenalty: 0.12,
  consistencyFactorWeight: 0.22,
  temporalCorrelationWeight: 0.16,
  minEvidenceForSupported: 2,
  minEvidenceForValidated: 3,
  minEvidenceForConfirmed: 4,
  minStrongEvidenceForConfirmed: 2,
};
