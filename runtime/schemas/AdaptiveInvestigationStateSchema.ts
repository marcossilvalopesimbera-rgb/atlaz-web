import { AdaptiveInvestigationState } from "../artifacts/AdaptiveInvestigationState";
import { tryParseOperationalObject } from "./OperationalObjectRecovery";

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
    const status =
      item.status === "Active" || item.status === "Confirmed" || item.status === "Discarded"
        ? item.status
        : "Active";

    return {
      id: item.id,
      description,
      confidence: item.confidence,
      supportingEvidence,
      contradictingEvidence,
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

    return {
      id: item.id,
      title: item.title,
      source: item.source,
      confidence: item.confidence,
      investigationStep: item.investigationStep,
    };
  });

  return { items };
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

    return {
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
      remainingInformationGaps: value.remainingInformationGaps,
      currentConfidence: value.currentConfidence,
    };
  },
} as const;
