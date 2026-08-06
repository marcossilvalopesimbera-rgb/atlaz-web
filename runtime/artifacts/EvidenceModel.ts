export interface EvidenceModel {
  artifact: "EvidenceModel";
  version: string;
  operationalObjectId: string;
  evidenceItems: {
    id: string;
    source: string;
    summary: string;
    reliability: number;
    relatedHypothesisIds: string[];
  }[];
  confidence: number;
}