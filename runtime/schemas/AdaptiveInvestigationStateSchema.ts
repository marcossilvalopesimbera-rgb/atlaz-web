import { AdaptiveInvestigationState } from "../artifacts/AdaptiveInvestigationState";
import RuntimeStateAuthenticator from "../governance/RuntimeStateAuthenticator";
import { tryParseOperationalObject } from "./OperationalObjectRecovery";

const runtimeStateAuthenticator = new RuntimeStateAuthenticator();

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isQuestionObjective = (value: unknown): value is AdaptiveInvestigationState["history"][number]["objective"] => {
  return (
    value === "Reduzir incerteza" ||
    value === "Validar evidências" ||
    value === "Eliminar hipóteses" ||
    value === "Aumentar confiança" ||
    value === "Identificar informação faltante"
  );
};

const parseCurrentQuestion = (value: unknown): AdaptiveInvestigationState["currentQuestion"] => {
  if (value === null) {
    return null;
  }

  if (!isPlainObject(value)) {
    throw new Error("Invalid AdaptiveInvestigationState");
  }

  if (
    typeof value.id !== "string" ||
    typeof value.step !== "string" ||
    typeof value.intro !== "string" ||
    typeof value.question !== "string" ||
    typeof value.placeholder !== "string" ||
    typeof value.whyAsked !== "string" ||
    typeof value.uncertaintyTarget !== "string" ||
    !isQuestionObjective(value.objective)
  ) {
    throw new Error("Invalid AdaptiveInvestigationState");
  }

  return {
    id: value.id,
    step: value.step,
    intro: value.intro,
    question: value.question,
    placeholder: value.placeholder,
    whyAsked: value.whyAsked,
    uncertaintyTarget: value.uncertaintyTarget,
    objective: value.objective,
  };
};

const parseHypotheses = (value: unknown): AdaptiveInvestigationState["hypotheses"] => {
  if (!Array.isArray(value)) {
    throw new Error("Invalid AdaptiveInvestigationState");
  }

  return value.map((item) => {
    if (!isPlainObject(item)) {
      throw new Error("Invalid AdaptiveInvestigationState");
    }

    if (typeof item.id !== "string" || typeof item.confidence !== "number" || Number.isNaN(item.confidence)) {
      throw new Error("Invalid AdaptiveInvestigationState");
    }

    const description =
      typeof item.description === "string"
        ? item.description
        : typeof item.statement === "string"
        ? item.statement
        : undefined;

    if (!description) {
      throw new Error("Invalid AdaptiveInvestigationState");
    }

    const keywords = isStringArray(item.keywords) ? item.keywords : [];
    const supportingEvidence = isStringArray(item.supportingEvidence) ? item.supportingEvidence : [];
    const contradictingEvidence = isStringArray(item.contradictingEvidence) ? item.contradictingEvidence : [];
    const missingEvidence = isStringArray(item.missingEvidence) ? item.missingEvidence : [];
    const nextRecommendedInvestigation =
      typeof item.nextRecommendedInvestigation === "string"
        ? item.nextRecommendedInvestigation
        : "Coletar evidências objetivas adicionais para reduzir incerteza.";
    const reasoningSummary =
      typeof item.reasoningSummary === "string"
        ? item.reasoningSummary
        : "Hipótese em avaliação, aguardando evidências ponderadas.";

    const lifecycleStatus =
      item.lifecycleStatus === "Draft" ||
      item.lifecycleStatus === "Candidate" ||
      item.lifecycleStatus === "Plausible" ||
      item.lifecycleStatus === "Supported" ||
      item.lifecycleStatus === "Validated" ||
      item.lifecycleStatus === "Confirmed" ||
      item.lifecycleStatus === "Rejected"
        ? item.lifecycleStatus
        : "Draft";

    const confidenceHistory = Array.isArray(item.confidenceHistory)
      ? item.confidenceHistory
          .filter(isPlainObject)
          .filter(
            (snapshot) =>
              typeof snapshot.timestamp === "string" &&
              typeof snapshot.confidence === "number" &&
              !Number.isNaN(snapshot.confidence) &&
              (snapshot.lifecycleStatus === "Draft" ||
                snapshot.lifecycleStatus === "Candidate" ||
                snapshot.lifecycleStatus === "Plausible" ||
                snapshot.lifecycleStatus === "Supported" ||
                snapshot.lifecycleStatus === "Validated" ||
                snapshot.lifecycleStatus === "Confirmed" ||
                snapshot.lifecycleStatus === "Rejected") &&
              typeof snapshot.reasoningSummary === "string"
          )
          .map((snapshot) => ({
            timestamp: snapshot.timestamp as string,
            confidence: snapshot.confidence as number,
            lifecycleStatus: snapshot.lifecycleStatus as
              | "Draft"
              | "Candidate"
              | "Plausible"
              | "Supported"
              | "Validated"
              | "Confirmed"
              | "Rejected",
            reasoningSummary: snapshot.reasoningSummary as string,
          }))
      : [];
    const status =
      item.status === "Active" || item.status === "Confirmed" || item.status === "Discarded"
        ? item.status
        : "Active";

    return {
      id: item.id,
      description,
      confidence: item.confidence,
      lifecycleStatus,
      supportingEvidence,
      contradictingEvidence,
      missingEvidence,
      nextRecommendedInvestigation,
      reasoningSummary,
      confidenceHistory,
      status,
      keywords,
    };
  });
};

