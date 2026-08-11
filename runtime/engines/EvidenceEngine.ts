import { EvidenceModel } from "../artifacts/EvidenceModel";
import { AdaptiveInvestigationState } from "../artifacts/AdaptiveInvestigationState";

export default class EvidenceEngine {
  constructor() {}

  public build(state?: AdaptiveInvestigationState): EvidenceModel {
    const evidenceItems = (state?.evidenceRegistry.items ?? []).map((item) => ({
      id: item.id,
      source: item.origin,
      summary: `${item.question} | ${item.answer}`,
      reliability: item.confidence,
      relatedHypothesisIds: [item.relatedHypothesisId],
    }));

    return {
      artifact: "EvidenceModel",
      version: "1.1.0",
      operationalObjectId: state?.investigationId ?? "unavailable",
      evidenceItems,
      confidence:
        evidenceItems.length > 0
          ? evidenceItems.reduce((acc, item) => acc + item.reliability, 0) / evidenceItems.length
          : 0,
    };
  }
}