const parseEvidenceRegistry = (value: unknown): AdaptiveInvestigationState["evidenceRegistry"] => {
  if (!isPlainObject(value) || !Array.isArray(value.items)) {
    throw new Error("Invalid AdaptiveInvestigationState");
  }

  const items = value.items.map((item) => {
    if (!isPlainObject(item)) {
      throw new Error("Invalid AdaptiveInvestigationState");
    }

    if (
      typeof item.id !== "string" ||
      typeof item.title !== "string" ||
      typeof item.source !== "string" ||
      typeof item.confidence !== "number" ||
      Number.isNaN(item.confidence) ||
      typeof item.investigationStep !== "string"
    ) {
      throw new Error("Invalid AdaptiveInvestigationState");
    }

    const evidenceType: AdaptiveInvestigationState["evidenceRegistry"]["items"][number]["evidenceType"] =
      item.evidenceType === "OperatorOpinion" ||
      item.evidenceType === "HistoricalKPITrend" ||
      item.evidenceType === "LaboratoryTest" ||
      item.evidenceType === "DOE" ||
      item.evidenceType === "MSA" ||
      item.evidenceType === "PPAPDocumentation" ||
      item.evidenceType === "CorrelationAnalysis" ||
      item.evidenceType === "ExperimentalConfirmation" ||
      item.evidenceType === "ProcessObservation" ||
      item.evidenceType === "SystemLog" ||
      item.evidenceType === "ValidationRecord" ||
      item.evidenceType === "ContradictoryFinding" ||
      item.evidenceType === "Unknown"
        ? item.evidenceType
        : "Unknown";

    const evidenceCategory: AdaptiveInvestigationState["evidenceRegistry"]["items"][number]["evidenceCategory"] =
      item.evidenceCategory === "Contextual" ||
      item.evidenceCategory === "Correlational" ||
      item.evidenceCategory === "Experimental" ||
      item.evidenceCategory === "Validation" ||
      item.evidenceCategory === "Contradictory"
        ? item.evidenceCategory
        : evidenceType === "OperatorOpinion" || evidenceType === "ProcessObservation" || evidenceType === "Unknown"
        ? "Contextual"
        : evidenceType === "HistoricalKPITrend" ||
          evidenceType === "CorrelationAnalysis" ||
          evidenceType === "SystemLog"
        ? "Correlational"
        : evidenceType === "ValidationRecord"
        ? "Validation"
        : evidenceType === "ContradictoryFinding"
        ? "Contradictory"
        : "Experimental";

    const relation: AdaptiveInvestigationState["evidenceRegistry"]["items"][number]["relation"] =
      item.relation === "Support" || item.relation === "Contradiction" || item.relation === "Neutral"
        ? item.relation
        : "Neutral";

    const weightLevel: AdaptiveInvestigationState["evidenceRegistry"]["items"][number]["weightLevel"] =
      item.weightLevel === "Low" ||
      item.weightLevel === "Medium" ||
      item.weightLevel === "High" ||
      item.weightLevel === "VeryHigh" ||
      item.weightLevel === "Maximum"
        ? item.weightLevel
        : "Low";

    const provenanceKind =
      item.provenance && typeof item.provenance === "object" && "kind" in item.provenance
        ? (item.provenance.kind as string)
        : undefined;
    const provenanceSource =
      item.provenance && typeof item.provenance === "object" && "source" in item.provenance
        ? (item.provenance.source as string | undefined)
        : undefined;
    const provenanceCapturedAt =
      item.provenance && typeof item.provenance === "object" && "capturedAt" in item.provenance
        ? (item.provenance.capturedAt as unknown)
        : undefined;
    const provenanceConfidence =
      item.provenance && typeof item.provenance === "object" && "confidence" in item.provenance
        ? (item.provenance.confidence as unknown)
        : undefined;
    const provenanceConsistency =
      item.provenance && typeof item.provenance === "object" && "consistency" in item.provenance
        ? (item.provenance.consistency as unknown)
        : undefined;
    const provenanceTemporalCorrelation =
      item.provenance && typeof item.provenance === "object" && "temporalCorrelation" in item.provenance
        ? (item.provenance.temporalCorrelation as unknown)
        : undefined;

    const resolvedProvenanceKind =
      provenanceKind === "ContextualInterview" ||
      provenanceKind === "ContextualObservation" ||
      provenanceKind === "HistoricalKPITrend" ||
      provenanceKind === "CorrelationAnalysis" ||
      provenanceKind === "LaboratoryTest" ||
      provenanceKind === "DOE" ||
      provenanceKind === "MSA" ||
      provenanceKind === "PPAPDocumentation" ||
      provenanceKind === "ExperimentalConfirmation" ||
      provenanceKind === "SystemLog" ||
      provenanceKind === "ValidationArtifact" ||
      provenanceKind === "ContradictoryFinding"
        ? provenanceKind
        : evidenceCategory === "Validation"
        ? "ValidationArtifact"
        : evidenceCategory === "Contradictory"
        ? "ContradictoryFinding"
        : evidenceCategory === "Correlational"
        ? "HistoricalKPITrend"
        : evidenceCategory === "Experimental"
        ? "ExperimentalConfirmation"
        : "ContextualInterview";

    return {
      id: item.id,
      origin: typeof item.origin === "string" ? item.origin : item.source,
      question: typeof item.question === "string" ? item.question : item.title,
      answer: typeof item.answer === "string" ? item.answer : item.source,
      timestamp: typeof item.timestamp === "string" ? item.timestamp : new Date(0).toISOString(),
      title: item.title,
      source: item.source,
      confidence: item.confidence,
      evidenceType,
      evidenceCategory,
      weight: typeof item.weight === "number" && !Number.isNaN(item.weight) ? item.weight : 0.35,
      weightLevel,
      relatedHypothesisId: typeof item.relatedHypothesisId === "string" ? item.relatedHypothesisId : "contexto-global",
      relation,
      temporalCorrelation:
        typeof item.temporalCorrelation === "number" && !Number.isNaN(item.temporalCorrelation)
          ? item.temporalCorrelation
          : 0.5,
      consistency: typeof item.consistency === "number" && !Number.isNaN(item.consistency) ? item.consistency : 0.5,
      provenance: {
        kind: resolvedProvenanceKind as AdaptiveInvestigationState["evidenceRegistry"]["items"][number]["provenance"]["kind"],
        source: typeof provenanceSource === "string" ? provenanceSource : item.origin,
        capturedAt: typeof provenanceCapturedAt === "string" ? provenanceCapturedAt : item.timestamp,
        confidence:
          typeof provenanceConfidence === "number" && !Number.isNaN(provenanceConfidence)
            ? provenanceConfidence
            : item.confidence,
        consistency:
          typeof provenanceConsistency === "number" && !Number.isNaN(provenanceConsistency)
            ? provenanceConsistency
            : 0.5,
        temporalCorrelation:
          typeof provenanceTemporalCorrelation === "number" && !Number.isNaN(provenanceTemporalCorrelation)
            ? provenanceTemporalCorrelation
            : 0.5,
      },
      investigationStep: item.investigationStep,
    };
  });

  return { items: items as AdaptiveInvestigationState["evidenceRegistry"]["items"] };
};

const parseHypothesisRegistry = (value: unknown): AdaptiveInvestigationState["hypothesisRegistry"] => {
  if (!isPlainObject(value) || !Array.isArray(value.items)) {
    throw new Error("Invalid AdaptiveInvestigationState");
  }

  return {
    items: parseHypotheses(value.items),
  };
};

const parseHistory = (value: unknown): AdaptiveInvestigationState["history"] => {
  if (!Array.isArray(value)) {
    throw new Error("Invalid AdaptiveInvestigationState");
  }

  return value.map((item) => {
    if (!isPlainObject(item)) {
      throw new Error("Invalid AdaptiveInvestigationState");
    }

    if (
      typeof item.id !== "string" ||
      typeof item.questionId !== "string" ||
      typeof item.questionAsked !== "string" ||
      typeof item.userAnswer !== "string" ||
      typeof item.whyQuestionWasAsked !== "string" ||
      typeof item.uncertaintyReduced !== "string" ||
      !isQuestionObjective(item.objective) ||
      !isStringArray(item.strengthenedHypotheses) ||
      !isStringArray(item.weakenedHypotheses) ||
      typeof item.confidenceBefore !== "number" ||
      typeof item.confidenceAfter !== "number" ||
      Number.isNaN(item.confidenceBefore) ||
      Number.isNaN(item.confidenceAfter) ||
      !isStringArray(item.remainingInformationGaps) ||
      typeof item.createdAt !== "string"
    ) {
      throw new Error("Invalid AdaptiveInvestigationState");
    }

    return {
      id: item.id,
      questionId: item.questionId,
      questionAsked: item.questionAsked,
      userAnswer: item.userAnswer,
      whyQuestionWasAsked: item.whyQuestionWasAsked,
      uncertaintyReduced: item.uncertaintyReduced,
      objective: item.objective,
      strengthenedHypotheses: item.strengthenedHypotheses,
      weakenedHypotheses: item.weakenedHypotheses,
      confidenceBefore: item.confidenceBefore,
      confidenceAfter: item.confidenceAfter,
      remainingInformationGaps: item.remainingInformationGaps,
      createdAt: item.createdAt,
    };
  });
};

const parseLifecycleAuditTrail = (value: unknown): AdaptiveInvestigationState["lifecycleAuditTrail"] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => {
    if (!isPlainObject(item)) {
      throw new Error("Invalid AdaptiveInvestigationState");
    }

    if (
      typeof item.id !== "string" ||
      typeof item.governanceEvaluationId !== "string" ||
      typeof item.hypothesisId !== "string" ||
      typeof item.hypothesisDescription !== "string" ||
      (item.previousStatus !== "Draft" &&
        item.previousStatus !== "Candidate" &&
        item.previousStatus !== "Plausible" &&
        item.previousStatus !== "Supported" &&
        item.previousStatus !== "Validated" &&
        item.previousStatus !== "Confirmed" &&
        item.previousStatus !== "Rejected") ||
      (item.newStatus !== "Draft" &&
        item.newStatus !== "Candidate" &&
        item.newStatus !== "Plausible" &&
        item.newStatus !== "Supported" &&
        item.newStatus !== "Validated" &&
        item.newStatus !== "Confirmed" &&
        item.newStatus !== "Rejected") ||
      typeof item.ruleApplied !== "string" ||
      (item.predominantCategory !== "Contextual" &&
        item.predominantCategory !== "Correlational" &&
        item.predominantCategory !== "Experimental" &&
        item.predominantCategory !== "Validation" &&
        item.predominantCategory !== "Contradictory") ||
      typeof item.promoterEvidenceId !== "string" ||
      (item.promoterEvidenceCategory !== "Contextual" &&
        item.promoterEvidenceCategory !== "Correlational" &&
        item.promoterEvidenceCategory !== "Experimental" &&
        item.promoterEvidenceCategory !== "Validation" &&
        item.promoterEvidenceCategory !== "Contradictory") ||
      typeof item.promoterEvidenceWeight !== "number" ||
      Number.isNaN(item.promoterEvidenceWeight) ||
      typeof item.promoterEvidenceQuality !== "number" ||
      Number.isNaN(item.promoterEvidenceQuality) ||
      typeof item.justification !== "string" ||
      typeof item.createdAt !== "string"
    ) {
      throw new Error("Invalid AdaptiveInvestigationState");
    }

    return {
      id: item.id,
      governanceEvaluationId: item.governanceEvaluationId,
      hypothesisId: item.hypothesisId,
      hypothesisDescription: item.hypothesisDescription,
      previousStatus: item.previousStatus,
      newStatus: item.newStatus,
      ruleApplied: item.ruleApplied,
      predominantCategory: item.predominantCategory,
      promoterEvidenceId: item.promoterEvidenceId,
      promoterEvidenceCategory: item.promoterEvidenceCategory,
      promoterEvidenceWeight: item.promoterEvidenceWeight,
      promoterEvidenceQuality: item.promoterEvidenceQuality,
      justification: item.justification,
      createdAt: item.createdAt,
    };
  });
};

const parseRuntimeTelemetry = (value: unknown): AdaptiveInvestigationState["runtimeTelemetry"] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((trace) => {
    if (!isPlainObject(trace)) {
      throw new Error("Invalid AdaptiveInvestigationState");
    }

    if (
      typeof trace.id !== "string" ||
      typeof trace.sessionId !== "string" ||
      typeof trace.runtimeId !== "string" ||
      typeof trace.requestId !== "string" ||
      typeof trace.retryCount !== "number" ||
      (trace.result !== "success" && trace.result !== "error" && trace.result !== "interrupted") ||
      (trace.interruptionReason !== undefined && typeof trace.interruptionReason !== "string") ||
      typeof trace.startedAt !== "string" ||
      typeof trace.endedAt !== "string" ||
      typeof trace.totalDurationMs !== "number" ||
      !Array.isArray(trace.moduleTimings) ||
      !Array.isArray(trace.events) ||
      !Array.isArray(trace.errors)
    ) {
      throw new Error("Invalid AdaptiveInvestigationState");
    }

    return {
      id: trace.id,
      sessionId: trace.sessionId,
      runtimeId: trace.runtimeId,
      requestId: trace.requestId,
      retryCount: trace.retryCount,
      result: trace.result,
      interruptionReason: trace.interruptionReason,
      startedAt: trace.startedAt,
      endedAt: trace.endedAt,
      totalDurationMs: trace.totalDurationMs,
      moduleTimings: trace.moduleTimings.map((timing) => {
        if (
          !isPlainObject(timing) ||
          typeof timing.module !== "string" ||
          typeof timing.startedAt !== "string" ||
          typeof timing.endedAt !== "string" ||
          typeof timing.durationMs !== "number" ||
          Number.isNaN(timing.durationMs)
        ) {
          throw new Error("Invalid AdaptiveInvestigationState");
        }

        return {
          module: timing.module,
          startedAt: timing.startedAt,
          endedAt: timing.endedAt,
          durationMs: timing.durationMs,
        };
      }),
      events: trace.events.map((event) => {
        if (
          !isPlainObject(event) ||
          typeof event.timestamp !== "string" ||
          typeof event.name !== "string" ||
          typeof event.details !== "string"
        ) {
          throw new Error("Invalid AdaptiveInvestigationState");
        }

        return {
          timestamp: event.timestamp,
          name: event.name,
          details: event.details,
        };
      }),
      errors: trace.errors.map((error) => {
        if (
          !isPlainObject(error) ||
          typeof error.timestamp !== "string" ||
          typeof error.module !== "string" ||
          typeof error.message !== "string"
        ) {
          throw new Error("Invalid AdaptiveInvestigationState");
        }

        return {
          timestamp: error.timestamp,
          module: error.module,
          message: error.message,
        };
      }),
    };
  });
};

export const AdaptiveInvestigationStateSchema = {
  parse(value: unknown): AdaptiveInvestigationState {
    if (!isPlainObject(value)) {
      throw new Error("Invalid AdaptiveInvestigationState");
    }

    if (value.artifact !== "AdaptiveInvestigationState") {
      throw new Error("Invalid AdaptiveInvestigationState");
    }

    if (typeof value.version !== "string") {
      throw new Error("Invalid AdaptiveInvestigationState");
    }

    if (typeof value.investigationId !== "string") {
      throw new Error("Invalid AdaptiveInvestigationState");
    }

    if (typeof value.createdAt !== "string" || typeof value.updatedAt !== "string") {
      throw new Error("Invalid AdaptiveInvestigationState");
    }

    if (value.status !== "ongoing" && value.status !== "ready-for-synthesis") {
      throw new Error("Invalid AdaptiveInvestigationState");
    }

    const parsedOperationalObject = tryParseOperationalObject(value.operationalObject);
    if (!parsedOperationalObject.success) {
      throw parsedOperationalObject.error;
    }

    if (!isStringArray(value.askedQuestionIds) || !isStringArray(value.knownInformation) || !isStringArray(value.remainingInformationGaps)) {
      throw new Error("Invalid AdaptiveInvestigationState");
    }

    if (typeof value.currentConfidence !== "number" || Number.isNaN(value.currentConfidence)) {
      throw new Error("Invalid AdaptiveInvestigationState");
    }

    const parsedHypotheses = parseHypotheses(value.hypotheses);

    const parsedEvidenceRegistry = value.evidenceRegistry
      ? parseEvidenceRegistry(value.evidenceRegistry)
      : {
          items: [],
        };

    const parsedHypothesisRegistry = value.hypothesisRegistry
      ? parseHypothesisRegistry(value.hypothesisRegistry)
      : { items: parsedHypotheses };

    const parsedInvestigationOutput: AdaptiveInvestigationState["investigationOutput"] = (() => {
      if (!isPlainObject(value.investigationOutput)) {
        return {
          problem: parsedOperationalObject.data.problemStatement,
          hypotheses: parsedHypotheses.map((hypothesis) => ({
            id: hypothesis.id,
            description: hypothesis.description,
            confidence: hypothesis.confidence,
            lifecycleStatus: hypothesis.lifecycleStatus,
            reasoningSummary: hypothesis.reasoningSummary,
          })),
          confidence: {
            global: value.currentConfidence,
            strongestHypothesisId: parsedHypotheses[0]?.id ?? null,
          },
          evidence: {
            supporting: parsedEvidenceRegistry.items.filter((item) => item.relation === "Support"),
            contradicting: parsedEvidenceRegistry.items.filter((item) => item.relation === "Contradiction"),
          },
          missingEvidence: Array.from(
            new Set(parsedHypotheses.flatMap((hypothesis) => hypothesis.missingEvidence))
          ),
          recommendedInvestigation:
            parsedHypotheses[0]?.nextRecommendedInvestigation ||
            "Coletar evidências objetivas adicionais para reduzir incerteza.",
          decision: {
            status: "insufficient-evidence" as const,
            rationale: "Estado legado sem saída investigativa consolidada.",
          },
        };
      }

      const output = value.investigationOutput;
      const decision = isPlainObject(output.decision) ? output.decision : {};
      const confidence = isPlainObject(output.confidence) ? output.confidence : {};
      const evidence = isPlainObject(output.evidence) ? output.evidence : {};

      const decisionStatus: "insufficient-evidence" | "investigate-further" | "ready-for-decision" =
        decision.status === "insufficient-evidence" ||
        decision.status === "investigate-further" ||
        decision.status === "ready-for-decision"
          ? decision.status
          : "insufficient-evidence";

      return {
        problem: typeof output.problem === "string" ? output.problem : parsedOperationalObject.data.problemStatement,
        hypotheses: Array.isArray(output.hypotheses)
          ? output.hypotheses
              .filter(isPlainObject)
              .filter(
                (hypothesis) =>
                  typeof hypothesis.id === "string" &&
                  typeof hypothesis.description === "string" &&
                  typeof hypothesis.confidence === "number" &&
                  !Number.isNaN(hypothesis.confidence) &&
                  (hypothesis.lifecycleStatus === "Draft" ||
                    hypothesis.lifecycleStatus === "Candidate" ||
                    hypothesis.lifecycleStatus === "Plausible" ||
                    hypothesis.lifecycleStatus === "Supported" ||
                    hypothesis.lifecycleStatus === "Validated" ||
                    hypothesis.lifecycleStatus === "Confirmed" ||
                    hypothesis.lifecycleStatus === "Rejected") &&
                  typeof hypothesis.reasoningSummary === "string"
              )
              .map((hypothesis) => ({
                id: hypothesis.id as string,
                description: hypothesis.description as string,
                confidence: hypothesis.confidence as number,
                lifecycleStatus: hypothesis.lifecycleStatus as
                  | "Draft"
                  | "Candidate"
                  | "Plausible"
                  | "Supported"
                  | "Validated"
                  | "Confirmed"
                  | "Rejected",
                reasoningSummary: hypothesis.reasoningSummary as string,
              }))
          : parsedHypotheses.map((hypothesis) => ({
              id: hypothesis.id,
              description: hypothesis.description,
              confidence: hypothesis.confidence,
              lifecycleStatus: hypothesis.lifecycleStatus,
              reasoningSummary: hypothesis.reasoningSummary,
            })),
        confidence: {
          global:
            typeof confidence.global === "number" && !Number.isNaN(confidence.global)
              ? confidence.global
              : value.currentConfidence,
          strongestHypothesisId:
            typeof confidence.strongestHypothesisId === "string" || confidence.strongestHypothesisId === null
              ? confidence.strongestHypothesisId
              : null,
        },
        evidence: {
          supporting: Array.isArray(evidence.supporting)
            ? parsedEvidenceRegistry.items.filter((item) => item.relation === "Support")
            : parsedEvidenceRegistry.items.filter((item) => item.relation === "Support"),
          contradicting: Array.isArray(evidence.contradicting)
            ? parsedEvidenceRegistry.items.filter((item) => item.relation === "Contradiction")
            : parsedEvidenceRegistry.items.filter((item) => item.relation === "Contradiction"),
        },
        missingEvidence: isStringArray(output.missingEvidence)
          ? output.missingEvidence
          : Array.from(new Set(parsedHypotheses.flatMap((hypothesis) => hypothesis.missingEvidence))),
        recommendedInvestigation:
          typeof output.recommendedInvestigation === "string"
            ? output.recommendedInvestigation
            : parsedHypotheses[0]?.nextRecommendedInvestigation ||
              "Coletar evidências objetivas adicionais para reduzir incerteza.",
        decision: {
          status: decisionStatus,
          rationale:
            typeof decision.rationale === "string"
              ? decision.rationale
              : "A investigação ainda está em consolidação de evidências.",
        },
      };
    })();

    const parsedState: AdaptiveInvestigationState = {
      artifact: value.artifact,
      version: value.version,
      investigationId: value.investigationId,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
      status: value.status,
      operationalObject: parsedOperationalObject.data,
      currentQuestion: parseCurrentQuestion(value.currentQuestion),
      askedQuestionIds: value.askedQuestionIds,
      knownInformation: value.knownInformation,
      evidenceRegistry: parsedEvidenceRegistry,
      hypothesisRegistry: parsedHypothesisRegistry,
      hypotheses: parsedHypotheses,
      history: parseHistory(value.history),
      lifecycleAuditTrail: parseLifecycleAuditTrail(value.lifecycleAuditTrail),
      remainingInformationGaps: value.remainingInformationGaps,
      currentConfidence: value.currentConfidence,
      investigationOutput: parsedInvestigationOutput,
      runtimeTelemetry: parseRuntimeTelemetry(value.runtimeTelemetry),
    };

    runtimeStateAuthenticator.assertAuthentic(parsedState);

    return parsedState;
  },
} as const;
